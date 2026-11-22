#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio;
mod config;
mod hotkeys;
mod icons;
mod media;
mod tray;

use audio::{AudioCommand, AudioEngine};
use config::{read_windows_accent_hex, read_windows_theme_is_light, AppConfig, Preset};
use hotkeys::HotkeyManager;
use media::{MediaCommand, MediaController, SpotifyMediaState};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tao::dpi::LogicalSize;
use tao::event::{Event, WindowEvent};
use tao::event_loop::{ControlFlow, EventLoop};
use tao::window::{Icon as TaoIcon, WindowBuilder};
use tray::{TrayAction, TrayManager};
use wry::WebViewBuilder;

const INDEX_HTML: &str = include_str!("../static/index.html");
const STYLES_CSS: &str = include_str!("../static/styles.css");
const APP_JS: &str = include_str!("../static/app.js");

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum IpcMessage {
    TogglePin,
    SetFade { ms: u64 },
    SetTheme { mode: String },
    SetAccent { color: String },
    SetLanguage { lang: String },
    ApplyPreset { id: String },
    SetMasterVolume { volume: f32 },
    SetMasterMute { muted: bool },
    SetAppVolume { exe_key: String, volume: f32 },
    SetAppMute { exe_key: String, muted: bool },
    SavePreset { preset: Preset },
    DeletePreset { id: String },
    MediaTogglePlay,
    MediaNext,
    MediaPrev,
}

#[derive(Serialize)]
struct UiChannel<'a> {
    exe_key: &'a str,
    display_name: &'a str,
    icon_url: Option<&'a str>,
    volume: f32,
    muted: bool,
    peak: f32,
    is_active: bool,
}

#[derive(Serialize)]
struct UiState<'a> {
    always_on_top: bool,
    fade_duration_ms: u64,
    theme_mode: &'a str,
    resolved_theme: &'a str,
    accent_color: &'a str,
    system_accent_hex: String,
    language: &'a str,
    presets: &'a [Preset],
    active_preset_id: Option<&'a str>,
    conflicts: Vec<String>,
    master_volume: f32,
    master_muted: bool,
    master_peak: f32,
    channels: Vec<UiChannel<'a>>,
    device_error: Option<&'a str>,
    spotify: SpotifyMediaState,
    toast: Option<&'a str>,
}

fn build_state_json(
    config: &AppConfig,
    audio: &AudioEngine,
    hotkeys: &HotkeyManager,
    media: &MediaController,
    active_preset_id: Option<&str>,
    icon_cache: &mut HashMap<String, Option<String>>,
    toast: Option<&str>,
) -> String {
    let snap = audio.snapshot();
    for ch in &snap.channels {
        if !ch.exe_path.is_empty() && !icon_cache.contains_key(&ch.exe_path) {
            let url = audio
                .get_icon(&ch.exe_path)
                .and_then(|rgba| rgba.to_png_data_url());
            icon_cache.insert(ch.exe_path.clone(), url);
        }
    }

    let channels = snap
        .channels
        .iter()
        .map(|ch| UiChannel {
            exe_key: &ch.exe_key,
            display_name: &ch.display_name,
            icon_url: icon_cache
                .get(&ch.exe_path)
                .and_then(|opt| opt.as_deref()),
            volume: ch.volume,
            muted: ch.muted,
            peak: ch.peak,
            is_active: ch.is_active,
        })
        .collect();

    let resolved_theme = match config.theme_mode.as_str() {
        "light" => "light",
        "dark" => "dark",
        _ => {
            if read_windows_theme_is_light() {
                "light"
            } else {
                "dark"
            }
        }
    };

    let state = UiState {
        always_on_top: config.always_on_top,
        fade_duration_ms: config.fade_duration_ms,
        theme_mode: &config.theme_mode,
        resolved_theme,
        accent_color: &config.accent_color,
        system_accent_hex: read_windows_accent_hex(),
        language: &config.language,
        presets: &config.presets,
        active_preset_id,
        conflicts: hotkeys.get_conflicts(),
        master_volume: snap.master_volume,
        master_muted: snap.master_muted,
        master_peak: snap.master_peak,
        channels,
        device_error: snap.device_error.as_deref(),
        spotify: media.snapshot(),
        toast,
    };

    serde_json::to_string(&state).unwrap_or_else(|_| "{}".to_string())
}

