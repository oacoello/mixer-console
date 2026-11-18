use crate::config::PresetRule;
use crate::icons::{extract_exe_icon, RgbaIcon};
use std::collections::{BTreeMap, HashMap};
use std::path::Path;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use windows::core::{Interface, PWSTR};
use windows::Win32::Foundation::{CloseHandle, S_OK};
use windows::Win32::Media::Audio::Endpoints::{IAudioEndpointVolume, IAudioMeterInformation};
use windows::Win32::Media::Audio::{
    eMultimedia, eRender, AudioSessionStateExpired, IAudioSessionControl2, IAudioSessionManager2,
    IMMDeviceEnumerator, ISimpleAudioVolume, MMDeviceEnumerator,
};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CoTaskMemFree, CoUninitialize, CLSCTX_ALL,
    COINIT_MULTITHREADED,
};
use windows::Win32::System::Threading::{
    OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
    PROCESS_QUERY_LIMITED_INFORMATION,
};

#[derive(Clone, Debug)]
pub struct AppChannelState {
    /// Clave única en minúsculas: ej. "spotify.exe", "chrome.exe", "__system__"
    pub exe_key: String,
    /// Nombre amigable para mostrar
    pub display_name: String,
    /// Ruta completa al ejecutable (para extraer ícono)
    pub exe_path: String,
    /// Volumen actual (0.0..=1.0)
    pub volume: f32,
    /// Silenciado a nivel de sistema
    pub muted: bool,
    /// Nivel de pico en tiempo real (0.0..=1.0)
    pub peak: f32,
    /// Si está reproduciendo audio activamente
    pub is_active: bool,
}

#[derive(Clone, Debug, Default)]
pub struct AudioSnapshot {
    pub master_volume: f32,
    pub master_muted: bool,
    pub master_peak: f32,
    pub channels: Vec<AppChannelState>,
    pub device_error: Option<String>,
    pub active_fade_progress: Option<f32>,
}

pub enum AudioCommand {
    SetMasterVolume(f32),
    SetMasterMute(bool),
    SetAppVolume { exe_key: String, volume: f32 },
    SetAppMute { exe_key: String, muted: bool },
    ApplyPreset {
        rules: Vec<PresetRule>,
        fade_duration_ms: u64,
    },
}

struct ActiveFadeItem {
    target_exe: String,
    start_volume: f32,
    target_volume: f32,
    target_muted: bool,
    unmuted_at_start: bool,
}

struct ActiveFade {
    started_at: Instant,
    duration: Duration,
    items: Vec<ActiveFadeItem>,
}

pub struct AudioEngine {
    snapshot: Arc<Mutex<AudioSnapshot>>,
    icon_cache: Arc<Mutex<HashMap<String, Option<RgbaIcon>>>>,
    tx: Sender<AudioCommand>,
}

impl AudioEngine {
    pub fn start(repaint_cb: Arc<dyn Fn() + Send + Sync>) -> Self {
        let snapshot = Arc::new(Mutex::new(AudioSnapshot::default()));
        let icon_cache = Arc::new(Mutex::new(HashMap::new()));
        let (tx, rx) = mpsc::channel::<AudioCommand>();

        let snap_clone = Arc::clone(&snapshot);
        let icons_clone = Arc::clone(&icon_cache);

        thread::spawn(move || {
            audio_worker_loop(rx, snap_clone, icons_clone, repaint_cb);
        });

        Self {
            snapshot,
            icon_cache,
            tx,
        }
    }

    pub fn snapshot(&self) -> AudioSnapshot {
        self.snapshot.lock().map(|s| s.clone()).unwrap_or_default()
    }

    pub fn get_icon(&self, exe_path: &str) -> Option<RgbaIcon> {
        if exe_path.is_empty() {
            return None;
        }
        let guard = self.icon_cache.lock().ok()?;
        guard.get(exe_path).cloned().flatten()
    }

