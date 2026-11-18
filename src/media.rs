use serde::Serialize;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use windows::Media::Control::{
    GlobalSystemMediaTransportControlsSession,
    GlobalSystemMediaTransportControlsSessionManager,
    GlobalSystemMediaTransportControlsSessionPlaybackStatus,
};
use windows::Win32::System::Com::{CoInitializeEx, CoUninitialize, COINIT_MULTITHREADED};

#[derive(Clone, Debug, Default, Serialize)]
pub struct SpotifyMediaState {
    pub connected: bool,
    pub title: String,
    pub artist: String,
    pub is_playing: bool,
}

pub enum MediaCommand {
    TogglePlayPause,
    Next,
    Previous,
}

pub struct MediaController {
    state: Arc<Mutex<SpotifyMediaState>>,
    tx: Sender<MediaCommand>,
}

impl MediaController {
    pub fn start() -> Self {
        let state = Arc::new(Mutex::new(SpotifyMediaState::default()));
        let (tx, rx) = mpsc::channel::<MediaCommand>();
        let state_c = Arc::clone(&state);

        thread::spawn(move || {
            media_worker_loop(rx, state_c);
        });

        Self { state, tx }
    }

    pub fn snapshot(&self) -> SpotifyMediaState {
        self.state.lock().map(|s| s.clone()).unwrap_or_default()
    }

    pub fn send(&self, cmd: MediaCommand) {
        let _ = self.tx.send(cmd);
    }
}

fn media_worker_loop(rx: Receiver<MediaCommand>, state_arc: Arc<Mutex<SpotifyMediaState>>) {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
    }

    let mut manager: Option<GlobalSystemMediaTransportControlsSessionManager> = None;

    loop {
        if manager.is_none() {
            if let Ok(op) = GlobalSystemMediaTransportControlsSessionManager::RequestAsync() {
                manager = op.get().ok();
            }
        }

        // Procesar comandos pendientes
        while let Ok(cmd) = rx.try_recv() {
            if let Some(ref mgr) = manager {
                if let Some(session) = find_spotify_session(mgr) {
                    match cmd {
                        MediaCommand::TogglePlayPause => {
                            if let Ok(op) = session.TryTogglePlayPauseAsync() {
                                let _ = op.get();
                            }
                        }
                        MediaCommand::Next => {
                            if let Ok(op) = session.TrySkipNextAsync() {
                                let _ = op.get();
                            }
                        }
                        MediaCommand::Previous => {
                            if let Ok(op) = session.TrySkipPreviousAsync() {
                                let _ = op.get();
                            }
                        }
                    }
                }
            }
        }

        // Leer estado actual de Spotify
        let next_state = if let Some(ref mgr) = manager {
            read_spotify_state(mgr)
        } else {
            SpotifyMediaState::default()
        };

        if let Ok(mut guard) = state_arc.lock() {
            *guard = next_state;
        }

        // Esperar hasta 350ms o despertar inmediatamente si llega un comando
        if let Ok(cmd) = rx.recv_timeout(Duration::from_millis(350)) {
            if let Some(ref mgr) = manager {
                if let Some(session) = find_spotify_session(mgr) {
                    match cmd {
                        MediaCommand::TogglePlayPause => {
                            if let Ok(op) = session.TryTogglePlayPauseAsync() {
                                let _ = op.get();
                            }
                        }
                        MediaCommand::Next => {
                            if let Ok(op) = session.TrySkipNextAsync() {
                                let _ = op.get();
                            }
                        }
                        MediaCommand::Previous => {
                            if let Ok(op) = session.TrySkipPreviousAsync() {
                                let _ = op.get();
                            }
                        }
                    }
                }
            }
            if let Some(ref mgr) = manager {
                let updated = read_spotify_state(mgr);
                if let Ok(mut guard) = state_arc.lock() {
                    *guard = updated;
                }
            }
        }
    }

    #[allow(unreachable_code)]
    unsafe {
        CoUninitialize();
    }
}

fn find_spotify_session(
    mgr: &GlobalSystemMediaTransportControlsSessionManager,
) -> Option<GlobalSystemMediaTransportControlsSession> {
    let sessions = mgr.GetSessions().ok()?;
    let count = sessions.Size().ok()?;
    for i in 0..count {
        if let Ok(session) = sessions.GetAt(i) {
            if let Ok(app_id) = session.SourceAppUserModelId() {
                if app_id.to_string().to_lowercase().contains("spotify") {
                    return Some(session);
                }
            }
        }
    }
    None
}

fn read_spotify_state(mgr: &GlobalSystemMediaTransportControlsSessionManager) -> SpotifyMediaState {
    let Some(session) = find_spotify_session(mgr) else {
        return SpotifyMediaState::default();
    };

    let is_playing = session
        .GetPlaybackInfo()
        .and_then(|info| info.PlaybackStatus())
        .map(|st| st == GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing)
        .unwrap_or(false);

    let (title, artist) = if let Ok(op) = session.TryGetMediaPropertiesAsync() {
        if let Ok(props) = op.get() {
            let t = props.Title().map(|s| s.to_string()).unwrap_or_default();
            let a = props.Artist().map(|s| s.to_string()).unwrap_or_default();
            (t, a)
        } else {
            (String::new(), String::new())
        }
    } else {
        (String::new(), String::new())
    };

    SpotifyMediaState {
        connected: !title.is_empty() || is_playing,
        title,
        artist,
        is_playing,
    }
}
