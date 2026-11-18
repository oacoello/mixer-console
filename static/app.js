(() => {
  const HOTKEY_KEYS = [
    'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
    '1','2','3','4','5','6','7','8','9','0',
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
  ];

  const SVG_SPEAKER = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
  const SVG_MUSIC = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
  const SVG_GEAR = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';
  const SVG_EDIT = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  const SVG_CLOSE = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.6l6.3-6.31z"/></svg>';

  // Desactivar menú contextual y atajos de DevTools en WebView2
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
    theme_mode: 'dark',
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

  let draggingKey = null;
  let lastChannelSignature = '';
  let editorState = null;
  let smoothedPeaks = {};

  function post(type, payload = {}) {
    if (window.ipc && window.ipc.postMessage) {
      window.ipc.postMessage(JSON.stringify({ type, ...payload }));
    }
  }

  // DOM Elements
  const btnPin = document.getElementById('btn-pin');
  const pinLabel = document.getElementById('pin-label');
  const selectFade = document.getElementById('select-fade');
  const btnNewPreset = document.getElementById('btn-new-preset');
  const btnSettings = document.getElementById('btn-settings');
  const statusPill = document.getElementById('status-pill');
  const presetsList = document.getElementById('presets-list');
  const hotkeyWarning = document.getElementById('hotkey-warning');
  const channelsList = document.getElementById('channels-list');

  // Spotify Elements
  const spTitle = document.getElementById('sp-title');
  const spArtist = document.getElementById('sp-artist');
  const btnSpPrev = document.getElementById('btn-sp-prev');
  const btnSpPlay = document.getElementById('btn-sp-play');
  const btnSpNext = document.getElementById('btn-sp-next');
  const iconSpPlay = document.getElementById('icon-sp-play');
  const iconSpPause = document.getElementById('icon-sp-pause');

  // Preset Modal Elements
  const modal = document.getElementById('preset-modal');
  const dialogTitle = document.getElementById('dialog-title');
  const inputName = document.getElementById('input-preset-name');
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

  // Settings Modal Elements
  const settingsModal = document.getElementById('settings-modal');
  const btnModeDark = document.getElementById('btn-mode-dark');
  const btnModeLight = document.getElementById('btn-mode-light');
  const btnSettingsClose = document.getElementById('btn-settings-close');

  HOTKEY_KEYS.forEach((k) => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    selectHkKey.appendChild(opt);
  });

  // Header & Settings actions
  btnPin.addEventListener('click', () => post('toggle_pin'));
  selectFade.addEventListener('change', () => {
    post('set_fade', { ms: Number(selectFade.value) });
  });
  btnNewPreset.addEventListener('click', () => openNewPreset());
  btnSettings.addEventListener('click', () => {
    renderSettingsModal();
    settingsModal.classList.remove('hidden');
  });
  btnSettingsClose.addEventListener('click', () => settingsModal.classList.add('hidden'));
  btnModeDark.addEventListener('click', () => {
    document.body.setAttribute('data-mode', 'dark');
    post('set_theme', { mode: 'dark' });
    renderSettingsModal();
  });
  btnModeLight.addEventListener('click', () => {
    document.body.setAttribute('data-mode', 'light');
    post('set_theme', { mode: 'light' });
    renderSettingsModal();
  });

  // Spotify controls
  btnSpPrev.addEventListener('click', () => post('media_prev'));
  btnSpPlay.addEventListener('click', () => post('media_toggle_play'));
  btnSpNext.addEventListener('click', () => post('media_next'));

  function renderSettingsModal() {
    const mode = document.body.getAttribute('data-mode') || 'dark';
    btnModeDark.classList.toggle('active', mode === 'dark');
    btnModeLight.classList.toggle('active', mode === 'light');
  }

  function showToast(msg) {
    statusPill.textContent = msg;
    statusPill.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => statusPill.classList.add('hidden'), 2200);
  }

  function renderHeader() {
    btnPin.classList.toggle('active', !!appState.always_on_top);
    pinLabel.textContent = appState.always_on_top ? 'Anclada' : 'Anclar';
    if (document.activeElement !== selectFade) {
      selectFade.value = String(appState.fade_duration_ms ?? 500);
    }
    const mode = appState.theme_mode === 'light' ? 'light' : 'dark';
    if (document.body.getAttribute('data-mode') !== mode) {
      document.body.setAttribute('data-mode', mode);
    }
  }

  function renderSpotify() {
    const sp = appState.spotify || {};
    if (sp.connected && sp.title) {
      spTitle.textContent = sp.title;
      spArtist.textContent = sp.artist || 'Spotify';
    } else {
      spTitle.textContent = 'Spotify sin reproducción';
      spArtist.textContent = '';
    }
    iconSpPlay.classList.toggle('hidden', !!sp.is_playing);
    iconSpPause.classList.toggle('hidden', !sp.is_playing);
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

  function renderPresets() {
    presetsList.innerHTML = '';
    (appState.presets || []).forEach((p) => {
      const group = document.createElement('div');
      group.className = 'preset-group' + (appState.active_preset_id === p.id ? ' active' : '');

      const trig = document.createElement('button');
      trig.className = 'preset-trigger';
      trig.textContent = p.name;
      trig.addEventListener('click', () => post('apply_preset', { id: p.id }));
      group.appendChild(trig);

      if (p.hotkey) {
        const kbd = document.createElement('span');
        kbd.className = 'preset-kbd';
        kbd.textContent = formatHotkey(p.hotkey);
        group.appendChild(kbd);
      }

      const edit = document.createElement('button');
      edit.className = 'preset-edit-btn';
      edit.innerHTML = SVG_EDIT;
      edit.title = 'Editar preset';
      edit.addEventListener('click', () => openEditPreset(p));
      group.appendChild(edit);

      presetsList.appendChild(group);
    });

    if (appState.conflicts && appState.conflicts.length > 0) {
      hotkeyWarning.textContent = `Atajo en uso por otra app: ${appState.conflicts.join(', ')}`;
      hotkeyWarning.classList.remove('hidden');
    } else {
      hotkeyWarning.classList.add('hidden');
    }
  }

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

    const main = document.createElement('div');
    main.className = 'channel-main';

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

    main.appendChild(identity);
    main.appendChild(sliderWrap);
    main.appendChild(pctEl);
    main.appendChild(muteBtn);

    const vuTrack = document.createElement('div');
    vuTrack.className = 'vu-track';
    const vuFill = document.createElement('div');
    vuFill.className = 'vu-fill';
    vuTrack.appendChild(vuFill);

    card.appendChild(main);
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

  // Preset Editor Logic
  function openNewPreset() {
    editorState = {
      isNew: true,
      id: `preset-${Date.now()}`,
      name: 'Nuevo Preset',
      useHotkey: true,
      ctrl: true,
      alt: false,
      shift: false,
      key: 'F4',
      rules: (appState.channels || []).map((ch) => ({
        target_exe: ch.exe_key,
        display_name: ch.display_name,
        volume: ch.volume,
        muted: ch.muted,
      })),
    };
    renderEditor();
    modal.classList.remove('hidden');
  }

  function openEditPreset(preset) {
    editorState = {
      isNew: false,
      id: preset.id,
      name: preset.name,
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
      del.className = 'preset-edit-btn';
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
    renderHeader();
    renderSpotify();
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
  renderHeader();
  renderPresets();
  renderChannels();
  renderSpotify();
})();
