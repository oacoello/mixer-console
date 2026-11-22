(() => {
  const HOTKEY_KEYS = [
    'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
    '1','2','3','4','5','6','7','8','9','0',
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
  ];

  const I18N = {
    es: {
      nav_mixer: 'Mixer', nav_presets: 'Presets', nav_music: 'Música', nav_settings: 'Ajustes',
      presets_title: 'Presets', music_title: 'Música', settings_title: 'Configuraciones',
      from_current: 'Desde estado actual', from_scratch: 'Desde cero',
      pin_title: 'Anclar ventana encima', pin_desc: 'Mantiene la app visible sobre otras ventanas',
      fade_title: 'Transición de presets', fade_desc: 'Duración del fade al cambiar de escena',
      lang_title: 'Idioma', lang_desc: 'Idioma de la interfaz',
      tray_note: 'Al cerrar la ventana, la app se oculta en la bandeja del sistema. Usa clic derecho en la bandeja → Salir para cerrarla por completo.',
      capture_current: 'Capturar actuales', name_label: 'Nombre', icon_label: 'Ícono',
      hotkey_btn: 'Atajo', delete_btn: 'Eliminar', cancel_btn: 'Cancelar', save_btn: 'Guardar',
      mute: 'Mute', silence: 'Silenciar', on: 'On', no_audio: 'No hay aplicaciones reproduciendo audio en este momento.',
      no_playback: 'Sin reproducción', open_spotify: 'Abre Spotify para controlar la música',
      playing: 'Reproduciendo', paused: 'En pausa', disconnected: 'Desconectado',
      new_preset: 'Nuevo Preset', edit_preset: 'Editar Preset', current_scene: 'Escena actual',
      no_hotkey: 'Sin atajo', rule_1: 'regla', rule_n: 'reglas',
      add_app: '+ Agregar app...', system_label: 'Sistema', master_sys: 'Master (Sistema)',
      hotkey_used: 'Atajo en uso por otra app: ', name_ph: 'Ej. Música, Estudio...'
    },
    en: {
      nav_mixer: 'Mixer', nav_presets: 'Presets', nav_music: 'Music', nav_settings: 'Settings',
      presets_title: 'Presets', music_title: 'Music', settings_title: 'Settings',
      from_current: 'From current state', from_scratch: 'From scratch',
      pin_title: 'Always on top', pin_desc: 'Keep the window above other apps',
      fade_title: 'Preset transition', fade_desc: 'Fade duration when switching scenes',
      lang_title: 'Language', lang_desc: 'Interface language',
      tray_note: 'Closing the window minimizes it to the system tray. Right-click the tray icon → Quit to exit completely.',
      capture_current: 'Capture current', name_label: 'Name', icon_label: 'Icon',
      hotkey_btn: 'Hotkey', delete_btn: 'Delete', cancel_btn: 'Cancel', save_btn: 'Save',
      mute: 'Muted', silence: 'Mute', on: 'On', no_audio: 'No applications playing audio right now.',
      no_playback: 'Not playing', open_spotify: 'Open Spotify to control playback',
      playing: 'Playing', paused: 'Paused', disconnected: 'Disconnected',
      new_preset: 'New Preset', edit_preset: 'Edit Preset', current_scene: 'Current scene',
      no_hotkey: 'No hotkey', rule_1: 'rule', rule_n: 'rules',
      add_app: '+ Add app...', system_label: 'System', master_sys: 'Master (System)',
      hotkey_used: 'Hotkey already in use: ', name_ph: 'E.g. Music, Study...'
    },
    fr: {
      nav_mixer: 'Mixeur', nav_presets: 'Préréglages', nav_music: 'Musique', nav_settings: 'Paramètres',
      presets_title: 'Préréglages', music_title: 'Musique', settings_title: 'Paramètres',
      from_current: 'État actuel', from_scratch: 'À partir de zéro',
      pin_title: 'Toujours au-dessus', pin_desc: 'Garde la fenêtre au-dessus des autres',
      fade_title: 'Transition', fade_desc: 'Durée du fondu entre scènes',
      lang_title: 'Langue', lang_desc: 'Langue de l’interface',
      tray_note: 'Fermer la fenêtre la réduit dans la zone de notification. Clic droit → Quitter pour fermer.',
      capture_current: 'Capturer', name_label: 'Nom', icon_label: 'Icône',
      hotkey_btn: 'Raccourci', delete_btn: 'Supprimer', cancel_btn: 'Annuler', save_btn: 'Enregistrer',
      mute: 'Muet', silence: 'Muet', on: 'On', no_audio: 'Aucune application ne lit d’audio actuellement.',
      no_playback: 'Aucune lecture', open_spotify: 'Ouvrez Spotify pour contrôler la musique',
      playing: 'Lecture', paused: 'En pause', disconnected: 'Déconnecté',
      new_preset: 'Nouveau préréglage', edit_preset: 'Modifier', current_scene: 'Scène actuelle',
      no_hotkey: 'Aucun raccourci', rule_1: 'règle', rule_n: 'règles',
      add_app: '+ Ajouter app...', system_label: 'Système', master_sys: 'Master (Système)',
      hotkey_used: 'Raccourci déjà utilisé : ', name_ph: 'Ex. Musique, Étude...'
    },
    de: {
      nav_mixer: 'Mixer', nav_presets: 'Presets', nav_music: 'Musik', nav_settings: 'Einstellungen',
      presets_title: 'Presets', music_title: 'Musik', settings_title: 'Einstellungen',
      from_current: 'Aus aktuellem Stand', from_scratch: 'Von Grund auf',
      pin_title: 'Immer im Vordergrund', pin_desc: 'Hält das Fenster über anderen Apps',
      fade_title: 'Übergang', fade_desc: 'Überblenddauer beim Wechsel',
      lang_title: 'Sprache', lang_desc: 'Oberflächensprache',
      tray_note: 'Beim Schließen wird die App ins Infofeld minimiert. Rechtsklick → Beenden zum Schließen.',
      capture_current: 'Aktuelle erfassen', name_label: 'Name', icon_label: 'Symbol',
      hotkey_btn: 'Tastenkürzel', delete_btn: 'Löschen', cancel_btn: 'Abbrechen', save_btn: 'Speichern',
      mute: 'Stumm', silence: 'Stumm', on: 'An', no_audio: 'Derzeit gibt keine App Audio wieder.',
      no_playback: 'Keine Wiedergabe', open_spotify: 'Spotify öffnen zur Steuerung',
      playing: 'Wiedergabe', paused: 'Pausiert', disconnected: 'Getrennt',
      new_preset: 'Neues Preset', edit_preset: 'Preset bearbeiten', current_scene: 'Aktuelle Szene',
      no_hotkey: 'Kein Kürzel', rule_1: 'Regel', rule_n: 'Regeln',
      add_app: '+ App hinzufügen...', system_label: 'System', master_sys: 'Master (System)',
      hotkey_used: 'Kürzel bereits belegt: ', name_ph: 'Z. B. Musik, Studio...'
    },
    ja: {
      nav_mixer: 'ミキサー', nav_presets: 'プリセット', nav_music: '音楽', nav_settings: '設定',
      presets_title: 'プリセット', music_title: '音楽', settings_title: '設定',
      from_current: '現在の状態から', from_scratch: '新規作成',
      pin_title: '常に手前に表示', pin_desc: '他のウィンドウの上に固定します',
      fade_title: 'フェード時間', fade_desc: 'シーン切替時のトランジション',
      lang_title: '言語', lang_desc: '表示言語',
      tray_note: '閉じるとタスクトレイに格納されます。完全に終了するにはトレイを右クリックしてください。',
      capture_current: '現在を取得', name_label: '名前', icon_label: 'アイコン',
      hotkey_btn: 'ショートカット', delete_btn: '削除', cancel_btn: 'キャンセル', save_btn: '保存',
      mute: 'ミュート', silence: '消音', on: 'オン', no_audio: '再生中のアプリがありません。',
      no_playback: '再生停止中', open_spotify: 'Spotifyを開いて操作します',
      playing: '再生中', paused: '一時停止', disconnected: '未接続',
      new_preset: '新規プリセット', edit_preset: 'プリセット編集', current_scene: '現在のシーン',
      no_hotkey: 'キー未設定', rule_1: '件', rule_n: '件',
      add_app: '+ アプリを追加...', system_label: 'システム', master_sys: 'マスター (システム)',
      hotkey_used: '使用中のショートカット: ', name_ph: '例: 音楽、勉強...'
    },
    ru: {
      nav_mixer: 'Микшер', nav_presets: 'Пресеты', nav_music: 'Музыка', nav_settings: 'Настройки',
      presets_title: 'Пресеты', music_title: 'Музыка', settings_title: 'Настройки',
      from_current: 'Из текущего', from_scratch: 'С нуля',
      pin_title: 'Поверх всех окон', pin_desc: 'Закрепить окно поверх других приложений',
      fade_title: 'Плавный переход', fade_desc: 'Длительность затухания',
      lang_title: 'Язык', lang_desc: 'Язык интерфейса',
      tray_note: 'При закрытии окно сворачивается в трей. Для выхода нажмите правой кнопкой по значку в трее.',
      capture_current: 'Захватить текущие', name_label: 'Имя', icon_label: 'Значок',
      hotkey_btn: 'Клавиша', delete_btn: 'Удалить', cancel_btn: 'Отмена', save_btn: 'Сохранить',
      mute: 'Без зв.', silence: 'Заглуш.', on: 'Вкл', no_audio: 'Нет активных аудиоприложений.',
      no_playback: 'Не воспроизводится', open_spotify: 'Откройте Spotify для управления',
      playing: 'Играет', paused: 'Пауза', disconnected: 'Отключено',
      new_preset: 'Новый пресет', edit_preset: 'Редактировать', current_scene: 'Текущая сцена',
      no_hotkey: 'Нет клавиши', rule_1: 'правило', rule_n: 'правил',
      add_app: '+ Добавить...', system_label: 'Система', master_sys: 'Мастер (Система)',
      hotkey_used: 'Клавиша занята: ', name_ph: 'Напр. Музыка...'
    },
    zh: {
      nav_mixer: '混音器', nav_presets: '预设', nav_music: '音乐', nav_settings: '设置',
      presets_title: '预设', music_title: '音乐', settings_title: '设置',
      from_current: '从当前状态', from_scratch: '从零创建',
      pin_title: '窗口置顶', pin_desc: '将窗口固定在其他应用之上',
      fade_title: '渐变过渡', fade_desc: '切换场景时的淡入淡出时长',
      lang_title: '语言', lang_desc: '界面显示语言',
      tray_note: '关闭窗口将最小化到系统托盘。右键托盘图标选择退出即可完全关闭。',
      capture_current: '捕获当前音量', name_label: '名称', icon_label: '图标',
      hotkey_btn: '快捷键', delete_btn: '删除', cancel_btn: '取消', save_btn: '保存',
      mute: '已静音', silence: '静音', on: '开启', no_audio: '当前没有正在播放音频的应用。',
      no_playback: '未播放', open_spotify: '打开 Spotify 以控制播放',
      playing: '正在播放', paused: '已暂停', disconnected: '未连接',
      new_preset: '新建预设', edit_preset: '编辑预设', current_scene: '当前场景',
      no_hotkey: '无快捷键', rule_1: '条规则', rule_n: '条规则',
      add_app: '+ 添加应用...', system_label: '系统', master_sys: '主音量 (系统)',
      hotkey_used: '快捷键已被占用: ', name_ph: '例如：音乐、学习...'
    },
    pt: {
      nav_mixer: 'Mixer', nav_presets: 'Presets', nav_music: 'Música', nav_settings: 'Ajustes',
      presets_title: 'Presets', music_title: 'Música', settings_title: 'Configurações',
      from_current: 'Do estado atual', from_scratch: 'Do zero',
      pin_title: 'Fixar no topo', pin_desc: 'Mantém a janela acima de outros apps',
      fade_title: 'Transição', fade_desc: 'Duração do fade ao trocar de cena',
      lang_title: 'Idioma', lang_desc: 'Idioma da interface',
      tray_note: 'Ao fechar a janela, o app fica oculto na bandeja. Clique com o botão direito na bandeja → Sair.',
      capture_current: 'Capturar atuais', name_label: 'Nome', icon_label: 'Ícone',
      hotkey_btn: 'Atalho', delete_btn: 'Excluir', cancel_btn: 'Cancelar', save_btn: 'Salvar',
      mute: 'Mudo', silence: 'Silenciar', on: 'On', no_audio: 'Nenhum aplicativo reproduzindo áudio no momento.',
      no_playback: 'Sem reprodução', open_spotify: 'Abra o Spotify para controlar a música',
      playing: 'Tocando', paused: 'Pausado', disconnected: 'Desconectado',
      new_preset: 'Novo Preset', edit_preset: 'Editar Preset', current_scene: 'Cena atual',
      no_hotkey: 'Sem atalho', rule_1: 'regra', rule_n: 'regras',
      add_app: '+ Adicionar app...', system_label: 'Sistema', master_sys: 'Master (Sistema)',
      hotkey_used: 'Atalho já em uso: ', name_ph: 'Ex. Música, Estudo...'
    }
  };

  const LANG_OPTIONS = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ja', label: '日本語' },
    { value: 'ru', label: 'Русский' },
    { value: 'zh', label: '中文' },
    { value: 'pt', label: 'Português' },
  ];

  const FADE_OPTIONS = [
    { value: '0', label: '0 ms' },
    { value: '300', label: '300 ms' },
    { value: '500', label: '500 ms' },
    { value: '1000', label: '1000 ms' },
    { value: '1500', label: '1500 ms' },
    { value: '2000', label: '2000 ms' },
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
    { id: 'system', hex: null },
    { id: '#4A55A2', hex: '#4A55A2' },
    { id: '#0078D4', hex: '#0078D4' },
    { id: '#00897B', hex: '#00897B' },
    { id: '#7E57C2', hex: '#7E57C2' },
    { id: '#C65D3B', hex: '#C65D3B' },
    { id: '#C2185B', hex: '#C2185B' },
    { id: '#B27A00', hex: '#B27A00' },
  ];

  const SVG_SPEAKER = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
  const SVG_MUSIC = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
  const SVG_GEAR = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';
  const SVG_EDIT = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  const SVG_TRASH = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
  const SVG_CLOSE = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.6l6.3-6.31z"/></svg>';
  const SVG_CHEVRON = '<svg viewBox="0 0 24 24" class="icon-xs"><path d="M7 10l5 5 5-5z"/></svg>';

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
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
    language: 'es',
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
  let lastSettingsKey = '';
  let lastLang = '';

  function t(key) {
    const lang = appState.language || 'es';
    return (I18N[lang] && I18N[lang][key]) || I18N.es[key] || key;
  }

  function post(type, payload = {}) {
    if (window.ipc && window.ipc.postMessage) {
      window.ipc.postMessage(JSON.stringify({ type, ...payload }));
    }
  }

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
    const sat = Math.max(38, Math.min(85, s));
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

  function applyTranslations() {
    const lang = appState.language || 'es';
    if (lang === lastLang) return;
    lastLang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (k) el.textContent = t(k);
    });
    const inputNameEl = document.getElementById('input-preset-name');
    if (inputNameEl) inputNameEl.placeholder = t('name_ph');
    lastChannelSignature = '';
    renderPresets();
    renderChannels();
    renderMusic();
  }

  // Custom Material 3 Expressive Dropdown
  function setupM3Dropdown(container, options, getSelected, onSelect) {
    container.innerHTML = '';
    const trigger = document.createElement('button');
    trigger.className = 'm3-dd-trigger';
    const labelSpan = document.createElement('span');
    trigger.appendChild(labelSpan);
    trigger.insertAdjacentHTML('beforeend', SVG_CHEVRON);

    const menu = document.createElement('div');
    menu.className = 'm3-dd-menu hidden';

    const syncLabel = () => {
      const cur = String(getSelected());
      const found = options.find((o) => String(o.value) === cur) || options[0];
      labelSpan.textContent = found ? found.label : cur;
      menu.querySelectorAll('.m3-dd-item').forEach((item) => {
        item.classList.toggle('selected', item.dataset.val === cur);
      });
    };

    options.forEach((opt) => {
      const item = document.createElement('button');
      item.className = 'm3-dd-item';
      item.dataset.val = String(opt.value);
      item.textContent = opt.label;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.add('hidden');
        onSelect(opt.value);
        syncLabel();
      });
      menu.appendChild(item);
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasHidden = menu.classList.contains('hidden');
      document.querySelectorAll('.m3-dd-menu').forEach((m) => m.classList.add('hidden'));
      if (wasHidden) {
        syncLabel();
        menu.classList.remove('hidden');
      }
    });

    container.appendChild(trigger);
    container.appendChild(menu);
    container._syncLabel = syncLabel;
    syncLabel();
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.m3-dd-menu').forEach((m) => m.classList.add('hidden'));
  });

  // DOM References
  const toastBanner = document.getElementById('toast-banner');
  const mixerPresetsStrip = document.getElementById('mixer-presets-strip');
  const channelsList = document.getElementById('channels-list');

  const ddFadePresets = document.getElementById('dd-fade-presets');
  const ddFadeSettings = document.getElementById('dd-fade-settings');
  const ddLanguage = document.getElementById('dd-language');

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

  const miniSpTitle = document.getElementById('mini-sp-title');
  const miniSpArtist = document.getElementById('mini-sp-artist');
  const btnMiniPrev = document.getElementById('btn-mini-prev');
  const btnMiniPlay = document.getElementById('btn-mini-play');
  const btnMiniNext = document.getElementById('btn-mini-next');
  const iconMiniPlay = document.getElementById('icon-mini-play');
  const iconMiniPause = document.getElementById('icon-mini-pause');

  const btnThemeSystem = document.getElementById('btn-theme-system');
  const btnThemeLight = document.getElementById('btn-theme-light');
  const btnThemeDark = document.getElementById('btn-theme-dark');
  const accentSwatchesEl = document.getElementById('accent-swatches');
  const btnPinSwitch = document.getElementById('btn-pin-switch');

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

  setupM3Dropdown(
    ddFadePresets,
    FADE_OPTIONS.map((o) => ({ value: o.value, label: `Fade ${o.label}` })),
    () => appState.fade_duration_ms ?? 500,
    (v) => {
      appState.fade_duration_ms = Number(v);
      post('set_fade', { ms: Number(v) });
      if (ddFadeSettings._syncLabel) ddFadeSettings._syncLabel();
    }
  );

  setupM3Dropdown(
    ddFadeSettings,
    FADE_OPTIONS,
    () => appState.fade_duration_ms ?? 500,
    (v) => {
      appState.fade_duration_ms = Number(v);
      post('set_fade', { ms: Number(v) });
      if (ddFadePresets._syncLabel) ddFadePresets._syncLabel();
    }
  );

  setupM3Dropdown(
    ddLanguage,
    LANG_OPTIONS,
    () => appState.language || 'es',
    (v) => {
      appState.language = v;
      applyTranslations();
      lastSettingsKey = '';
      renderSettings();
      post('set_language', { lang: v });
    }
  );

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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderPresets() {
    mixerPresetsStrip.innerHTML = '';
    presetsManageList.innerHTML = '';

    (appState.presets || []).forEach((p) => {
      const isActive = appState.active_preset_id === p.id;

      const chip = document.createElement('button');
      chip.className = 'quick-preset-chip' + (isActive ? ' active' : '');
      chip.innerHTML = `${getPresetIconSvg(p.icon)}<span>${escapeHtml(p.name)}</span>` +
        (p.hotkey ? `<span class="quick-preset-kbd">${escapeHtml(formatHotkey(p.hotkey))}</span>` : '');
      chip.addEventListener('click', () => post('apply_preset', { id: p.id }));
      mixerPresetsStrip.appendChild(chip);

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
      const hkStr = p.hotkey ? formatHotkey(p.hotkey) : t('no_hotkey');
      const count = (p.rules || []).length;
      subEl.textContent = `${hkStr} · ${count} ${count === 1 ? t('rule_1') : t('rule_n')}`;

      info.appendChild(nameEl);
      info.appendChild(subEl);
      left.appendChild(iconBox);
      left.appendChild(info);

      const actions = document.createElement('div');
      actions.className = 'preset-manage-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-action-btn';
      editBtn.innerHTML = SVG_EDIT;
      editBtn.addEventListener('click', () => openEditPreset(p));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-action-btn danger';
      delBtn.innerHTML = SVG_TRASH;
      delBtn.addEventListener('click', () => post('delete_preset', { id: p.id }));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      card.appendChild(left);
      card.appendChild(actions);
      presetsManageList.appendChild(card);
    });

    if (appState.conflicts && appState.conflicts.length > 0) {
      hotkeyWarning.textContent = `${t('hotkey_used')}${appState.conflicts.join(', ')}`;
      hotkeyWarning.classList.remove('hidden');
    } else {
      hotkeyWarning.classList.add('hidden');
    }
  }

  function isTabletMode() {
    return window.innerWidth >= 600;
  }

  function attachSliderBehavior(wrap, onChange) {
    const updateFromPointer = (clientX, clientY) => {
      const rect = wrap.getBoundingClientRect();
      let val;
      if (isTabletMode()) {
        val = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
      } else {
        val = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      }
      applySliderVisual(wrap, val);
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
      updateFromPointer(e.clientX, e.clientY);
    });

    wrap.addEventListener('pointermove', (e) => {
      if (draggingKey === wrap.dataset.key && e.buttons > 0) {
        updateFromPointer(e.clientX, e.clientY);
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

  function applySliderVisual(wrap, val) {
    const fill = wrap.querySelector('.m3-slider-fill');
    const thumb = wrap.querySelector('.m3-slider-thumb');
    const pct = (val * 100).toFixed(1) + '%';
    if (isTabletMode()) {
      if (fill) { fill.style.height = pct; fill.style.width = '100%'; }
      if (thumb) { thumb.style.bottom = pct; thumb.style.top = 'auto'; }
    } else {
      if (fill) { fill.style.width = pct; fill.style.height = '100%'; }
      if (thumb) { thumb.style.left = pct; thumb.style.top = '50%'; thumb.style.bottom = 'auto'; }
    }
  }

  function createChannelCard({ key, name, iconUrl, fallbackSvg, volume, muted, isMaster }) {
    const card = document.createElement('div');
    card.className = 'channel-card' + (isMaster ? ' master' : '') + (muted ? ' muted' : '');
    card.dataset.key = key;

    const top = document.createElement('div');
    top.className = 'channel-top';

    const identity = document.createElement('div');
    identity.className = 'channel-identity';
    identity.title = isMaster ? 'Master' : `${name} (${key})`;

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
    muteBtn.textContent = muted ? t('mute') : t('silence');
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

    const faderArea = document.createElement('div');
    faderArea.className = 'channel-fader-area';

    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'm3-slider-wrap';
    sliderWrap.dataset.key = key;

    const track = document.createElement('div');
    track.className = 'm3-slider-track';
    const fill = document.createElement('div');
    fill.className = 'm3-slider-fill';
    track.appendChild(fill);

    const thumb = document.createElement('div');
    thumb.className = 'm3-slider-thumb';

    sliderWrap.appendChild(track);
    sliderWrap.appendChild(thumb);
    applySliderVisual(sliderWrap, volume);

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

    faderArea.appendChild(sliderWrap);
    faderArea.appendChild(vuTrack);

    card.appendChild(top);
    card.appendChild(faderArea);
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
      muteBtn.textContent = muted ? t('mute') : t('silence');
    }

    if (draggingKey !== card.dataset.key) {
      const wrap = card.querySelector('.m3-slider-wrap');
      if (wrap) applySliderVisual(wrap, volume);
      const pctEl = card.querySelector('.channel-pct');
      if (pctEl) pctEl.textContent = Math.round(volume * 100) + '%';
    }

    const vuFill = card.querySelector('.vu-fill');
    if (vuFill) {
      const p = muted ? 0 : smoothPeak(card.dataset.key, peak);
      const pct = (p * 100).toFixed(1) + '%';
      if (isTabletMode()) {
        vuFill.style.height = pct;
        vuFill.style.width = '100%';
      } else {
        vuFill.style.width = pct;
        vuFill.style.height = '100%';
      }
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
        empty.textContent = t('no_audio');
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

  // Re-sync slider orientation on window resize between mobile & tablet
  window.addEventListener('resize', () => {
    renderChannels();
  });

  // Spotify (both Música tab & Mini bar in Mixer)
  function renderMusic() {
    const sp = appState.spotify || {};
    const hasTrack = !!(sp.connected && sp.title);
    const titleStr = hasTrack ? sp.title : t('no_playback');
    const artistStr = hasTrack ? (sp.artist || 'Spotify') : t('open_spotify');

    spTitle.textContent = titleStr;
    spArtist.textContent = artistStr;
    spStatusChip.textContent = hasTrack ? (sp.is_playing ? t('playing') : t('paused')) : t('disconnected');
    iconSpPlay.classList.toggle('hidden', !!sp.is_playing);
    iconSpPause.classList.toggle('hidden', !sp.is_playing);

    miniSpTitle.textContent = titleStr;
    miniSpArtist.textContent = hasTrack ? (sp.artist || 'Spotify') : 'Spotify';
    iconMiniPlay.classList.toggle('hidden', !!sp.is_playing);
    iconMiniPause.classList.toggle('hidden', !sp.is_playing);
  }

  btnSpPrev.addEventListener('click', () => post('media_prev'));
  btnSpPlay.addEventListener('click', () => post('media_toggle_play'));
  btnSpNext.addEventListener('click', () => post('media_next'));
  btnMiniPrev.addEventListener('click', () => post('media_prev'));
  btnMiniPlay.addEventListener('click', () => post('media_toggle_play'));
  btnMiniNext.addEventListener('click', () => post('media_next'));

  // Configuraciones
  function renderSettings() {
    const sKey = `${appState.theme_mode}|${appState.accent_color}|${appState.system_accent_hex}|${appState.always_on_top}|${appState.fade_duration_ms}|${appState.language}`;
    if (sKey === lastSettingsKey) return;
    lastSettingsKey = sKey;

    const mode = appState.theme_mode || 'system';
    btnThemeSystem.classList.toggle('active', mode === 'system');
    btnThemeLight.classList.toggle('active', mode === 'light');
    btnThemeDark.classList.toggle('active', mode === 'dark');

    btnPinSwitch.classList.toggle('on', !!appState.always_on_top);
    btnPinSwitch.setAttribute('aria-checked', String(!!appState.always_on_top));

    if (ddFadePresets._syncLabel) ddFadePresets._syncLabel();
    if (ddFadeSettings._syncLabel) ddFadeSettings._syncLabel();
    if (ddLanguage._syncLabel) ddLanguage._syncLabel();

    accentSwatchesEl.innerHTML = '';
    ACCENT_SWATCHES.forEach((sw) => {
      const isSelected = appState.accent_color === sw.id;
      const btn = document.createElement('button');
      const dotColor = sw.hex || appState.system_accent_hex || '#4A55A2';

      if (sw.id === 'system') {
        btn.className = 'swatch-system' + (isSelected ? ' active' : '');
        btn.innerHTML = `<span class="swatch-dot" style="background:${dotColor}"></span><span>${t('system_label')}</span>`;
      } else {
        btn.className = 'swatch-circle' + (isSelected ? ' active' : '');
        btn.style.background = dotColor;
      }

      btn.addEventListener('click', () => {
        appState.accent_color = sw.id;
        applyThemeAndAccent();
        lastSettingsKey = '';
        renderSettings();
        post('set_accent', { color: sw.id });
      });
      accentSwatchesEl.appendChild(btn);
    });
  }

  btnThemeSystem.addEventListener('click', () => {
    appState.theme_mode = 'system';
    post('set_theme', { mode: 'system' });
  });
  btnThemeLight.addEventListener('click', () => {
    appState.theme_mode = 'light';
    appState.resolved_theme = 'light';
    applyThemeAndAccent();
    renderSettings();
    post('set_theme', { mode: 'light' });
  });
  btnThemeDark.addEventListener('click', () => {
    appState.theme_mode = 'dark';
    appState.resolved_theme = 'dark';
    applyThemeAndAccent();
    renderSettings();
    post('set_theme', { mode: 'dark' });
  });
  btnPinSwitch.addEventListener('click', () => post('toggle_pin'));

  // Presets Editor
  btnNewFromCurrent.addEventListener('click', () => openNewPreset(true));
  btnNewBlank.addEventListener('click', () => openNewPreset(false));

  function openNewPreset(fromCurrent) {
    editorState = {
      isNew: true,
      id: `preset-${Date.now()}`,
      name: fromCurrent ? t('current_scene') : t('new_preset'),
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
    dialogTitle.textContent = editorState.isNew ? t('new_preset') : t('edit_preset');
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
      mute.textContent = rule.muted ? t('mute') : t('on');
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

    selectAddApp.innerHTML = `<option value="">${t('add_app')}</option>`;
    if (!editorState.rules.some((r) => r.target_exe === '__master__')) {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ exe: '__master__', name: 'Master' });
      opt.textContent = t('master_sys');
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

  window.__onAudioState = (next) => {
    const prevPreset = appState.active_preset_id;
    const prevPresetsJson = JSON.stringify(appState.presets);
    const prevConflictsJson = JSON.stringify(appState.conflicts);

    appState = next;
    applyThemeAndAccent();
    applyTranslations();
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

  applyThemeAndAccent();
  applyTranslations();
  renderPresets();
  renderChannels();
  renderMusic();
  renderSettings();
})();
