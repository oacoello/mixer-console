use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct HotkeySpec {
    pub ctrl: bool,
    pub alt: bool,
    pub shift: bool,
    /// Nombre de la tecla principal, ej: "F1", "F2", ..., "F12", "1".."9", "A".."Z"
    pub key: String,
}

impl HotkeySpec {
    pub fn new(ctrl: bool, alt: bool, shift: bool, key: impl Into<String>) -> Self {
        Self {
            ctrl,
            alt,
            shift,
            key: key.into().to_uppercase(),
        }
    }

    pub fn display(&self) -> String {
        let mut parts = Vec::new();
        if self.ctrl {
            parts.push("Ctrl");
        }
        if self.alt {
            parts.push("Alt");
        }
        if self.shift {
            parts.push("Shift");
        }
        parts.push(&self.key);
        parts.join("+")
    }

    pub fn to_win32_vk(&self) -> Option<u32> {
        let k = self.key.trim().to_uppercase();
        if let Some(num) = k.strip_prefix('F') {
            if let Ok(n) = num.parse::<u32>() {
                if (1..=12).contains(&n) {
                    return Some(0x70 + (n - 1)); // VK_F1 = 0x70
                }
            }
        }
        if k.len() == 1 {
            let b = k.as_bytes()[0];
            if b.is_ascii_digit() || b.is_ascii_uppercase() {
                return Some(b as u32);
            }
        }
        None
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetRule {
    /// Nombre del ejecutable en minúsculas (ej. "spotify.exe", "chrome.exe") o "__master__"
    pub target_exe: String,
    /// Nombre amigable para mostrar en la UI
    pub display_name: String,
    /// Volumen objetivo entre 0.0 y 1.0
    pub volume: f32,
    /// Si se debe silenciar (mute) la aplicación al aplicar este preset
    pub muted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preset {
    pub id: String,
    pub name: String,
    #[serde(default = "default_preset_icon")]
    pub icon: String,
    pub hotkey: Option<HotkeySpec>,
    pub rules: Vec<PresetRule>,
}

fn default_preset_icon() -> String {
    "sliders".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub always_on_top: bool,
    pub minimize_to_tray_on_close: bool,
    pub fade_duration_ms: u64,
    #[serde(default = "default_theme_mode")]
    pub theme_mode: String,
    #[serde(default = "default_accent_color")]
    pub accent_color: String,
    pub presets: Vec<Preset>,
    /// Etiquetas personalizadas opcionales por ejecutable
    #[serde(default)]
    pub custom_names: BTreeMap<String, String>,
}

fn default_theme_mode() -> String {
    "system".to_string()
}

fn default_accent_color() -> String {
    "system".to_string()
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            always_on_top: false,
            minimize_to_tray_on_close: true,
            fade_duration_ms: 500,
            theme_mode: default_theme_mode(),
            accent_color: default_accent_color(),
            custom_names: BTreeMap::new(),
            presets: vec![
                Preset {
                    id: "preset-musica".to_string(),
                    name: "Música".to_string(),
                    icon: "music".to_string(),
                    hotkey: Some(HotkeySpec::new(true, false, false, "F1")),
                    rules: vec![
                        PresetRule {
                            target_exe: "spotify.exe".to_string(),
                            display_name: "Spotify".to_string(),
                            volume: 1.0,
                            muted: false,
                        },
                        PresetRule {
                            target_exe: "chrome.exe".to_string(),
                            display_name: "Navegador (Chrome)".to_string(),
                            volume: 0.5,
                            muted: false,
                        },
                    ],
                },
                Preset {
                    id: "preset-estudio".to_string(),
                    name: "Estudio / Palabra".to_string(),
                    icon: "book".to_string(),
                    hotkey: Some(HotkeySpec::new(true, false, false, "F2")),
                    rules: vec![
                        PresetRule {
                            target_exe: "spotify.exe".to_string(),
                            display_name: "Spotify".to_string(),
                            volume: 0.15,
                            muted: false,
                        },
                        PresetRule {
                            target_exe: "chrome.exe".to_string(),
                            display_name: "Navegador (Chrome)".to_string(),
                            volume: 0.0,
                            muted: true,
                        },
                    ],
                },
                Preset {
                    id: "preset-todo".to_string(),
                    name: "Todo al 100%".to_string(),
                    icon: "sliders".to_string(),
                    hotkey: Some(HotkeySpec::new(true, false, false, "F3")),
                    rules: vec![
                        PresetRule {
                            target_exe: "spotify.exe".to_string(),
                            display_name: "Spotify".to_string(),
                            volume: 1.0,
                            muted: false,
                        },
                        PresetRule {
                            target_exe: "chrome.exe".to_string(),
                            display_name: "Navegador (Chrome)".to_string(),
                            volume: 1.0,
                            muted: false,
                        },
                    ],
                },
            ],
        }
    }
}

impl AppConfig {
    pub fn config_path() -> Option<PathBuf> {
        ProjectDirs::from("com", "ProductionMixer", "ProductionMixer")
            .map(|dirs| dirs.config_dir().join("config.json"))
    }

    pub fn load() -> Self {
        let Some(path) = Self::config_path() else {
            return Self::default();
        };
        if !path.exists() {
            let cfg = Self::default();
            let _ = cfg.save();
            return cfg;
        }
        match fs::read_to_string(&path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Self::default(),
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let Some(path) = Self::config_path() else {
            return Err("No se pudo determinar la carpeta de configuración".to_string());
        };
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let json = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(&path, json).map_err(|e| e.to_string())
    }
}

#[allow(dead_code)]
pub fn available_hotkey_keys() -> Vec<&'static str> {
    vec![
        "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "1", "2", "3",
        "4", "5", "6", "7", "8", "9", "0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
        "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    ]
}

fn read_hkcu_dword(subkey: &str, value_name: &str) -> Option<u32> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::System::Registry::{RegGetValueW, HKEY_CURRENT_USER, RRF_RT_REG_DWORD};

    let sub_w: Vec<u16> = OsStr::new(subkey).encode_wide().chain(Some(0)).collect();
    let val_w: Vec<u16> = OsStr::new(value_name).encode_wide().chain(Some(0)).collect();
    let mut data: u32 = 0;
    let mut size: u32 = std::mem::size_of::<u32>() as u32;

    let status = unsafe {
        RegGetValueW(
            HKEY_CURRENT_USER,
            PCWSTR(sub_w.as_ptr()),
            PCWSTR(val_w.as_ptr()),
            RRF_RT_REG_DWORD,
            None,
            Some(&mut data as *mut u32 as *mut _),
            Some(&mut size),
        )
    };
    if status.is_ok() {
        Some(data)
    } else {
        None
    }
}

pub fn read_windows_theme_is_light() -> bool {
    read_hkcu_dword(
        "Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
        "AppsUseLightTheme",
    )
    .map(|v| v != 0)
    .unwrap_or(false)
}

pub fn read_windows_accent_hex() -> String {
    if let Some(abgr) = read_hkcu_dword("Software\\Microsoft\\Windows\\DWM", "AccentColor") {
        let r = abgr & 0xFF;
        let g = (abgr >> 8) & 0xFF;
        let b = (abgr >> 16) & 0xFF;
        return format!("#{:02X}{:02X}{:02X}", r, g, b);
    }
    "#4A55A2".to_string()
}
