use crate::config::{HotkeySpec, Preset};
use std::collections::HashMap;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use windows::Win32::System::Threading::GetCurrentThreadId;
use windows::Win32::UI::Input::KeyboardAndMouse::{
    RegisterHotKey, UnregisterHotKey, HOT_KEY_MODIFIERS, MOD_ALT, MOD_CONTROL, MOD_NOREPEAT,
    MOD_SHIFT,
};
use windows::Win32::UI::WindowsAndMessaging::{
    GetMessageW, PeekMessageW, PostThreadMessageW, MSG, PM_NOREMOVE, WM_APP, WM_HOTKEY,
};

const WM_RELOAD_HOTKEYS: u32 = WM_APP + 1;

pub struct HotkeyManager {
    desired: Arc<Mutex<Vec<(String, HotkeySpec)>>>,
    thread_id: Arc<Mutex<Option<u32>>>,
    rx: Receiver<String>,
    pub conflicts: Arc<Mutex<Vec<String>>>,
}

impl HotkeyManager {
    pub fn start(presets: &[Preset], repaint_cb: Arc<dyn Fn() + Send + Sync>) -> Self {
        let initial: Vec<(String, HotkeySpec)> = presets
            .iter()
            .filter_map(|p| p.hotkey.clone().map(|hk| (p.id.clone(), hk)))
            .collect();

        let desired = Arc::new(Mutex::new(initial));
        let thread_id = Arc::new(Mutex::new(None));
        let conflicts = Arc::new(Mutex::new(Vec::new()));
        let (tx, rx) = mpsc::channel::<String>();

        let desired_c = Arc::clone(&desired);
        let tid_c = Arc::clone(&thread_id);
        let conflicts_c = Arc::clone(&conflicts);

        thread::spawn(move || {
            hotkey_thread_loop(desired_c, tid_c, conflicts_c, tx, repaint_cb);
        });

        Self {
            desired,
            thread_id,
            rx,
            conflicts,
        }
    }

    pub fn update_from_presets(&self, presets: &[Preset]) {
        let list: Vec<(String, HotkeySpec)> = presets
            .iter()
            .filter_map(|p| p.hotkey.clone().map(|hk| (p.id.clone(), hk)))
            .collect();

        if let Ok(mut guard) = self.desired.lock() {
            *guard = list;
        }
        if let Ok(tid_guard) = self.thread_id.lock() {
            if let Some(tid) = *tid_guard {
                unsafe {
                    let _ = PostThreadMessageW(tid, WM_RELOAD_HOTKEYS, None, None);
                }
            }
        }
    }

    pub fn try_recv_triggered(&self) -> Option<String> {
        self.rx.try_recv().ok()
    }

    pub fn get_conflicts(&self) -> Vec<String> {
        self.conflicts
            .lock()
            .map(|c| c.clone())
            .unwrap_or_default()
    }
}

fn hotkey_thread_loop(
    desired: Arc<Mutex<Vec<(String, HotkeySpec)>>>,
    thread_id_arc: Arc<Mutex<Option<u32>>>,
    conflicts_arc: Arc<Mutex<Vec<String>>>,
    tx: Sender<String>,
    repaint_cb: Arc<dyn Fn() + Send + Sync>,
) {
    unsafe {
        // Forzar creación de la cola de mensajes del hilo
        let mut msg = MSG::default();
        let _ = PeekMessageW(&mut msg, None, 0, 0, PM_NOREMOVE);

        let tid = GetCurrentThreadId();
        if let Ok(mut g) = thread_id_arc.lock() {
            *g = Some(tid);
        }

        let mut registered: HashMap<i32, String> = HashMap::new();
        register_all(&desired, &conflicts_arc, &mut registered);

        while GetMessageW(&mut msg, None, 0, 0).as_bool() {
            if msg.message == WM_RELOAD_HOTKEYS {
                unregister_all(&mut registered);
                register_all(&desired, &conflicts_arc, &mut registered);
            } else if msg.message == WM_HOTKEY {
                let id = msg.wParam.0 as i32;
                if let Some(preset_id) = registered.get(&id) {
                    let _ = tx.send(preset_id.clone());
                    repaint_cb();
                }
            }
        }

        unregister_all(&mut registered);
    }
}

unsafe fn unregister_all(registered: &mut HashMap<i32, String>) {
    for &id in registered.keys() {
        let _ = UnregisterHotKey(None, id);
    }
    registered.clear();
}

unsafe fn register_all(
    desired: &Arc<Mutex<Vec<(String, HotkeySpec)>>>,
    conflicts_arc: &Arc<Mutex<Vec<String>>>,
    registered: &mut HashMap<i32, String>,
) {
    let list = desired.lock().map(|g| g.clone()).unwrap_or_default();
    let mut conflicts = Vec::new();

    for (idx, (preset_id, spec)) in list.into_iter().enumerate() {
        let Some(vk) = spec.to_win32_vk() else {
            continue;
        };
        let mut mods = MOD_NOREPEAT;
        if spec.ctrl {
            mods |= MOD_CONTROL;
        }
        if spec.alt {
            mods |= MOD_ALT;
        }
        if spec.shift {
            mods |= MOD_SHIFT;
        }

        let hotkey_id = (idx as i32) + 1;
        if RegisterHotKey(None, hotkey_id, HOT_KEY_MODIFIERS(mods.0), vk).is_ok() {
            registered.insert(hotkey_id, preset_id);
        } else {
            conflicts.push(spec.display());
        }
    }

    if let Ok(mut g) = conflicts_arc.lock() {
        *g = conflicts;
    }
}
