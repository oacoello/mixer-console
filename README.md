# Consola de Audio (Production Mixer)

Mezclador de volúmenes por aplicación en tiempo real para Windows, escrito en **Rust** (`tao` + `wry` + Windows Core Audio WASAPI + SMTC) con interfaz **Material Design 3 Expressive**.

## Características

- **Control por aplicación y Master:** Sube, baja y silencia (mute) a nivel de sistema el volumen de cada aplicación abierta con su ícono real.
- **Vúmetros en tiempo real:** Visualización instantánea del nivel de audio de cada canal.
- **Presets con atajos globales:** Cambia de escena en cualquier momento (incluso en segundo plano) con atajos como `Ctrl+F1`, `Ctrl+F2`, `Ctrl+F3`, totalmente configurables.
- **Transición suave (Fade):** Dropdown configurable (`0 ms` a `2000 ms`) para transiciones limpias en producción en vivo.
- **Siempre visible (Anclar):** Mantén la consola fijada encima de otras ventanas.
- **Control de Spotify integrado:** Barra inferior con canción y artista actual + controles de Anterior, Reproducir/Pausar y Siguiente.
- **Bandeja del sistema (System Tray):** Al cerrar la ventana se oculta a la bandeja para evitar cierres accidentales; se cierra por completo desde el menú de la bandeja.
- **Tema Oscuro y Claro:** Configurable desde el modal de Configuración.

## Compilación desde código fuente

```powershell
cargo build --release
```

El binario se genera en `target/release/production-mixer.exe` (junto con `WebView2Loader.dll` si compilas con toolchain GNU).