    pub fn send(&self, cmd: AudioCommand) {
        let _ = self.tx.send(cmd);
    }
}

fn audio_worker_loop(
    rx: Receiver<AudioCommand>,
    snapshot_arc: Arc<Mutex<AudioSnapshot>>,
    icon_cache: Arc<Mutex<HashMap<String, Option<RgbaIcon>>>>,
    repaint_cb: Arc<dyn Fn() + Send + Sync>,
) {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
    }

    let mut active_fade: Option<ActiveFade> = None;
    let mut last_ui_repaint = Instant::now();

    loop {
        // Procesar todos los comandos pendientes
        while let Ok(cmd) = rx.try_recv() {
            match cmd {
                AudioCommand::SetMasterVolume(v) => {
                    if let Some(ref mut fade) = active_fade {
                        fade.items.retain(|i| i.target_exe != "__master__");
                    }
                    unsafe {
                        let _ = set_master_volume_raw(v.clamp(0.0, 1.0));
                    }
                }
                AudioCommand::SetMasterMute(m) => {
                    if let Some(ref mut fade) = active_fade {
                        fade.items.retain(|i| i.target_exe != "__master__");
                    }
                    unsafe {
                        let _ = set_master_mute_raw(m);
                    }
                }
                AudioCommand::SetAppVolume { exe_key, volume } => {
                    if let Some(ref mut fade) = active_fade {
                        fade.items.retain(|i| i.target_exe != exe_key);
                    }
                    unsafe {
                        let _ = set_app_volume_raw(&exe_key, volume.clamp(0.0, 1.0));
                    }
                }
                AudioCommand::SetAppMute { exe_key, muted } => {
                    if let Some(ref mut fade) = active_fade {
                        fade.items.retain(|i| i.target_exe != exe_key);
                    }
                    unsafe {
                        let _ = set_app_mute_raw(&exe_key, muted);
                    }
                }
                AudioCommand::ApplyPreset {
                    rules,
                    fade_duration_ms,
                } => {
                    let current = unsafe { poll_audio_state(&icon_cache) };
                    if fade_duration_ms == 0 {
                        for rule in &rules {
                            unsafe {
                                if rule.target_exe == "__master__" {
                                    let _ = set_master_volume_raw(rule.volume.clamp(0.0, 1.0));
                                    let _ = set_master_mute_raw(rule.muted);
                                } else {
                                    let _ = set_app_volume_raw(
                                        &rule.target_exe,
                                        rule.volume.clamp(0.0, 1.0),
                                    );
                                    let _ = set_app_mute_raw(&rule.target_exe, rule.muted);
                                }
                            }
                        }
                        active_fade = None;
                    } else {
                        let mut items = Vec::new();
                        for rule in rules {
                            let start_volume = if rule.target_exe == "__master__" {
                                current.master_volume
                            } else {
                                current
                                    .channels
                                    .iter()
                                    .find(|c| c.exe_key == rule.target_exe)
                                    .map(|c| c.volume)
                                    .unwrap_or(rule.volume)
                            };
                            items.push(ActiveFadeItem {
                                target_exe: rule.target_exe,
                                start_volume,
                                target_volume: rule.volume.clamp(0.0, 1.0),
                                target_muted: rule.muted,
                                unmuted_at_start: false,
                            });
                        }
                        active_fade = Some(ActiveFade {
                            started_at: Instant::now(),
                            duration: Duration::from_millis(fade_duration_ms),
                            items,
                        });
                    }
                }
            }
        }

        // Actualizar transición suave (fade) si hay una activa
        let mut fade_progress = None;
        if let Some(ref mut fade) = active_fade {
            let elapsed = fade.started_at.elapsed();
            let raw_t = (elapsed.as_secs_f32() / fade.duration.as_secs_f32()).clamp(0.0, 1.0);
            // Smoothstep easing para una curva de audio natural
            let eased_t = raw_t * raw_t * (3.0 - 2.0 * raw_t);
            fade_progress = Some(raw_t);

            for item in &mut fade.items {
                if !item.target_muted && !item.unmuted_at_start {
                    unsafe {
                        if item.target_exe == "__master__" {
                            let _ = set_master_mute_raw(false);
                        } else {
                            let _ = set_app_mute_raw(&item.target_exe, false);
                        }
                    }
                    item.unmuted_at_start = true;
                }

                let vol = item.start_volume + (item.target_volume - item.start_volume) * eased_t;
                unsafe {
                    if item.target_exe == "__master__" {
                        let _ = set_master_volume_raw(vol);
                        if raw_t >= 1.0 && item.target_muted {
                            let _ = set_master_mute_raw(true);
                        }
                    } else {
                        let _ = set_app_volume_raw(&item.target_exe, vol);
                        if raw_t >= 1.0 && item.target_muted {
                            let _ = set_app_mute_raw(&item.target_exe, true);
                        }
                    }
                }
            }

            if raw_t >= 1.0 || fade.items.is_empty() {
                active_fade = None;
                fade_progress = None;
            }
        }

        // Leer estado actual de WASAPI (volúmenes + picos en tiempo real)
        let mut new_snap = unsafe { poll_audio_state(&icon_cache) };
        new_snap.active_fade_progress = fade_progress;

        if let Ok(mut guard) = snapshot_arc.lock() {
            *guard = new_snap;
        }

        // Solicitar repintado de UI (~30-60 FPS)
        if last_ui_repaint.elapsed() >= Duration::from_millis(25) {
            repaint_cb();
            last_ui_repaint = Instant::now();
        }

        thread::sleep(Duration::from_millis(16));
    }

    #[allow(unreachable_code)]
    unsafe {
        CoUninitialize();
    }
}

