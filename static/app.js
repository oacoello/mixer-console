(() => {
  const HOTKEY_KEYS = [
    'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
    '1','2','3','4','5','6','7','8','9','0',
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
  ];

  const PRESET_ICONS = {
    music: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>',
    book: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
    broadcast: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4.24-2.24a6 6 0 0 0 0 8.48l1.41-1.41a4 4 0 0 1 0-5.66L7.76 7.76zm8.48 0-1.41 1.41a4 4 0 0 1 0 5.66l1.41 1.41a6 6 0 0 0 0-8.48zM4.93 4.93a10 10 0 0 0 0 14.14l1.41-1.41a8 8 0 0 1 0-11.31L4.93 4.93zm14.14 0-1.41 1.41a8 8 0 0 1 0 11.31l1.41 1.41a10 10 0 0 0 0-14.14z"/></svg>',
    video: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
    star: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  };

  const ACCENT_SWATCHES = [
    { id: 'system', label: 'Sistema', hex: null },
    { id: '#4A55A2', label: 'Índigo', hex: '#4A55A2' },
    { id: '#0078D4', label: 'Azul', hex: '#0078D4' },
    { id: '#00897B', label: 'Esmeralda', hex: '#00897B' },
    { id: '#7E57C2', label: 'Violeta', hex: '#7E57C2' },
    { id: '#C65D3B', label: 'Terracota', hex: '#C65D3B' },
    { id: '#C2185B', label: 'Rosa', hex: '#C2185B' },
    { id: '#B27A00', label: 'Ámbar', hex: '#B27A00' },
  ];

  const SVG_SPEAKER = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
  const SVG_MUSIC = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
  const SVG_GEAR = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';
  const SVG_EDIT = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  const SVG_TRASH = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
  const SVG_CLOSE = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.6l6.3-6.31z"/></svg>';

  // Desactivar menú contextual y DevTools
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
    ) {
      e.preventDefault();
    }
  });

  let appState = window.__INITIAL_STATE__ || {
    always_on_top: false,
    fade_duration_ms: 500,
    theme_mode: 'system',
    resolved_theme: 'dark',
    accent_color: 'system',
    system_accent_hex: '#4A55A2',
    presets: [],
    active_preset_id: null,
    conflicts: [],
    master_volume: 1,
    master_muted: false,
    master_peak: 0,
    channels: [],
    device_error: null,
    spotify: { connected: false, title: '', artist: '', is_playing: false },
  };

  let activeTab = 'mixer';
  let draggingKey = null;
  let lastChannelSignature = '';
  let editorState = null;
  let smoothedPeaks = {};
  let lastThemeKey = '';

  function post(type, payload = {}) {
    if (window.ipc && window.ipc.postMessage) {
      window.ipc.postMessage(JSON.stringify({ type, ...payload }));
    }
  }

  // Color helpers for Material 3 tonal palette from any hex accent
  function hexToHsl(hex) {
    const clean = (hex || '#4A55A2').replace('#', '');
    const num = parseInt(clean.length === 6 ? clean : '4A55A2', 16);
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function applyThemeAndAccent() {
    const mode = appState.resolved_theme === 'light' ? 'light' : 'dark';
    const rawHex = appState.accent_color === 'system'
      ? (appState.system_accent_hex || '#4A55A2')
      : (appState.accent_color || '#4A55A2');
    const key = `${mode}:${rawHex}`;
    if (key === lastThemeKey) return;
    lastThemeKey = key;

    document.body.setAttribute('data-mode', mode);
    const { h, s } = hexToHsl(rawHex);
    const sat = Math.max(35, Math.min(85, s));
    const root = document.documentElement.style;

    if (mode === 'dark') {
      root.setProperty('--md-primary', `hsl(${h}, ${sat}%, 78%)`);
      root.setProperty('--md-on-primary', `hsl(${h}, ${sat}%, 18%)`);
      root.setProperty('--md-primary-container', `hsl(${h}, ${Math.max(28, sat - 12)}%, 30%)`);
      root.setProperty('--md-on-primary-container', `hsl(${h}, ${sat}%, 90%)`);
      root.setProperty('--md-secondary-container', `hsl(${h}, 22%, 25%)`);
      root.setProperty('--md-on-secondary-container', `hsl(${h}, 30%, 90%)`);
    } else {
      root.setProperty('--md-primary', `hsl(${h}, ${sat}%, 42%)`);
      root.setProperty('--md-on-primary', `#FFFFFF`);
      root.setProperty('--md-primary-container', `hsl(${h}, ${Math.min(90, sat + 5)}%, 88%)`);
      root.setProperty('--md-on-primary-container', `hsl(${h}, ${sat}%, 16%)`);
      root.setProperty('--md-secondary-container', `hsl(${h}, 26%, 90%)`);
      root.setProperty('--md-on-secondary-container', `hsl(${h}, 25%, 20%)`);
    }
  }

  // DOM References
  const toastBanner = document.getElementById('toast-banner');
  const mixerPresetsStrip = document.getElementById('mixer-presets-strip');
  const channelsList = document.getElementById('channels-list');

  const selectFadePresets = document.getElementById('select-fade-presets');
  const btnNewFromCurrent = document.getElementById('btn-new-from-current');
  const btnNewBlank = document.getElementById('btn-new-blank');
  const hotkeyWarning = document.getElementById('hotkey-warning');
  const presetsManageList = document.getElementById('presets-manage-list');

  const spStatusChip = document.getElementById('sp-status-chip');
  const spTitle = document.getElementById('sp-title');
  const spArtist = document.getElementById('sp-artist');
  const btnSpPrev = document.getElementById('btn-sp-prev');
  const btnSpPlay = document.getElementById('btn-sp-play');
  const btnSpNext = document.getElementById('btn-sp-next');
  const iconSpPlay = document.getElementById('icon-sp-play');
  const iconSpPause = document.getElementById('icon-sp-pause');

  const btnThemeSystem = document.getElementById('btn-theme-system');
  const btnThemeLight = document.getElementById('btn-theme-light');
  const btnThemeDark = document.getElementById('btn-theme-dark');
  const accentSwatchesEl = document.getElementById('accent-swatches');
  const btnPinSwitch = document.getElementById('btn-pin-switch');
  const selectFadeSettings = document.getElementById('select-fade-settings');

  // Preset Modal
  const modal = document.getElementById('preset-modal');
  const dialogTitle = document.getElementById('dialog-title');
  const inputName = document.getElementById('input-preset-name');
  const iconPickerEl = document.getElementById('icon-picker');
  const btnHkEnable = document.getElementById('btn-hk-enable');
  const hkControls = document.getElementById('hk-controls');
  const btnHkCtrl = document.getElementById('btn-hk-ctrl');
  const btnHkAlt = document.getElementById('btn-hk-alt');
  const btnHkShift = document.getElementById('btn-hk-shift');
  const selectHkKey = document.getElementById('select-hk-key');
  const editorRulesEl = document.getElementById('editor-rules');
  const selectAddApp = document.getElementById('select-add-app');
  const inputCustomExe = document.getElementById('input-custom-exe');
  const btnAddCustom = document.getElementById('btn-add-custom');
  const btnCaptureCurrent = document.getElementById('btn-capture-current');
  const btnEditorDelete = document.getElementById('btn-editor-delete');
  const btnEditorCancel = document.getElementById('btn-editor-cancel');
  const btnEditorSave = document.getElementById('btn-editor-save');

  HOTKEY_KEYS.forEach((k) => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    selectHkKey.appendChild(opt);
  });

  // Bottom Navigation Bar
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('.nav-item').forEach((n) => n.classList.toggle('active', n === btn));
      document.querySelectorAll('.tab-view').forEach((v) => {
        v.classList.toggle('active', v.id === `view-${activeTab}`);
      });
    });
  });

  function showToast(msg) {
    toastBanner.textContent = msg;
    toastBanner.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastBanner.classList.add('hidden'), 2000);
  }

  function formatHotkey(hk) {
    if (!hk) return '';
    const parts = [];
    if (hk.ctrl) parts.push('Ctrl');
    if (hk.alt) parts.push('Alt');
    if (hk.shift) parts.push('Shift');
    parts.push(hk.key);
    return parts.join('+');
  }

  function getPresetIconSvg(iconId) {
    return PRESET_ICONS[iconId] || PRESET_ICONS.sliders;
  }

  // Presets UI (Quick strip in Mixer + Full list in Presets tab)
  function renderPresets() {
    mixerPresetsStrip.innerHTML = '';
    presetsManageList.innerHTML = '';

    (appState.presets || []).forEach((p) => {
      const isActive = appState.active_preset_id === p.id;

      // 1. Quick chip in Mixer
      const chip = document.createElement('button');
      chip.className = 'quick-preset-chip' + (isActive ? ' active' : '');
      chip.innerHTML = `${getPresetIconSvg(p.icon)}<span>${escapeHtml(p.name)}</span>` +
        (p.hotkey ? `<span class="quick-preset-kbd">${escapeHtml(formatHotkey(p.hotkey))}</span>` : '');
      chip.addEventListener('click', () => post('apply_preset', { id: p.id }));
      mixerPresetsStrip.appendChild(chip);

      // 2. Full card in Presets tab
      const card = document.createElement('div');
      card.className = 'preset-manage-card' + (isActive ? ' active' : '');

      const left = document.createElement('div');
      left.className = 'preset-manage-left';
      left.addEventListener('click', () => post('apply_preset', { id: p.id }));

      const iconBox = document.createElement('span');
      iconBox.className = 'preset-icon-box';
      iconBox.innerHTML = getPresetIconSvg(p.icon);

      const info = document.createElement('div');
      info.className = 'preset-manage-info';
      const nameEl = document.createElement('div');
      nameEl.className = 'preset-manage-name';
      nameEl.textContent = p.name;

      const subEl = document.createElement('div');
      subEl.className = 'preset-manage-sub';
      const hkStr = p.hotkey ? formatHotkey(p.hotkey) : 'Sin atajo';
      const count = (p.rules || []).length;
      subEl.textContent = `${hkStr} · ${count} ${count === 1 ? 'regla' : 'reglas'}`;

      info.appendChild(nameEl);
      info.appendChild(subEl);
      left.appendChild(iconBox);
      left.appendChild(info);

      const actions = document.createElement('div');
      actions.className = 'preset-manage-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-action-btn';
      editBtn.innerHTML = SVG_EDIT;
      editBtn.title = 'Editar preset';
      editBtn.addEventListener('click', () => openEditPreset(p));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-action-btn danger';
      delBtn.innerHTML = SVG_TRASH;
      delBtn.title = 'Eliminar preset';
      delBtn.addEventListener('click', () => post('delete_preset', { id: p.id }));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      card.appendChild(left);
      card.appendChild(actions);
      presetsManageList.appendChild(card);
    });

    if (appState.conflicts && appState.conflicts.length > 0) {
      hotkeyWarning.textContent = `Atajo en uso por otra app: ${appState.conflicts.join(', ')}`;
      hotkeyWarning.classList.remove('hidden');
    } else {
      hotkeyWarning.classList.add('hidden');
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Channels & Sliders
  function attachSliderBehavior(wrap, onChange) {
    const updateFromClientX = (clientX) => {
      const rect = wrap.getBoundingClientRect();
      const val = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const fill = wrap.querySelector('.m3-slider-fill');
      const thumb = wrap.querySelector('.m3-slider-thumb');
      const pct = (val * 100).toFixed(1) + '%';
      fill.style.width = pct;
      thumb.style.left = pct;
      const card = wrap.closest('.channel-card');
      if (card) {
        const pctEl = card.querySelector('.channel-pct');
        if (pctEl) pctEl.textContent = Math.round(val * 100) + '%';
      }
      onChange(val);
    };

    wrap.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      wrap.setPointerCapture(e.pointerId);
      wrap.classList.add('dragging');
      draggingKey = wrap.dataset.key;
      updateFromClientX(e.clientX);
    });

    wrap.addEventListener('pointermove', (e) => {
      if (draggingKey === wrap.dataset.key && e.buttons > 0) {
        updateFromClientX(e.clientX);
      }
    });

    const endDrag = () => {
      if (draggingKey === wrap.dataset.key) {
        draggingKey = null;
        wrap.classList.remove('dragging');
      }
    };
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);
  }

  function createChannelCard({ key, name, iconUrl, fallbackSvg, volume, muted, isMaster }) {
    const card = document.createElement('div');
    card.className = 'channel-card' + (isMaster ? ' master' : '') + (muted ? ' muted' : '');
    card.dataset.key = key;

    const top = document.createElement('div');
    top.className = 'channel-top';

    const identity = document.createElement('div');
    identity.className = 'channel-identity';
    identity.title = isMaster ? 'Volumen Master del Sistema' : `${name} (${key})`;

    if (iconUrl) {
      const img = document.createElement('img');
      img.className = 'app-icon';
      img.src = iconUrl;
      identity.appendChild(img);
    } else {
      const fb = document.createElement('span');
      fb.className = 'app-icon-fallback';
      fb.innerHTML = fallbackSvg;
      identity.appendChild(fb);
    }

    const nameEl = document.createElement('span');
    nameEl.className = 'channel-name';
    nameEl.textContent = name;
    identity.appendChild(nameEl);

    const right = document.createElement('div');
    right.className = 'channel-right';

    const pctEl = document.createElement('span');
    pctEl.className = 'channel-pct';
    pctEl.textContent = Math.round(volume * 100) + '%';

    const muteBtn = document.createElement('button');
    muteBtn.className = 'mute-btn' + (muted ? ' muted' : '');
    muteBtn.textContent = muted ? 'Mute' : 'Silenciar';
    muteBtn.addEventListener('click', () => {
      const currentlyMuted = card.classList.contains('muted');
      if (isMaster) {
        post('set_master_mute', { muted: !currentlyMuted });
      } else {
        post('set_app_mute', { exe_key: key, muted: !currentlyMuted });
      }
    });

    right.appendChild(pctEl);
    right.appendChild(muteBtn);
    top.appendChild(identity);
    top.appendChild(right);

    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'm3-slider-wrap';
    sliderWrap.dataset.key = key;

    const track = document.createElement('div');
    track.className = 'm3-slider-track';
    const fill = document.createElement('div');
    fill.className = 'm3-slider-fill';
    fill.style.width = (volume * 100).toFixed(1) + '%';
    track.appendChild(fill);

    const thumb = document.createElement('div');
    thumb.className = 'm3-slider-thumb';
    thumb.style.left = (volume * 100).toFixed(1) + '%';

    sliderWrap.appendChild(track);
    sliderWrap.appendChild(thumb);

    attachSliderBehavior(sliderWrap, (v) => {
      if (isMaster) {
        post('set_master_volume', { volume: v });
      } else {
        post('set_app_volume', { exe_key: key, volume: v });
      }
    });

    const vuTrack = document.createElement('div');
    vuTrack.className = 'vu-track';
    const vuFill = document.createElement('div');
    vuFill.className = 'vu-fill';
    vuTrack.appendChild(vuFill);

    card.appendChild(top);
    card.appendChild(sliderWrap);
    card.appendChild(vuTrack);
    return card;
  }

  function smoothPeak(key, raw) {
    const prev = smoothedPeaks[key] || 0;
    const next = raw >= prev ? raw : Math.max(raw, prev * 0.80);
    smoothedPeaks[key] = next < 0.002 ? 0 : next;
    return smoothedPeaks[key];
  }

  function updateCardValues(card, volume, muted, peak, isActive) {
    card.classList.toggle('muted', muted);
    card.classList.toggle('active-audio', !!isActive && !muted);

    const muteBtn = card.querySelector('.mute-btn');
    if (muteBtn) {
      muteBtn.classList.toggle('muted', muted);
      muteBtn.textContent = muted ? 'Mute' : 'Silenciar';
    }

    if (draggingKey !== card.dataset.key) {
      const pct = (volume * 100).toFixed(1) + '%';
      const fill = card.querySelector('.m3-slider-fill');
      const thumb = card.querySelector('.m3-slider-thumb');
      const pctEl = card.querySelector('.channel-pct');
      if (fill) fill.style.width = pct;
      if (thumb) thumb.style.left = pct;
      if (pctEl) pctEl.textContent = Math.round(volume * 100) + '%';
    }

    const vuFill = card.querySelector('.vu-fill');
    if (vuFill) {
      const p = muted ? 0 : smoothPeak(card.dataset.key, peak);
      vuFill.style.width = (p * 100).toFixed(1) + '%';
    }
  }

  function renderChannels() {
    if (appState.device_error) {
      channelsList.innerHTML = `<div class="empty-state">${appState.device_error}</div>`;
      lastChannelSignature = 'error';
      return;
    }

    const sig =
      '__master__|' +
      (appState.channels || []).map((c) => `${c.exe_key}:${c.icon_url ? '1' : '0'}`).join('|');

    if (sig !== lastChannelSignature) {
      lastChannelSignature = sig;
      channelsList.innerHTML = '';

      channelsList.appendChild(
        createChannelCard({
          key: '__master__',
          name: 'Master',
          iconUrl: null,
          fallbackSvg: SVG_SPEAKER,
          volume: appState.master_volume,
          muted: appState.master_muted,
          isMaster: true,
        })
      );

      if (!appState.channels || appState.channels.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No hay aplicaciones reproduciendo audio en este momento.';
        channelsList.appendChild(empty);
      } else {
        appState.channels.forEach((ch) => {
          channelsList.appendChild(
            createChannelCard({
              key: ch.exe_key,
              name: ch.display_name,
              iconUrl: ch.icon_url,
              fallbackSvg: ch.exe_key === '__system__' ? SVG_GEAR : SVG_MUSIC,
              volume: ch.volume,
              muted: ch.muted,
              isMaster: false,
            })
          );
        });
      }
    }

    const masterCard = channelsList.querySelector('.channel-card[data-key="__master__"]');
    if (masterCard) {
      updateCardValues(masterCard, appState.master_volume, appState.master_muted, appState.master_peak, false);
    }

    (appState.channels || []).forEach((ch) => {
      const card = channelsList.querySelector(`.channel-card[data-key="${CSS.escape(ch.exe_key)}"]`);
      if (card) {
        updateCardValues(card, ch.volume, ch.muted, ch.peak, ch.is_active);
      }
    });
  }

  // Música (Spotify)
  function renderMusic() {
    const sp = appState.spotify || {};
    if (sp.connected && sp.title) {
      spTitle.textContent = sp.title;
      spArtist.textContent = sp.artist || 'Spotify';
      spStatusChip.textContent = sp.is_playing ? 'Reproduciendo' : 'En pausa';
    } else {
      spTitle.textContent = 'Sin reproducción';
      spArtist.textContent = 'Abre Spotify para controlar la música';
      spStatusChip.textContent = 'Desconectado';
    }
    iconSpPlay.classList.toggle('hidden', !!sp.is_playing);
    iconSpPause.classList.toggle('hidden', !sp.is_playing);
  }

  btnSpPrev.addEventListener('click', () => post('media_prev'));
  btnSpPlay.addEventListener('click', () => post('media_toggle_play'));
  btnSpNext.addEventListener('click', () => post('media_next'));

  // Configuraciones
  function renderSettings() {
    const mode = appState.theme_mode || 'system';
    btnThemeSystem.classList.toggle('active', mode === 'system');
    btnThemeLight.classList.toggle('active', mode === 'light');
    btnThemeDark.classList.toggle('active', mode === 'dark');

    btnPinSwitch.classList.toggle('on', !!appState.always_on_top);
    btnPinSwitch.setAttribute('aria-checked', String(!!appState.always_on_top));

    const fadeVal = String(appState.fade_duration_ms ?? 500);
    if (document.activeElement !== selectFadePresets) selectFadePresets.value = fadeVal;
    if (document.activeElement !== selectFadeSettings) selectFadeSettings.value = fadeVal;

    accentSwatchesEl.innerHTML = '';
    ACCENT_SWATCHES.forEach((sw) => {
      const btn = document.createElement('button');
      btn.className = 'swatch-btn' + (appState.accent_color === sw.id ? ' active' : '');
      const dotColor = sw.hex || appState.system_accent_hex || '#4A55A2';
      btn.innerHTML = `<span class="swatch-dot" style="background:${dotColor}"></span><span>${sw.label}</span>`;
      btn.addEventListener('click', () => {
        appState.accent_color = sw.id;
        applyThemeAndAccent();
        renderSettings();
        post('set_accent', { color: sw.id });
      });
      accentSwatchesEl.appendChild(btn);
    });
  }

  btnThemeSystem.addEventListener('click', () => post('set_theme', { mode: 'system' }));
  btnThemeLight.addEventListener('click', () => post('set_theme', { mode: 'light' }));
  btnThemeDark.addEventListener('click', () => post('set_theme', { mode: 'dark' }));
  btnPinSwitch.addEventListener('click', () => post('toggle_pin'));
  selectFadePresets.addEventListener('change', () => post('set_fade', { ms: Number(selectFadePresets.value) }));
  selectFadeSettings.addEventListener('change', () => post('set_fade', { ms: Number(selectFadeSettings.value) }));

  // Presets Editor
  btnNewFromCurrent.addEventListener('click', () => openNewPreset(true));
  btnNewBlank.addEventListener('click', () => openNewPreset(false));

  function openNewPreset(fromCurrent) {
    editorState = {
      isNew: true,
      id: `preset-${Date.now()}`,
      name: fromCurrent ? 'Escena actual' : 'Nuevo Preset',
      icon: fromCurrent ? 'sliders' : 'star',
      useHotkey: true,
      ctrl: true,
      alt: false,
      shift: false,
      key: 'F4',
      rules: fromCurrent
        ? (appState.channels || []).map((ch) => ({
            target_exe: ch.exe_key,
            display_name: ch.display_name,
            volume: ch.volume,
            muted: ch.muted,
          }))
        : [],
    };
    renderEditor();
    modal.classList.remove('hidden');
  }

  function openEditPreset(preset) {
    editorState = {
      isNew: false,
      id: preset.id,
      name: preset.name,
      icon: preset.icon || 'sliders',
      useHotkey: !!preset.hotkey,
      ctrl: preset.hotkey ? preset.hotkey.ctrl : true,
      alt: preset.hotkey ? preset.hotkey.alt : false,
      shift: preset.hotkey ? preset.hotkey.shift : false,
      key: preset.hotkey ? preset.hotkey.key : 'F1',
      rules: (preset.rules || []).map((r) => ({ ...r })),
    };
    renderEditor();
    modal.classList.remove('hidden');
  }

  function renderEditor() {
    if (!editorState) return;
    dialogTitle.textContent = editorState.isNew ? 'Nuevo Preset' : 'Editar Preset';
    inputName.value = editorState.name;

    iconPickerEl.innerHTML = '';
    Object.keys(PRESET_ICONS).forEach((iconId) => {
      const b = document.createElement('button');
      b.className = 'icon-pick-btn' + (editorState.icon === iconId ? ' active' : '');
      b.innerHTML = PRESET_ICONS[iconId];
      b.addEventListener('click', () => {
        editorState.icon = iconId;
        renderEditor();
      });
      iconPickerEl.appendChild(b);
    });

    btnHkEnable.classList.toggle('active', editorState.useHotkey);
    hkControls.classList.toggle('hidden', !editorState.useHotkey);
    btnHkCtrl.classList.toggle('active', editorState.ctrl);
    btnHkAlt.classList.toggle('active', editorState.alt);
    btnHkShift.classList.toggle('active', editorState.shift);
    selectHkKey.value = editorState.key;
    btnEditorDelete.classList.toggle('hidden', editorState.isNew);

    editorRulesEl.innerHTML = '';
    editorState.rules.forEach((rule, idx) => {
      const row = document.createElement('div');
      row.className = 'rule-row';

      const name = document.createElement('span');
      name.className = 'rule-name';
      name.textContent = rule.display_name;

      const range = document.createElement('input');
      range.type = 'range';
      range.min = 0;
      range.max = 100;
      range.value = Math.round(rule.volume * 100);
      range.className = 'flex-1';

      const pct = document.createElement('span');
      pct.className = 'channel-pct';
      pct.textContent = range.value + '%';

      range.addEventListener('input', () => {
        rule.volume = Number(range.value) / 100;
        pct.textContent = range.value + '%';
      });

      const mute = document.createElement('button');
      mute.className = 'mute-btn' + (rule.muted ? ' muted' : '');
      mute.textContent = rule.muted ? 'Mute' : 'On';
      mute.addEventListener('click', () => {
        rule.muted = !rule.muted;
        renderEditor();
      });

      const del = document.createElement('button');
      del.className = 'icon-action-btn';
      del.innerHTML = SVG_CLOSE;
      del.addEventListener('click', () => {
        editorState.rules.splice(idx, 1);
        renderEditor();
      });

      row.appendChild(name);
      row.appendChild(range);
      row.appendChild(pct);
      row.appendChild(mute);
      row.appendChild(del);
      editorRulesEl.appendChild(row);
    });

    selectAddApp.innerHTML = '<option value="">+ Agregar app...</option>';
    if (!editorState.rules.some((r) => r.target_exe === '__master__')) {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ exe: '__master__', name: 'Master' });
      opt.textContent = 'Master (Sistema)';
      selectAddApp.appendChild(opt);
    }
    (appState.channels || []).forEach((ch) => {
      if (!editorState.rules.some((r) => r.target_exe === ch.exe_key)) {
        const opt = document.createElement('option');
        opt.value = JSON.stringify({ exe: ch.exe_key, name: ch.display_name, vol: ch.volume, muted: ch.muted });
        opt.textContent = ch.display_name;
        selectAddApp.appendChild(opt);
      }
    });
  }

  inputName.addEventListener('input', () => {
    if (editorState) editorState.name = inputName.value;
  });
  btnHkEnable.addEventListener('click', () => {
    if (editorState) { editorState.useHotkey = !editorState.useHotkey; renderEditor(); }
  });
  btnHkCtrl.addEventListener('click', () => {
    if (editorState) { editorState.ctrl = !editorState.ctrl; renderEditor(); }
  });
  btnHkAlt.addEventListener('click', () => {
    if (editorState) { editorState.alt = !editorState.alt; renderEditor(); }
  });
  btnHkShift.addEventListener('click', () => {
    if (editorState) { editorState.shift = !editorState.shift; renderEditor(); }
  });
  selectHkKey.addEventListener('change', () => {
    if (editorState) editorState.key = selectHkKey.value;
  });

  selectAddApp.addEventListener('change', () => {
    if (!editorState || !selectAddApp.value) return;
    const item = JSON.parse(selectAddApp.value);
    editorState.rules.push({
      target_exe: item.exe,
      display_name: item.name,
      volume: item.vol !== undefined ? item.vol : 1.0,
      muted: !!item.muted,
    });
    renderEditor();
  });

  btnAddCustom.addEventListener('click', () => {
    if (!editorState) return;
    const exe = inputCustomExe.value.trim().toLowerCase();
    if (!exe || editorState.rules.some((r) => r.target_exe === exe)) return;
    editorState.rules.push({
      target_exe: exe,
      display_name: exe.replace(/\.exe$/i, ''),
      volume: 1.0,
      muted: false,
    });
    inputCustomExe.value = '';
    renderEditor();
  });

  btnCaptureCurrent.addEventListener('click', () => {
    if (!editorState) return;
    editorState.rules = (appState.channels || []).map((ch) => ({
      target_exe: ch.exe_key,
      display_name: ch.display_name,
      volume: ch.volume,
      muted: ch.muted,
    }));
    renderEditor();
  });

  btnEditorCancel.addEventListener('click', () => {
    editorState = null;
    modal.classList.add('hidden');
  });

  btnEditorDelete.addEventListener('click', () => {
    if (!editorState) return;
    post('delete_preset', { id: editorState.id });
    editorState = null;
    modal.classList.add('hidden');
  });

  btnEditorSave.addEventListener('click', () => {
    if (!editorState) return;
    post('save_preset', {
      preset: {
        id: editorState.id,
        name: editorState.name.trim() || 'Preset',
        icon: editorState.icon || 'sliders',
        hotkey: editorState.useHotkey
          ? {
              ctrl: editorState.ctrl,
              alt: editorState.alt,
              shift: editorState.shift,
              key: editorState.key,
            }
          : null,
        rules: editorState.rules,
      },
    });
    editorState = null;
    modal.classList.add('hidden');
  });

  // Rust -> JS State Push
  window.__onAudioState = (next) => {
    const prevPreset = appState.active_preset_id;
    const prevPresetsJson = JSON.stringify(appState.presets);
    const prevConflictsJson = JSON.stringify(appState.conflicts);

    appState = next;
    applyThemeAndAccent();
    renderSettings();
    renderMusic();

    if (
      prevPreset !== next.active_preset_id ||
      prevPresetsJson !== JSON.stringify(next.presets) ||
      prevConflictsJson !== JSON.stringify(next.conflicts)
    ) {
      renderPresets();
    }
    if (next.toast) {
      showToast(next.toast);
    }
    renderChannels();
  };

  // Initial render
  applyThemeAndAccent();
  renderPresets();
  renderChannels();
  renderMusic();
  renderSettings();
})();
