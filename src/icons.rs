use base64::{engine::general_purpose::STANDARD, Engine as _};
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use windows::core::PCWSTR;
use windows::Win32::Graphics::Gdi::{
    DeleteObject, GetDC, GetDIBits, ReleaseDC, BITMAPINFO, BITMAPINFOHEADER, BI_RGB,
    DIB_RGB_COLORS,
};
use windows::Win32::Storage::FileSystem::FILE_ATTRIBUTE_NORMAL;
use windows::Win32::UI::Shell::{SHGetFileInfoW, SHFILEINFOW, SHGFI_ICON, SHGFI_LARGEICON};
use windows::Win32::UI::WindowsAndMessaging::{DestroyIcon, GetIconInfo, HICON, ICONINFO};

#[derive(Clone)]
pub struct RgbaIcon {
    pub width: usize,
    pub height: usize,
    pub pixels: Vec<u8>,
}

impl RgbaIcon {
    pub fn to_png_data_url(&self) -> Option<String> {
        let mut buf = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut buf, self.width as u32, self.height as u32);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            let mut writer = encoder.write_header().ok()?;
            writer.write_image_data(&self.pixels).ok()?;
        }
        Some(format!("data:image/png;base64,{}", STANDARD.encode(&buf)))
    }
}

/// Extrae el ícono grande (normalmente 32x32) de un archivo ejecutable en Windows y lo convierte a RGBA8.
pub fn extract_exe_icon(exe_path: &str) -> Option<RgbaIcon> {
    if exe_path.is_empty() {
        return None;
    }

    let wide: Vec<u16> = OsStr::new(exe_path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();

    unsafe {
        let mut shfi = SHFILEINFOW::default();
        let res = SHGetFileInfoW(
            PCWSTR(wide.as_ptr()),
            FILE_ATTRIBUTE_NORMAL,
            Some(&mut shfi),
            std::mem::size_of::<SHFILEINFOW>() as u32,
            SHGFI_ICON | SHGFI_LARGEICON,
        );

        if res == 0 || shfi.hIcon.is_invalid() {
            return None;
        }

        let icon = hicon_to_rgba(shfi.hIcon);
        let _ = DestroyIcon(shfi.hIcon);
        icon
    }
}

unsafe fn hicon_to_rgba(hicon: HICON) -> Option<RgbaIcon> {
    let mut icon_info = ICONINFO::default();
    if GetIconInfo(hicon, &mut icon_info).is_err() {
        return None;
    }

    let result = if !icon_info.hbmColor.is_invalid() {
        let hdc = GetDC(None);
        let mut bmi = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: 32,
                biHeight: -32, // Top-down DIB
                biPlanes: 1,
                biBitCount: 32,
                biCompression: BI_RGB.0,
                ..Default::default()
            },
            ..Default::default()
        };

        let mut buffer = vec![0u8; 32 * 32 * 4];
        let lines = GetDIBits(
            hdc,
            icon_info.hbmColor,
            0,
            32,
            Some(buffer.as_mut_ptr() as *mut _),
            &mut bmi,
            DIB_RGB_COLORS,
        );
        ReleaseDC(None, hdc);

        if lines == 32 {
            // Windows DIB devuelve BGRA -> convertimos a RGBA
            for chunk in buffer.chunks_exact_mut(4) {
                chunk.swap(0, 2);
            }
            Some(RgbaIcon {
                width: 32,
                height: 32,
                pixels: buffer,
            })
        } else {
            None
        }
    } else {
        None
    };

    if !icon_info.hbmColor.is_invalid() {
        let _ = DeleteObject(icon_info.hbmColor);
    }
    if !icon_info.hbmMask.is_invalid() {
        let _ = DeleteObject(icon_info.hbmMask);
    }

    result
}