unsafe fn get_default_device() -> windows::core::Result<windows::Win32::Media::Audio::IMMDevice> {
    let enumerator: IMMDeviceEnumerator =
        CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)?;
    enumerator.GetDefaultAudioEndpoint(eRender, eMultimedia)
}

unsafe fn set_master_volume_raw(level: f32) -> windows::core::Result<()> {
    let device = get_default_device()?;
    let endpoint: IAudioEndpointVolume = device.Activate(CLSCTX_ALL, None)?;
    endpoint.SetMasterVolumeLevelScalar(level, std::ptr::null())
}

unsafe fn set_master_mute_raw(muted: bool) -> windows::core::Result<()> {
    let device = get_default_device()?;
    let endpoint: IAudioEndpointVolume = device.Activate(CLSCTX_ALL, None)?;
    endpoint.SetMute(muted, std::ptr::null())
}

unsafe fn set_app_volume_raw(target_exe: &str, level: f32) -> windows::core::Result<()> {
    let device = get_default_device()?;
    let manager: IAudioSessionManager2 = device.Activate(CLSCTX_ALL, None)?;
    let enumerator = manager.GetSessionEnumerator()?;
    let count = enumerator.GetCount()?;

    for i in 0..count {
        let Ok(control) = enumerator.GetSession(i) else {
            continue;
        };
        let Ok(control2) = control.cast::<IAudioSessionControl2>() else {
            continue;
        };
        let (exe_key, _, _) = identify_session(&control2);
        if exe_key == target_exe {
            if let Ok(vol) = control.cast::<ISimpleAudioVolume>() {
                let _ = vol.SetMasterVolume(level, std::ptr::null());
            }
        }
    }
    Ok(())
}

unsafe fn set_app_mute_raw(target_exe: &str, muted: bool) -> windows::core::Result<()> {
    let device = get_default_device()?;
    let manager: IAudioSessionManager2 = device.Activate(CLSCTX_ALL, None)?;
    let enumerator = manager.GetSessionEnumerator()?;
    let count = enumerator.GetCount()?;

    for i in 0..count {
        let Ok(control) = enumerator.GetSession(i) else {
            continue;
        };
        let Ok(control2) = control.cast::<IAudioSessionControl2>() else {
            continue;
        };
        let (exe_key, _, _) = identify_session(&control2);
        if exe_key == target_exe {
            if let Ok(vol) = control.cast::<ISimpleAudioVolume>() {
                let _ = vol.SetMute(muted, std::ptr::null());
            }
        }
    }
    Ok(())
}

