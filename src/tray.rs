use crate::config::Preset;
use std::collections::HashMap;
use std::sync::mpsc::{self, Receiver};
use std::sync::Arc;
use tray_icon::menu::{Menu, MenuEvent, MenuId, MenuItem, PredefinedMenuItem};
use tray_icon::{Icon, MouseButton, TrayIcon, TrayIconBuilder, TrayIconEvent};

pub enum TrayAction {
    ShowWindow,
    TriggerPreset(String),
    Quit,
}

pub struct TrayManager {
    _tray_icon: TrayIcon,
    menu_ids: HashMap<MenuId, TrayActionKind>,
    rx: Receiver<TrayEventMsg>,
}

enum TrayActionKind {
    Show,
    Preset(String),
    Quit,
}

enum TrayEventMsg {
    Menu(MenuId),
    ClickShow,
}

impl TrayManager {
    pub fn new(presets: &[Preset], repaint_cb: Arc<dyn Fn() + Send + Sync>) -> Option<Self> {
        let rgba = generate_console_icon_rgba(32);
        let icon = Icon::from_rgba(rgba, 32, 32).ok()?;

        let (menu, menu_ids) = build_menu(presets);

        let (tx, rx) = mpsc::channel::<TrayEventMsg>();

        let tx_menu = tx.clone();
        let repaint_menu = Arc::clone(&repaint_cb);
        MenuEvent::set_event_handler(Some(move |event: MenuEvent| {
            let _ = tx_menu.send(TrayEventMsg::Menu(event.id));
            repaint_menu();
        }));

        let tx_tray = tx;
        let repaint_tray = repaint_cb;
        TrayIconEvent::set_event_handler(Some(move |event: TrayIconEvent| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            }
            | TrayIconEvent::DoubleClick {
                button: MouseButton::Left,
                ..
            } = event
            {
                let _ = tx_tray.send(TrayEventMsg::ClickShow);
                repaint_tray();
            }
        }));

        let tray_icon = TrayIconBuilder::new()
            .with_menu(Box::new(menu))
            .with_tooltip("Consola de Audio - Mezclador en vivo")
            .with_icon(icon)
            .build()
            .ok()?;

        Some(Self {
            _tray_icon: tray_icon,
            menu_ids,
            rx,
        })
    }

    pub fn rebuild_menu(&mut self, presets: &[Preset]) {
        let (menu, menu_ids) = build_menu(presets);
        self._tray_icon.set_menu(Some(Box::new(menu)));
        self.menu_ids = menu_ids;
    }

    pub fn poll_actions(&self) -> Vec<TrayAction> {
        let mut actions = Vec::new();
        while let Ok(msg) = self.rx.try_recv() {
            match msg {
                TrayEventMsg::ClickShow => actions.push(TrayAction::ShowWindow),
                TrayEventMsg::Menu(id) => {
                    if let Some(kind) = self.menu_ids.get(&id) {
                        match kind {
                            TrayActionKind::Show => actions.push(TrayAction::ShowWindow),
                            TrayActionKind::Preset(pid) => {
                                actions.push(TrayAction::TriggerPreset(pid.clone()))
                            }
                            TrayActionKind::Quit => actions.push(TrayAction::Quit),
                        }
                    }
                }
            }
        }
        actions
    }
}

fn build_menu(presets: &[Preset]) -> (Menu, HashMap<MenuId, TrayActionKind>) {
    let menu = Menu::new();
    let mut map = HashMap::new();

    let show_item = MenuItem::new("Mostrar Consola", true, None);
    map.insert(show_item.id().clone(), TrayActionKind::Show);
    let _ = menu.append(&show_item);

    if !presets.is_empty() {
        let _ = menu.append(&PredefinedMenuItem::separator());
        for p in presets {
            let label = if let Some(ref hk) = p.hotkey {
                format!("{} ({})", p.name, hk.display())
            } else {
                p.name.clone()
            };
            let item = MenuItem::new(label, true, None);
            map.insert(item.id().clone(), TrayActionKind::Preset(p.id.clone()));
            let _ = menu.append(&item);
        }
    }

    let _ = menu.append(&PredefinedMenuItem::separator());
    let quit_item = MenuItem::new("Salir", true, None);
    map.insert(quit_item.id().clone(), TrayActionKind::Quit);
    let _ = menu.append(&quit_item);

    (menu, map)
}

/// Genera un ícono RGBA de 32x32 con 3 faders de consola sobre fondo oscuro redondeado.
pub fn generate_console_icon_rgba(size: u32) -> Vec<u8> {
    let mut rgba = vec![0u8; (size * size * 4) as usize];
    let s = size as i32;

    for y in 0..s {
        for x in 0..s {
            let idx = ((y * s + x) * 4) as usize;
            // Fondo redondeado oscuro (#1A1D26)
            let margin = 2;
            let in_box = x >= margin && x < s - margin && y >= margin && y < s - margin;
            if !in_box {
                continue;
            }

            let mut r = 26u8;
            let mut g = 29u8;
            let mut b = 38u8;
            let a = 255u8;

            // 3 pistas de fader en x = 8, 16, 24
            for (i, &fx) in [8, 16, 24].iter().enumerate() {
                if (x - fx).abs() <= 1 && (6..26).contains(&y) {
                    r = 65;
                    g = 72;
                    b = 90;
                }
                let knob_y = match i {
                    0 => 11,
                    1 => 18,
                    _ => 9,
                };
                if (x - fx).abs() <= 2 && (y - knob_y).abs() <= 2 {
                    r = 56;
                    g = 189;
                    b = 248; // Azul cian consola
                }
            }

            rgba[idx] = r;
            rgba[idx + 1] = g;
            rgba[idx + 2] = b;
            rgba[idx + 3] = a;
        }
    }
    rgba
}