fn build_app_html(initial_state_json: &str) -> String {
    INDEX_HTML
        .replace(
            "<!--__INLINE_CSS__-->",
            &format!("<style>{}</style>", STYLES_CSS),
        )
        .replace(
            "<!--__INLINE_JS__-->",
            &format!(
                "<script>window.__INITIAL_STATE__ = {};</script><script>{}</script>",
                initial_state_json, APP_JS
            ),
        )
}

fn main() -> wry::Result<()> {
    let mut config = AppConfig::load();
    let noop_cb: Arc<dyn Fn() + Send + Sync> = Arc::new(|| {});

    let audio = AudioEngine::start(Arc::clone(&noop_cb));
    let hotkeys = HotkeyManager::start(&config.presets, Arc::clone(&noop_cb));
    let media = MediaController::start();
    let mut tray = TrayManager::new(&config.presets, noop_cb);

    let mut icon_cache: HashMap<String, Option<String>> = HashMap::new();
    let mut active_preset_id: Option<String> = None;

    let initial_json = build_state_json(
        &config,
        &audio,
        &hotkeys,
        &media,
        active_preset_id.as_deref(),
        &mut icon_cache,
        None,
    );
    let html = build_app_html(&initial_json);

    let icon_rgba = tray::generate_console_icon_rgba(32);
    let window_icon = TaoIcon::from_rgba(icon_rgba, 32, 32).ok();

    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
        .with_title("My mixer")
        .with_inner_size(LogicalSize::new(380.0, 600.0))
        .with_min_inner_size(LogicalSize::new(330.0, 460.0))
        .with_always_on_top(config.always_on_top)
        .with_window_icon(window_icon)
        .build(&event_loop)
        .expect("No se pudo crear la ventana");

    let (ipc_tx, ipc_rx): (Sender<IpcMessage>, Receiver<IpcMessage>) = mpsc::channel();

    let webview = WebViewBuilder::new()
        .with_html(html)
        .with_devtools(false)
        .with_ipc_handler(move |req| {
            if let Ok(msg) = serde_json::from_str::<IpcMessage>(req.body()) {
                let _ = ipc_tx.send(msg);
            }
        })
        .build(&window)?;

    let mut is_visible = true;
    let mut last_push = Instant::now();

    event_loop.run(move |event, _, control_flow| {
        let next_tick = Instant::now() + Duration::from_millis(33);
        *control_flow = ControlFlow::WaitUntil(next_tick);

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => {
                if config.minimize_to_tray_on_close && tray.is_some() {
                    window.set_visible(false);
                    is_visible = false;
                } else {
                    *control_flow = ControlFlow::Exit;
                }
            }
            Event::MainEventsCleared => {
                let mut pending_toast: Option<String> = None;

                while let Some(pid) = hotkeys.try_recv_triggered() {
                    if let Some(p) = config.presets.iter().find(|p| p.id == pid).cloned() {
                        audio.send(AudioCommand::ApplyPreset {
                            rules: p.rules,
                            fade_duration_ms: config.fade_duration_ms,
                        });
                        active_preset_id = Some(p.id);
                        pending_toast = Some(format!("Preset: {}", p.name));
                    }
                }

                if let Some(ref t) = tray {
                    for action in t.poll_actions() {
                        match action {
                            TrayAction::ShowWindow => {
                                window.set_visible(true);
                                window.set_minimized(false);
                                window.set_focus();
                                is_visible = true;
                            }
                            TrayAction::TriggerPreset(pid) => {
                                if let Some(p) = config.presets.iter().find(|p| p.id == pid).cloned()
                                {
                                    audio.send(AudioCommand::ApplyPreset {
                                        rules: p.rules,
                                        fade_duration_ms: config.fade_duration_ms,
                                    });
                                    active_preset_id = Some(p.id);
                                    pending_toast = Some(format!("Preset: {}", p.name));
                                }
                            }
                            TrayAction::Quit => {
                                *control_flow = ControlFlow::Exit;
                                return;
                            }
                        }
                    }
                }

                while let Ok(msg) = ipc_rx.try_recv() {
                    match msg {
                        IpcMessage::TogglePin => {
                            config.always_on_top = !config.always_on_top;
                            window.set_always_on_top(config.always_on_top);
                            let _ = config.save();
                        }
                        IpcMessage::SetFade { ms } => {
                            config.fade_duration_ms = ms;
                            let _ = config.save();
                        }
                        IpcMessage::SetTheme { mode } => {
                            config.theme_mode = match mode.as_str() {
                                "light" => "light".to_string(),
                                "dark" => "dark".to_string(),
                                _ => "system".to_string(),
                            };
                            let _ = config.save();
                        }
                        IpcMessage::SetAccent { color } => {
                            config.accent_color = color;
                            let _ = config.save();
                        }
                        IpcMessage::SetLanguage { lang } => {
                            config.language = lang;
                            let _ = config.save();
                        }
                        IpcMessage::ApplyPreset { id } => {
                            if let Some(p) = config.presets.iter().find(|p| p.id == id).cloned() {
                                audio.send(AudioCommand::ApplyPreset {
                                    rules: p.rules,
                                    fade_duration_ms: config.fade_duration_ms,
                                });
                                active_preset_id = Some(p.id);
                                pending_toast = Some(format!("Preset: {}", p.name));
                            }
                        }
                        IpcMessage::SetMasterVolume { volume } => {
                            audio.send(AudioCommand::SetMasterVolume(volume));
                        }
                        IpcMessage::SetMasterMute { muted } => {
                            audio.send(AudioCommand::SetMasterMute(muted));
                        }
                        IpcMessage::SetAppVolume { exe_key, volume } => {
                            audio.send(AudioCommand::SetAppVolume { exe_key, volume });
                        }
                        IpcMessage::SetAppMute { exe_key, muted } => {
                            audio.send(AudioCommand::SetAppMute { exe_key, muted });
                        }
                        IpcMessage::SavePreset { preset } => {
                            if let Some(existing) =
                                config.presets.iter_mut().find(|p| p.id == preset.id)
                            {
                                *existing = preset;
                            } else {
                                config.presets.push(preset);
                            }
                            let _ = config.save();
                            hotkeys.update_from_presets(&config.presets);
                            if let Some(ref mut t) = tray {
                                t.rebuild_menu(&config.presets);
                            }
                            pending_toast = Some("Preset guardado".to_string());
                        }
                        IpcMessage::DeletePreset { id } => {
                            config.presets.retain(|p| p.id != id);
                            let _ = config.save();
                            hotkeys.update_from_presets(&config.presets);
                            if let Some(ref mut t) = tray {
                                t.rebuild_menu(&config.presets);
                            }
                        }
                        IpcMessage::MediaTogglePlay => media.send(MediaCommand::TogglePlayPause),
                        IpcMessage::MediaNext => media.send(MediaCommand::Next),
                        IpcMessage::MediaPrev => media.send(MediaCommand::Previous),
                    }
                }

                if is_visible && last_push.elapsed() >= Duration::from_millis(33) {
                    let json = build_state_json(
                        &config,
                        &audio,
                        &hotkeys,
                        &media,
                        active_preset_id.as_deref(),
                        &mut icon_cache,
                        pending_toast.as_deref(),
                    );
                    let script = format!("window.__onAudioState && window.__onAudioState({});", json);
                    let _ = webview.evaluate_script(&script);
                    last_push = Instant::now();
                }
            }
            _ => {}
        }
    });
}