unsafe fn poll_audio_state(
    icon_cache: &Arc<Mutex<HashMap<String, Option<RgbaIcon>>>>,
) -> AudioSnapshot {
    let mut snap = AudioSnapshot::default();

    let device = match get_default_device() {
        Ok(d) => d,
        Err(e) => {
            snap.device_error = Some(format!("Sin dispositivo de audio predeterminado: {e}"));
            return snap;
        }
    };

    if let Ok(endpoint) = device.Activate::<IAudioEndpointVolume>(CLSCTX_ALL, None) {
        snap.master_volume = endpoint.GetMasterVolumeLevelScalar().unwrap_or(1.0);
        snap.master_muted = endpoint
            .GetMute()
            .map(|b| b.as_bool())
            .unwrap_or(false);
    }

    if let Ok(meter) = device.Activate::<IAudioMeterInformation>(CLSCTX_ALL, None) {
        snap.master_peak = meter.GetPeakValue().unwrap_or(0.0).clamp(0.0, 1.0);
    }

    let Ok(manager) = device.Activate::<IAudioSessionManager2>(CLSCTX_ALL, None) else {
        return snap;
    };
    let Ok(enumerator) = manager.GetSessionEnumerator() else {
        return snap;
    };
    let count = enumerator.GetCount().unwrap_or(0);

    let mut grouped: BTreeMap<String, AppChannelState> = BTreeMap::new();

    for i in 0..count {
        let Ok(control) = enumerator.GetSession(i) else {
            continue;
        };
        let Ok(control2) = control.cast::<IAudioSessionControl2>() else {
            continue;
        };

        if let Ok(state) = control.GetState() {
            if state == AudioSessionStateExpired {
                continue;
            }
        }

        let (exe_key, display_name, exe_path) = identify_session(&control2);
        if exe_key.is_empty() {
            continue;
        }

        // Cachear ícono si aún no se extrajo
        if !exe_path.is_empty() {
            let needs_extract = icon_cache
                .lock()
                .map(|c| !c.contains_key(&exe_path))
                .unwrap_or(false);
            if needs_extract {
                let extracted = extract_exe_icon(&exe_path);
                if let Ok(mut c) = icon_cache.lock() {
                    c.insert(exe_path.clone(), extracted);
                }
            }
        }

        let (volume, muted) = if let Ok(vol) = control.cast::<ISimpleAudioVolume>() {
            (
                vol.GetMasterVolume().unwrap_or(1.0).clamp(0.0, 1.0),
                vol.GetMute().map(|b| b.as_bool()).unwrap_or(false),
            )
        } else {
            (1.0, false)
        };

        let peak = if let Ok(meter) = control.cast::<IAudioMeterInformation>() {
            meter.GetPeakValue().unwrap_or(0.0).clamp(0.0, 1.0)
        } else {
            0.0
        };

        let is_active = peak > 0.002;

        grouped
            .entry(exe_key.clone())
            .and_modify(|existing| {
                existing.peak = existing.peak.max(peak);
                existing.is_active |= is_active;
                if existing.exe_path.is_empty() && !exe_path.is_empty() {
                    existing.exe_path = exe_path.clone();
                }
            })
            .or_insert(AppChannelState {
                exe_key,
                display_name,
                exe_path,
                volume,
                muted,
                peak,
                is_active,
            });
    }

    let mut channels: Vec<AppChannelState> = grouped.into_values().collect();
    // Ordenar: primero los que están sonando activamente o tienen nombre alfabético
    channels.sort_by(|a, b| {
        (a.exe_key == "__system__")
            .cmp(&(b.exe_key == "__system__"))
            .then_with(|| a.display_name.to_lowercase().cmp(&b.display_name.to_lowercase()))
    });

    snap.channels = channels;
    snap
}

unsafe fn identify_session(control2: &IAudioSessionControl2) -> (String, String, String) {
    if control2.IsSystemSoundsSession() == S_OK {
        return (
            "__system__".to_string(),
            "Sonidos del sistema".to_string(),
            String::new(),
        );
    }

    let pid = control2.GetProcessId().unwrap_or(0);
    let exe_path = if pid != 0 {
        get_process_exe_path(pid).unwrap_or_default()
    } else {
        String::new()
    };

    if !exe_path.is_empty() {
        let file_name = Path::new(&exe_path)
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("app.exe")
            .to_lowercase();
        let friendly = friendly_app_name(&file_name, control2);
        return (file_name, friendly, exe_path);
    }

    let disp = get_session_display_name(control2);
    if !disp.is_empty() {
        let key = format!("session:{}", disp.to_lowercase());
        return (key, disp, String::new());
    }

    (String::new(), String::new(), String::new())
}

unsafe fn get_session_display_name(control2: &IAudioSessionControl2) -> String {
    if let Ok(pwstr) = control2.GetDisplayName() {
        if !pwstr.is_null() {
            let s = pwstr_to_string(pwstr);
            CoTaskMemFree(Some(pwstr.0 as *const _));
            if !s.starts_with('@') && !s.trim().is_empty() {
                return s;
            }
        }
    }
    String::new()
}

unsafe fn pwstr_to_string(pwstr: PWSTR) -> String {
    if pwstr.is_null() {
        return String::new();
    }
    let mut len = 0;
    while *pwstr.0.add(len) != 0 {
        len += 1;
    }
    let slice = std::slice::from_raw_parts(pwstr.0, len);
    String::from_utf16_lossy(slice)
}

unsafe fn get_process_exe_path(pid: u32) -> Option<String> {
    let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid).ok()?;
    let mut buf = vec![0u16; 1024];
    let mut size = buf.len() as u32;
    let ok = QueryFullProcessImageNameW(
        handle,
        PROCESS_NAME_FORMAT(0),
        PWSTR(buf.as_mut_ptr()),
        &mut size,
    )
    .is_ok();
    let _ = CloseHandle(handle);

    if ok && size > 0 {
        Some(String::from_utf16_lossy(&buf[..size as usize]))
    } else {
        None
    }
}

unsafe fn friendly_app_name(exe_lower: &str, control2: &IAudioSessionControl2) -> String {
    match exe_lower {
        "spotify.exe" => "Spotify".to_string(),
        "chrome.exe" => "Google Chrome".to_string(),
        "msedge.exe" => "Microsoft Edge".to_string(),
        "firefox.exe" => "Firefox".to_string(),
        "brave.exe" => "Brave".to_string(),
        "obs64.exe" | "obs32.exe" => "OBS Studio".to_string(),
        "discord.exe" => "Discord".to_string(),
        "vlc.exe" => "VLC Media Player".to_string(),
        "zoom.exe" => "Zoom".to_string(),
        "teams.exe" | "ms-teams.exe" => "Microsoft Teams".to_string(),
        "propresenter.exe" => "ProPresenter".to_string(),
        "easyworship.exe" => "EasyWorship".to_string(),
        "holyrics.exe" => "Holyrics".to_string(),
        "ableton live.exe" => "Ableton Live".to_string(),
        "reaper.exe" => "Reaper".to_string(),
        "wmplayer.exe" => "Windows Media Player".to_string(),
        _ => {
            let disp = get_session_display_name(control2);
            if !disp.is_empty() {
                return disp;
            }
            let stem = exe_lower.strip_suffix(".exe").unwrap_or(exe_lower);
            let mut chars = stem.chars();
            match chars.next() {
                Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                None => exe_lower.to_string(),
            }
        }
    }
}
