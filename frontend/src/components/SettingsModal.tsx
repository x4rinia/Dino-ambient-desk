import React, { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Monitor,
  Layers,
  Calendar,
  RefreshCw,
  Maximize2,
  Compass,
  FileText,
  Plus,
  Image as ImageIcon,
  Type,
  Heart,
  Info,
  RotateCcw,
  Save,
  X,
  Move,
  Trash2,
  FolderOpen,
  Upload,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  AddonCompanionInfo,
  AmbientDeckConfig,
  BackgroundMode,
  CalendarEvent,
  ColorThemeMode,
  DinoVariant,
  MonitorInfo,
  OrientationMode,
  WindowLayerMode,
} from '../types';
import { Bridge, DEFAULT_CONFIG } from '../bridge';

interface SettingsModalProps {
  config: AmbientDeckConfig;
  monitors: MonitorInfo[];
  notes: string;
  events: CalendarEvent[];
  activeOrientation: 'portrait' | 'landscape';
  onUpdateConfig: (next: AmbientDeckConfig) => void;
  onChangeNotes: (val: string) => void;
  onSaveManualEvents: (events: CalendarEvent[]) => void;
  onSelectMonitor: (id: number) => void;
  onResetWidgetPositions: () => void;
  addonCompanions?: AddonCompanionInfo[];
  onClose: () => void;
}

const BACKGROUND_MODES: {
  id: BackgroundMode;
  label: string;
  desc: string;
}[] = [
  { id: 'wallpaper_blur', label: '🌫️ Geblurrt', desc: 'Widgets weichgezeichnet, dazwischen das Hintergrundbild' },
  { id: 'black', label: '⬛ Schwarz', desc: 'Widgets tiefschwarz, dazwischen das Hintergrundbild' },
];

const COLOR_THEMES: {
  id: ColorThemeMode;
  label: string;
  swatch: string;
}[] = [
  { id: 'cyber_blue', label: 'Cyber Blau', swatch: 'linear-gradient(135deg, #38bdf8, #34d399)' },
  { id: 'emerald', label: 'Dino Smaragd', swatch: 'linear-gradient(135deg, #10b981, #a7f3d0)' },
  { id: 'sunset_amber', label: 'Bernstein Gold', swatch: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { id: 'amethyst', label: 'Neon Violett', swatch: 'linear-gradient(135deg, #c084fc, #f472b6)' },
  { id: 'crimson', label: 'Rubin Rose', swatch: 'linear-gradient(135deg, #fb7185, #e11d48)' },
  { id: 'frost', label: 'Arktis Weiß', swatch: 'linear-gradient(135deg, #f8fafc, #94a3b8)' },
  { id: 'custom', label: 'Eigene Farbe', swatch: 'linear-gradient(135deg, #6366f1, #ec4899)' },
  {
    id: 'rainbow',
    label: '🌈 Regenbogen-Fade (Auto)',
    swatch: 'linear-gradient(90deg, #ff4d4d, #fbbf24, #34d399, #38bdf8, #c084fc)',
  },
];

const FONT_OPTIONS = [
  { label: 'Standard Sans (Inter / Segoe UI)', value: 'Segoe UI' },
  { label: 'Monospace (JetBrains Mono / Consolas)', value: 'Consolas' },
  { label: 'Segoe UI Light (Elegant & Dünn)', value: 'Segoe UI Light' },
  { label: 'Arial (Klassisch Sans)', value: 'Arial' },
  { label: 'Verdana (Breit & Gut lesbar)', value: 'Verdana' },
  { label: 'Trebuchet MS (Modern)', value: 'Trebuchet MS' },
  { label: 'Calibri (Weich & Klar)', value: 'Calibri' },
  { label: 'Georgia (Klassische Serife)', value: 'Georgia' },
  { label: 'Palatino Linotype (Buchdruck)', value: 'Palatino Linotype' },
  { label: 'Times New Roman (Serife)', value: 'Times New Roman' },
  { label: 'Courier New (Schreibmaschine)', value: 'Courier New' },
  { label: 'Tahoma (Kompakt)', value: 'Tahoma' },
  { label: 'Comic Sans MS (Locker)', value: 'Comic Sans MS' },
  { label: 'Impact (Kräftig)', value: 'Impact' },
];

const DINO_VARIANTS: {
  id: DinoVariant;
  label: string;
  desc: string;
}[] = [
  { id: 'ankylosaurus', label: '🛡️ Ankylosaurus', desc: 'Türkiser Panzer-Dino mit Keule' },
  { id: 'triceratops', label: '👑 Triceratops', desc: 'Bernstein Dreihorn mit Nackenschild' },
  { id: 'stegosaurus', label: '⚡ Stegosaurus', desc: 'Violetter Dino mit Rückenplatten' },
  { id: 'brachiosaurus', label: '🌿 Brachiosaurus', desc: 'Smaragdgrüner Langhals-Dino' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  monitors,
  notes,
  events,
  activeOrientation,
  onUpdateConfig,
  onChangeNotes,
  onSaveManualEvents,
  onSelectMonitor,
  onResetWidgetPositions,
  addonCompanions = [],
  onClose,
}) => {
  const initialSnapshotRef = useRef<AmbientDeckConfig | null>(null);
  useEffect(() => {
    if (!initialSnapshotRef.current && config.window.width > 0) {
      initialSnapshotRef.current = JSON.parse(JSON.stringify(config));
    }
  }, [config]);

  const [icalInput, setIcalInput] = useState(
    config.modules.clock_calendar.google_ical_url || ''
  );
  const [syncMessage, setSyncMessage] = useState('');
  const [statusBanner, setStatusBanner] = useState('');
  const [customX, setCustomX] = useState(config.window.x);
  const [customY, setCustomY] = useState(config.window.y);
  const [customWidth, setCustomWidth] = useState(config.window.width);
  const [customHeight, setCustomHeight] = useState(config.window.height);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(() =>
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);

  useEffect(() => {
    setCustomX(config.window.x);
    setCustomY(config.window.y);
    setCustomWidth(config.window.width);
    setCustomHeight(config.window.height);
  }, [config.window.x, config.window.y, config.window.width, config.window.height]);

  useEffect(() => {
    setIcalInput(config.modules.clock_calendar.google_ical_url || '');
  }, [config.modules.clock_calendar.google_ical_url]);

  const targetMonitor =
    monitors.find((m) => m.id === config.window.monitor_id) || monitors[0];
  const maxMonitorW = targetMonitor ? targetMonitor.width : 3840;
  const maxMonitorH = targetMonitor ? targetMonitor.height : 2160;

  const toggleModule = (key: keyof AmbientDeckConfig['modules']) => {
    const current = config.modules[key] as { enabled: boolean };
    const nextConfig: AmbientDeckConfig = {
      ...config,
      modules: {
        ...config.modules,
        [key]: {
          ...current,
          enabled: !current.enabled,
        },
      },
    };
    onUpdateConfig(nextConfig);
  };

  const handleLayerChange = (layerMode: WindowLayerMode) => {
    const alwaysOnBottom = layerMode === 'background';
    Bridge.setLayerMode(layerMode);
    onUpdateConfig({
      ...config,
      window: {
        ...config.window,
        layer_mode: layerMode,
        always_on_bottom: alwaysOnBottom,
      },
    });
  };

  const handleOrientationChange = (mode: OrientationMode, resizeWindow = false) => {
    Bridge.setOrientationMode(mode, resizeWindow);
    onUpdateConfig({
      ...config,
      window: {
        ...config.window,
        orientation_mode: mode,
      },
    });
  };

  const handleLiveSizeChange = (nextW: number, nextH: number, center = false) => {
    const clampedW = Math.max(440, Math.round(nextW));
    const clampedH = Math.max(380, Math.round(nextH));
    setCustomWidth(clampedW);
    setCustomHeight(clampedH);
    if (center) {
      Bridge.setWindowSize(clampedW, clampedH, true);
    } else {
      Bridge.setWindowBounds(Math.round(customX), Math.round(customY), clampedW, clampedH);
    }
  };

  const handleApplyExactBounds = () => {
    const clampedW = Math.max(440, Math.round(customWidth));
    const clampedH = Math.max(380, Math.round(customHeight));
    Bridge.setWindowBounds(Math.round(customX), Math.round(customY), clampedW, clampedH);
  };

  const handleBackgroundModeChange = (bgMode: BackgroundMode) => {
    onUpdateConfig({
      ...config,
      theme: {
        ...config.theme,
        background_mode: bgMode,
      },
    });
  };

  const handleThemeChange = (colorMode: ColorThemeMode) => {
    onUpdateConfig({
      ...config,
      theme: {
        ...config.theme,
        color_mode: colorMode,
      },
    });
  };

  const handleSaveGoogleIcal = () => {
    const trimmed = icalInput.trim();
    onUpdateConfig({
      ...config,
      modules: {
        ...config.modules,
        clock_calendar: {
          ...config.modules.clock_calendar,
          google_ical_url: trimmed,
        },
      },
    });
    if (trimmed) {
      Bridge.syncGoogleCalendar(trimmed);
      setSyncMessage('Google Kalender wird synchronisiert...');
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  // Active manual calendar notes (max 3; expired ones are auto-filtered & auto-deleted)
  const activeManualEvents = (events || [])
    .filter(
      (ev) =>
        ev.source !== 'google' &&
        ev.source !== 'ics' &&
        new Date(ev.start_iso).getTime() > Date.now()
    )
    .sort((a, b) => new Date(a.start_iso).getTime() - new Date(b.start_iso).getTime())
    .slice(0, 3);

  const handleUpdateManualEvent = (
    id: string,
    patch: { title?: string; start_iso?: string }
  ) => {
    const nextList = activeManualEvents.map((ev) =>
      ev.id === id
        ? {
            ...ev,
            ...patch,
          }
        : ev
    );
    onSaveManualEvents(nextList);
  };

  const handleDeleteManualEvent = (id: string) => {
    const nextList = activeManualEvents.filter((ev) => ev.id !== id);
    onSaveManualEvents(nextList);
    setSyncMessage('Kalendernotiz gelöscht.');
    setTimeout(() => setSyncMessage(''), 2000);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;
    if (activeManualEvents.length >= 3) {
      setSyncMessage('Maximal 3 aktive Kalendernotizen möglich.');
      setTimeout(() => setSyncMessage(''), 2500);
      return;
    }
    const iso = newEventDate.length === 16 ? `${newEventDate}:00` : newEventDate;
    if (new Date(iso).getTime() <= Date.now()) {
      setSyncMessage('Bitte ein zukünftiges Datum/Uhrzeit wählen (Vergangene werden auto-gelöscht).');
      setTimeout(() => setSyncMessage(''), 3000);
      return;
    }
    const nextList: CalendarEvent[] = [
      ...activeManualEvents,
      {
        id: `ev-${Date.now()}`,
        title: newEventTitle.trim(),
        start_iso: iso,
        source: 'json',
      },
    ];
    onSaveManualEvents(nextList);
    setNewEventTitle('');
    setSyncMessage('Kalendernotiz gespeichert!');
    setTimeout(() => setSyncMessage(''), 2500);
  };

  // Action Buttons: Zurücksetzen, Abbrechen, Speichern
  const handleResetToDefaults = () => {
    const resetCfg: AmbientDeckConfig = {
      ...DEFAULT_CONFIG,
      window: {
        ...config.window,
        layer_mode: 'background',
        always_on_bottom: true,
        orientation_mode: 'auto',
        widget_positions: {},
      },
      theme: {
        ...DEFAULT_CONFIG.theme,
        font_family: 'Segoe UI',
        font_scale: 100,
        use_custom_text_color: false,
      },
    };
    onUpdateConfig(resetCfg);
    setStatusBanner('Auf Standardwerte & automatische Widget-Positionen zurückgesetzt!');
    setTimeout(() => setStatusBanner(''), 3500);
  };

  const handleCancelAndClose = () => {
    if (initialSnapshotRef.current) {
      onUpdateConfig(initialSnapshotRef.current);
      Bridge.setWindowBounds(
        initialSnapshotRef.current.window.x,
        initialSnapshotRef.current.window.y,
        initialSnapshotRef.current.window.width,
        initialSnapshotRef.current.window.height
      );
    }
    onClose();
  };

  const handleSaveAndClose = () => {
    onUpdateConfig(config);
    onClose();
  };

  const rawBg = config.theme?.background_mode as string | undefined;
  const currentBgMode: BackgroundMode =
    rawBg === 'black' ? 'black' : 'wallpaper_blur';

  const currentDinoVariant = (config.modules.dino_companion?.variant ||
    'ankylosaurus') as DinoVariant;

  const currentVariantId = (config.modules.dino_companion?.variant || 'ankylosaurus').toLowerCase();
  const activeAddon = (addonCompanions || []).find((c) => c.id.toLowerCase() === currentVariantId);
  const companionDisplayName = activeAddon ? activeAddon.name : 'Ankylosaurus';
  const companionDisplayIcon = activeAddon ? (activeAddon.icon || '✨') : '🦖';
  const companionDisplayPreview = activeAddon
    ? (activeAddon.preview_url || activeAddon.sprites?.walk?.[0] || '/dino/walk_0.png')
    : '/dino/walk_0.png';
  const companionDisplayDesc = activeAddon
    ? activeAddon.description
    : 'Läuft sanft um seinen Ankerpunkt hin und her, wedelt fröhlich mit der Keule und springt ab und zu vor Freude hoch!';

  const allAvailableCompanions = React.useMemo(() => {
    const list: AddonCompanionInfo[] = [];
    const hasAnky = (addonCompanions || []).some(
      (c) => c.id.toLowerCase() === 'ankylosaurus'
    );
    if (!hasAnky) {
      list.push({
        id: 'ankylosaurus',
        name: 'Ankylosaurus',
        description: 'Der treue Standard-Dino: Läuft ruhig, wedelt sanft mit seiner Keule und springt vor Freude hoch!',
        icon: '🦖',
        author: 'Dino Desk Team',
        preview_url: '/dino/walk_0.png',
        walk_frames: 4,
        jump_frames: 4,
        tail_frames: 4,
      });
    }
    list.push(...(addonCompanions || []));
    return list;
  }, [addonCompanions]);

  const currentCycleVariants: DinoVariant[] =
    config.modules.dino_companion?.cycle_variants &&
    config.modules.dino_companion.cycle_variants.length > 0
      ? config.modules.dino_companion.cycle_variants
      : ['ankylosaurus', 'triceratops', 'stegosaurus', 'brachiosaurus'];

  const toggleDinoInCycle = (dinoId: DinoVariant, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    let next = currentCycleVariants.includes(dinoId)
      ? currentCycleVariants.filter((id) => id !== dinoId)
      : [...currentCycleVariants, dinoId];
    if (next.length === 0) {
      next = [dinoId];
    }
    onUpdateConfig({
      ...config,
      modules: {
        ...config.modules,
        dino_companion: {
          ...config.modules.dino_companion,
          enabled: true,
          cycle_variants: next,
        },
      },
    });
  };

  return (
    <div className="standalone-settings-root">
      <div className="glass-panel settings-modal standalone-window">
        {/* Sticky Header with Zurücksetzen, Abbrechen & Speichern */}
        <div
          className="widget-header"
          style={{
            marginBottom: 4,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div className="widget-title" style={{ fontSize: '0.9rem' }}>
            <Settings size={16} color="#38bdf8" />
            <span>Dino_ambient_Deck — Einstellungen</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="icon-btn active-amber"
              onClick={handleResetToDefaults}
              title="Alle Farben, Schriften, Module und Widget-Positionen auf Standard zurücksetzen"
            >
              <RotateCcw size={13} />
              <span>Zurücksetzen</span>
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={handleCancelAndClose}
              title="Änderungen verwerfen und Fenster schließen"
            >
              <X size={13} />
              <span>Abbrechen</span>
            </button>

            <button
              type="button"
              className="icon-btn active-emerald"
              onClick={handleSaveAndClose}
              style={{ fontWeight: 700, padding: '0 14px' }}
              title="Einstellungen speichern und schließen"
            >
              <Save size={13} />
              <span>Speichern</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div
            style={{
              background: 'rgba(52, 211, 153, 0.14)',
              border: '1px solid rgba(52, 211, 153, 0.45)',
              color: '#6ee7b7',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: '0.76rem',
              fontWeight: 600,
            }}
          >
            ✓ {statusBanner}
          </div>
        )}

        {/* Hint for dragging individual widgets while Settings is open */}
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.10)',
            border: '1px solid rgba(56, 189, 248, 0.30)',
            borderRadius: 8,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0' }}>
            <Move size={14} color="#38bdf8" />
            <span>
              <strong>Tipp:</strong> Solange dieses Einstellungsfenster offen ist, kannst du jedes einzelne Widget direkt auf dem Monitor mit der Maus frei verschieben!
            </span>
          </div>
          <button
            type="button"
            className="icon-btn active-blue"
            onClick={() => {
              onResetWidgetPositions();
              setStatusBanner('Alle Widgets wurden wieder automatisch angeordnet!');
              setTimeout(() => setStatusBanner(''), 3000);
            }}
          >
            <RotateCcw size={12} />
            <span>Widgets automatisch anordnen</span>
          </button>
        </div>

        {/* 1. Widget-Darstellung (Glas, Geblurrt, Schwarz — dazwischen das Hintergrundbild) */}
        <div className="settings-section">
          <div className="widget-title" style={{ marginBottom: 8 }}>
            <ImageIcon size={13} color="#38bdf8" />
            <span>1. Widget-Optik (Zwischen den Widgets ist immer dein Hintergrundbild sichtbar)</span>
          </div>

          <div
            className="theme-swatches-grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))' }}
          >
            {BACKGROUND_MODES.map((bm) => (
              <button
                type="button"
                key={bm.id}
                className={`theme-swatch-btn ${currentBgMode === bm.id ? 'selected' : ''}`}
                onClick={() => handleBackgroundModeChange(bm.id)}
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '8px 11px' }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#f3f5f9' }}>
                  {bm.label}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>{bm.desc}</span>
              </button>
            ))}
          </div>

          {currentBgMode === 'wallpaper_blur' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                Blur-Stärke der einzelnen Widgets:
              </span>
              <input
                type="range"
                min={4}
                max={40}
                value={config.theme?.wallpaper_blur_px ?? 18}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    theme: {
                      ...config.theme,
                      wallpaper_blur_px: Number(e.target.value),
                    },
                  })
                }
              />
              <span className="widget-badge">{config.theme?.wallpaper_blur_px ?? 18} px</span>
            </div>
          )}
        </div>

        {/* 2. Monitor, Freie Fenstergröße, Ausrichtung (Hochkant / Quer) & Vorder-/Hintergrund */}
        <div className="settings-section">
          <div className="widget-title" style={{ marginBottom: 8 }}>
            <Monitor size={13} color="#38bdf8" />
            <span>2. Monitor, Freie Fenstergröße, Ausrichtung & Ebene (Nur Vorder- oder Hintergrund)</span>
          </div>

          <div className="settings-grid">
            <div className="setting-card-col">
              <span className="setting-label">Ziel-Monitor auswählen</span>
              <select
                className="toolbar-select"
                style={{ width: '100%', padding: '7px 10px' }}
                value={config.window.monitor_id}
                onChange={(e) => onSelectMonitor(Number(e.target.value))}
              >
                {monitors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nur Vordergrund oder Hintergrund */}
            <div className="setting-card-col">
              <span className="setting-label">Fenster-Ebene (Vorder- oder Hintergrund)</span>
              <div className="segmented-row">
                <button
                  type="button"
                  className={`icon-btn flex-1 ${
                    config.window.layer_mode !== 'foreground' ? 'active-blue' : ''
                  }`}
                  onClick={() => handleLayerChange('background')}
                >
                  <Layers size={12} />
                  <span>📌 Hintergrund (Wie Wallpaper)</span>
                </button>
                <button
                  type="button"
                  className={`icon-btn flex-1 ${
                    config.window.layer_mode === 'foreground' ? 'active-emerald' : ''
                  }`}
                  onClick={() => handleLayerChange('foreground')}
                >
                  <Layers size={12} />
                  <span>⬆️ Vordergrund (Immer oben)</span>
                </button>
              </div>
            </div>

            <div className="setting-card-col">
              <span className="setting-label">
                Ausrichtung (Aktuell:{' '}
                <strong>
                  {activeOrientation === 'portrait' ? 'Hochkant (Portrait)' : 'Querformat (Landscape)'}
                </strong>
                )
              </span>
              <div className="segmented-row">
                <button
                  type="button"
                  className={`icon-btn flex-1 ${
                    config.window.orientation_mode === 'auto' ? 'active-blue' : ''
                  }`}
                  onClick={() => handleOrientationChange('auto', false)}
                >
                  <span>Auto</span>
                </button>
                <button
                  type="button"
                  className={`icon-btn flex-1 ${
                    config.window.orientation_mode === 'landscape' ? 'active-emerald' : ''
                  }`}
                  onClick={() => handleOrientationChange('landscape', true)}
                >
                  <span>Querformat</span>
                </button>
                <button
                  type="button"
                  className={`icon-btn flex-1 ${
                    config.window.orientation_mode === 'portrait' ? 'active-amber' : ''
                  }`}
                  onClick={() => handleOrientationChange('portrait', true)}
                >
                  <span>Hochkant</span>
                </button>
              </div>
            </div>

            <label className="setting-toggle-card">
              <span>🚀 Mit Windows automatisch starten (Autostart)</span>
              <input
                type="checkbox"
                checked={config.window.autostart}
                onChange={(e) => {
                  const next = e.target.checked;
                  Bridge.setAutostart(next);
                  onUpdateConfig({
                    ...config,
                    window: { ...config.window, autostart: next },
                  });
                }}
              />
            </label>
          </div>

          {/* Freie Fenstergröße (Stufenlose Regler + Direkteingabe) */}
          <div className="setting-card-col" style={{ marginTop: 8 }}>
            <span className="setting-label">
              <Maximize2 size={11} style={{ display: 'inline', marginRight: 5 }} />
              Freie Fenstergröße & Position auf dem Monitor einstellen
            </span>

            <div className="settings-grid" style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem' }}>
                  <span>Breite:</span>
                  <span className="widget-badge">{customWidth} px</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="range"
                    min={440}
                    max={maxMonitorW}
                    value={Math.min(maxMonitorW, customWidth)}
                    onChange={(e) => handleLiveSizeChange(Number(e.target.value), customHeight, false)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    min={440}
                    max={maxMonitorW}
                    value={customWidth}
                    onChange={(e) => handleLiveSizeChange(Number(e.target.value), customHeight, false)}
                    style={{
                      width: 74,
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '4px 6px',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem' }}>
                  <span>Höhe:</span>
                  <span className="widget-badge">{customHeight} px</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="range"
                    min={380}
                    max={maxMonitorH}
                    value={Math.min(maxMonitorH, customHeight)}
                    onChange={(e) => handleLiveSizeChange(customWidth, Number(e.target.value), false)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    min={380}
                    max={maxMonitorH}
                    value={customHeight}
                    onChange={(e) => handleLiveSizeChange(customWidth, Number(e.target.value), false)}
                    style={{
                      width: 74,
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '4px 6px',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                X-Position:{' '}
                <input
                  type="number"
                  value={customX}
                  onChange={(e) => setCustomX(Number(e.target.value))}
                  style={{
                    width: 72,
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6,
                    padding: '4px 6px',
                    color: '#fff',
                  }}
                />
              </label>

              <label style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Y-Position:{' '}
                <input
                  type="number"
                  value={customY}
                  onChange={(e) => setCustomY(Number(e.target.value))}
                  style={{
                    width: 72,
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6,
                    padding: '4px 6px',
                    color: '#fff',
                  }}
                />
              </label>

              <button
                type="button"
                className="icon-btn active-emerald"
                onClick={handleApplyExactBounds}
              >
                <span>Position X/Y setzen</span>
              </button>

              <button
                type="button"
                className="icon-btn active-blue"
                onClick={() => handleLiveSizeChange(customWidth, customHeight, true)}
              >
                <span>Auf Monitor zentrieren</span>
              </button>

              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  if (targetMonitor) {
                    setCustomX(targetMonitor.x);
                    setCustomY(targetMonitor.y);
                    setCustomWidth(targetMonitor.width);
                    setCustomHeight(targetMonitor.height);
                    Bridge.setWindowBounds(
                      targetMonitor.x,
                      targetMonitor.y,
                      targetMonitor.width,
                      targetMonitor.height
                    );
                  }
                }}
              >
                <span>Ganzen Monitor ausfüllen</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Schriftart, Schriftgröße, Schriftfarbe & Regenbogen-Farben */}
        <div className="settings-section">
          <div className="widget-title" style={{ marginBottom: 8 }}>
            <Type size={13} color="#34d399" />
            <span>3. Schrift & Akzent-Farben frei einstellen (Wirkt sofort auf das Hintergrund-Widget)</span>
          </div>

          <div className="settings-grid" style={{ marginBottom: 10 }}>
            <div className="setting-card-col">
              <span className="setting-label">Schriftart auswählen oder frei eingeben</span>
              <select
                className="toolbar-select"
                style={{ width: '100%', padding: '6px 10px' }}
                value={
                  FONT_OPTIONS.some((f) => f.value === config.theme.font_family)
                    ? config.theme.font_family
                    : 'Segoe UI'
                }
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    theme: { ...config.theme, font_family: e.target.value },
                  })
                }
              >
                {FONT_OPTIONS.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Oder beliebigen Windows-Schriftnamen tippen (z.B.Georgia, Impact, Calibri)..."
                value={config.theme.font_family || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    theme: { ...config.theme, font_family: e.target.value },
                  })
                }
                style={{
                  marginTop: 4,
                  background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '5px 8px',
                  color: '#fff',
                  fontSize: '0.73rem',
                  userSelect: 'text',
                }}
              />
            </div>

            <div className="setting-card-col">
              <span className="setting-label">
                Schriftgröße skalieren (<strong>{config.theme.font_scale ?? 100}%</strong>) & Schriftfarbe
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <input
                  type="range"
                  min={70}
                  max={150}
                  value={config.theme.font_scale ?? 100}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      theme: { ...config.theme, font_scale: Number(e.target.value) },
                    })
                  }
                  style={{ flex: 1 }}
                />
                <span className="widget-badge">{config.theme.font_scale ?? 100}%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.theme.use_custom_text_color ?? false}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        theme: { ...config.theme, use_custom_text_color: e.target.checked },
                      })
                    }
                  />
                  <span>Eigene feste Schriftfarbe:</span>
                </label>
                <input
                  type="color"
                  value={config.theme.text_color || '#f3f5f9'}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      theme: {
                        ...config.theme,
                        use_custom_text_color: true,
                        text_color: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="theme-swatches-grid">
            {COLOR_THEMES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`theme-swatch-btn ${
                  config.theme.color_mode === t.id ? 'selected' : ''
                }`}
                onClick={() => handleThemeChange(t.id)}
              >
                <span className="swatch-dot" style={{ background: t.swatch }} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {config.theme.color_mode === 'custom' && (
            <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                <span>Haupt-Akzentfarbe:</span>
                <input
                  type="color"
                  value={config.theme.custom_primary}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      theme: { ...config.theme, custom_primary: e.target.value },
                    })
                  }
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                <span>Zweit-Akzentfarbe:</span>
                <input
                  type="color"
                  value={config.theme.custom_secondary}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      theme: { ...config.theme, custom_secondary: e.target.value },
                    })
                  }
                />
              </label>
            </div>
          )}

          {config.theme.color_mode === 'rainbow' && (
            <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                Regenbogen-Geschwindigkeit (nur auf dem Widget):
              </span>
              <input
                type="range"
                min={1}
                max={20}
                value={config.theme.rainbow_speed}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    theme: { ...config.theme, rainbow_speed: Number(e.target.value) },
                  })
                }
              />
              <span className="widget-badge">{config.theme.rainbow_speed}x</span>
            </div>
          )}
        </div>

        {/* 4. Überschrift, Zyklus-Kalender, Countdown, Notizen & 3 Bearbeitbare Kalendernotizen */}
        <div className="settings-section">
          <div className="widget-title" style={{ marginBottom: 8 }}>
            <Heart size={13} color="#fb7185" />
            <span>4. Überschrift, Zyklus-Kalender, Countdown, Notizen & Kalendernotizen (Max. 3 aktiv)</span>
          </div>

          {/* Optionale Überschrift oben (Leer = "Dino") */}
          <div className="setting-card-col" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="setting-label">
                🏷️ Optionale Überschrift oben auf dem Widget (Wenn leer, steht dort automatisch <strong>„Dino“</strong>)
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.modules.header_title?.enabled ?? true}
                  onChange={() => toggleModule('header_title')}
                />
                <span>Überschrift anzeigen</span>
              </label>
            </div>
            <input
              type="text"
              placeholder="Überschrift eingeben (oder leer lassen für „Dino“)..."
              value={config.modules.header_title?.text || ''}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  modules: {
                    ...config.modules,
                    header_title: {
                      enabled: config.modules.header_title?.enabled ?? true,
                      text: e.target.value,
                    },
                  },
                })
              }
              style={{
                marginTop: 4,
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 6,
                padding: '6px 10px',
                color: '#fff',
                fontSize: '0.75rem',
                userSelect: 'text',
              }}
            />
          </div>

          <div className="settings-grid">
            {/* Zyklus-Kalender */}
            <div className="setting-card-col">
              <span className="setting-label">
                🌸 Zyklus-Kalender (Erster Tag der letzten Periode & Dauer)
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 2 }}>
                <label style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  Startdatum:{' '}
                  <input
                    type="date"
                    value={config.modules.cycle_tracker?.last_period_start || '2026-10-12'}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        modules: {
                          ...config.modules,
                          cycle_tracker: {
                            ...config.modules.cycle_tracker,
                            last_period_start: e.target.value,
                          },
                        },
                      })
                    }
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '3px 6px',
                      color: '#fff',
                    }}
                  />
                </label>

                <label style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  Zyklus (Tage):{' '}
                  <input
                    type="number"
                    min={20}
                    max={45}
                    value={config.modules.cycle_tracker?.cycle_length_days ?? 28}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        modules: {
                          ...config.modules,
                          cycle_tracker: {
                            ...config.modules.cycle_tracker,
                            cycle_length_days: Math.max(20, Math.min(45, Number(e.target.value) || 28)),
                          },
                        },
                      })
                    }
                    style={{
                      width: 54,
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '3px 6px',
                      color: '#fff',
                    }}
                  />
                </label>

                <label style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  Periode (Tage):{' '}
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={config.modules.cycle_tracker?.period_length_days ?? 5}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        modules: {
                          ...config.modules,
                          cycle_tracker: {
                            ...config.modules.cycle_tracker,
                            period_length_days: Math.max(2, Math.min(10, Number(e.target.value) || 5)),
                          },
                        },
                      })
                    }
                    style={{
                      width: 50,
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '3px 6px',
                      color: '#fff',
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Countdown */}
            <div className="setting-card-col">
              <span className="setting-label">
                <Compass size={11} style={{ display: 'inline', marginRight: 4 }} />
                Countdown Titel & Ziel-Datum
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                <input
                  type="text"
                  value={config.modules.countdown.label}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      modules: {
                        ...config.modules,
                        countdown: {
                          ...config.modules.countdown,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Countdown Titel"
                  style={{
                    flex: 1,
                    minWidth: 100,
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: '#fff',
                    fontSize: '0.74rem',
                    userSelect: 'text',
                  }}
                />
                <input
                  type="datetime-local"
                  value={config.modules.countdown.target_iso.slice(0, 16)}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      modules: {
                        ...config.modules,
                        countdown: {
                          ...config.modules.countdown,
                          target_iso:
                            e.target.value.length === 16
                              ? `${e.target.value}:00`
                              : e.target.value,
                        },
                      },
                    })
                  }
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6,
                    padding: '4px 6px',
                    color: '#fff',
                    fontSize: '0.7rem',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="settings-grid" style={{ marginTop: 8 }}>
            <div className="setting-card-col">
              <span className="setting-label">
                <FileText size={11} style={{ display: 'inline', marginRight: 4 }} />
                Allgemeine Notizen (Notizen-Widget auf dem Dashboard)
              </span>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => onChangeNotes(e.target.value)}
                placeholder="Notizen hier eingeben..."
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '6px 8px',
                  color: '#fff',
                  fontSize: '0.73rem',
                  resize: 'vertical',
                  userSelect: 'text',
                }}
              />
            </div>

            {/* Bis zu 3 aktive Kalendernotizen / Termine (direkt bearbeitbar & verstrichene auto-gelöscht) */}
            <div className="setting-card-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="setting-label">
                  📅 Kalendernotizen / Termine ({activeManualEvents.length}/3 aktiv — Verstrichene werden auto-gelöscht)
                </span>
              </div>

              {activeManualEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {activeManualEvents.map((ev, index) => (
                    <div
                      key={ev.id}
                      style={{
                        display: 'flex',
                        gap: 6,
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '5px 7px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#38bdf8',
                          minWidth: 16,
                        }}
                      >
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={ev.title}
                        onChange={(e) =>
                          handleUpdateManualEvent(ev.id, { title: e.target.value })
                        }
                        placeholder="Kalendernotiz bearbeiten..."
                        style={{
                          flex: 1,
                          minWidth: 90,
                          background: 'rgba(0,0,0,0.45)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          borderRadius: 5,
                          padding: '4px 7px',
                          color: '#fff',
                          fontSize: '0.73rem',
                          userSelect: 'text',
                        }}
                      />
                      <input
                        type="datetime-local"
                        value={(ev.start_iso || '').slice(0, 16)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const iso = val.length === 16 ? `${val}:00` : val;
                          handleUpdateManualEvent(ev.id, { start_iso: iso });
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.45)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          borderRadius: 5,
                          padding: '3px 5px',
                          color: '#fff',
                          fontSize: '0.68rem',
                        }}
                      />
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => handleDeleteManualEvent(ev.id)}
                        title="Kalendernotiz löschen"
                        style={{ padding: '0 7px', color: '#fb7185' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.71rem', color: '#94a3b8', marginTop: 2 }}>
                  Aktuell keine Kalendernotiz eingetragen (bis zu 3 anlegbar).
                </div>
              )}

              {activeManualEvents.length < 3 ? (
                <form
                  onSubmit={handleAddEvent}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span style={{ fontSize: '0.69rem', color: '#cbd5e1' }}>
                    + Neue Kalendernotiz anlegen (Platz {activeManualEvents.length + 1} von 3):
                  </span>
                  <input
                    type="text"
                    placeholder="Termin / Kalendernotiz eingeben..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '5px 8px',
                      color: '#fff',
                      fontSize: '0.74rem',
                      userSelect: 'text',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="datetime-local"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.45)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        padding: '4px 6px',
                        color: '#fff',
                        fontSize: '0.7rem',
                      }}
                    />
                    <button type="submit" className="icon-btn active-emerald">
                      <Plus size={12} />
                      <span>Anlegen</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: '0.7rem',
                    color: '#fbbf24',
                    background: 'rgba(251, 191, 36, 0.08)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    borderRadius: 6,
                    padding: '4px 8px',
                  }}
                >
                  Alle 3 Plätze belegt. Du kannst jede Notiz oben direkt bearbeiten oder löschen (verstrichene Termine werden automatisch gelöscht).
                </div>
              )}
            </div>
          </div>

          {/* iCal / Google Kalender URL (Optional falls vorhanden) */}
          <div
            style={{
              marginTop: 8,
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              borderRadius: 8,
              padding: '8px 10px',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: 6 }}>
              <Info size={12} color="#38bdf8" style={{ display: 'inline', marginRight: 5 }} />
              <strong>Optional — iCal / Google Kalender URL eintragen:</strong> Falls du Google Kalender (oder einen anderen iCal-Kalender) nutzt, kannst du hier die <strong>iCal-URL (<code>.ics</code>)</strong> eintragen:
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Calendar size={14} color="#38bdf8" />
              <input
                type="text"
                placeholder="iCal / Google Kalender URL (z.B. https://calendar.google.com/calendar/ical/.../basic.ics)"
                value={icalInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setIcalInput(val);
                  onUpdateConfig({
                    ...config,
                    modules: {
                      ...config.modules,
                      clock_calendar: {
                        ...config.modules.clock_calendar,
                        google_ical_url: val.trim(),
                      },
                    },
                  });
                }}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  color: '#fff',
                  fontSize: '0.74rem',
                  userSelect: 'text',
                }}
              />
              <button
                type="button"
                className="icon-btn active-blue"
                onClick={handleSaveGoogleIcal}
              >
                <RefreshCw size={12} />
                <span>iCal Sync</span>
              </button>
            </div>
            {syncMessage && (
              <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: 4 }}>
                {syncMessage}
              </div>
            )}
          </div>
        </div>

        {/* 5. Dino-Begleiter (Ankylosaurus) mit Animationen & Ankerpunkt */}
        <div className="settings-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div className="widget-title">
              <span>5. Begleiter — {companionDisplayIcon} {companionDisplayName}</span>
            </div>

            <label className="setting-toggle-card" style={{ gap: 8, padding: '5px 12px' }}>
              <span>Begleiter aktivieren</span>
              <input
                type="checkbox"
                checked={config.modules.dino_companion?.enabled ?? true}
                onChange={() => toggleModule('dino_companion')}
              />
            </label>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'rgba(14, 18, 28, 0.45)',
            }}
          >
            <div
              style={{
                width: '74px',
                height: '66px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '4px',
              }}
            >
              <img
                src={companionDisplayPreview}
                alt={companionDisplayName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/dino/walk_0.png';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{companionDisplayIcon} Dein Begleiter: {companionDisplayName}</span>
                <span style={{ fontSize: '0.64rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 7px', borderRadius: '999px', border: '1px solid rgba(52, 211, 153, 0.35)' }}>
                  Lebendig animiert
                </span>
              </div>
              <div style={{ fontSize: '0.73rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {companionDisplayDesc}
              </div>

              {/* Prominenter Button zur Begleiter-Auswahl & Addon-Verwaltung */}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsCompanionModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Begleiter auswählen ({allAvailableCompanions.length} erkannt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => Bridge.openCompanionsFolder()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: '7px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#cbd5e1',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Öffnet den Begleiter-Ordner im Windows Explorer zum Hinzufügen von .companion.json Dateien"
                >
                  <FolderOpen size={12} color="#38bdf8" />
                  <span>Ordner öffnen</span>
                </button>

                <button
                  type="button"
                  onClick={() => Bridge.importCompanionFile()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: '7px',
                    background: 'rgba(52, 211, 153, 0.12)',
                    border: '1px solid rgba(52, 211, 153, 0.28)',
                    color: '#34d399',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  title="Wähle eine heruntergeladene .companion.json Addon-Datei aus"
                >
                  <Upload size={12} />
                  <span>Addon (.companion.json) importieren</span>
                </button>
              </div>

              {/* Animationen einzeln aktivieren / deaktivieren */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div style={{ fontSize: '0.71rem', fontWeight: 600, color: '#94a3b8' }}>
                  Aktivierte Animationen:
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* Checkbox: Walk */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.73rem',
                      cursor: 'pointer',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: (config.modules.dino_companion?.anim_walk ?? true)
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${(config.modules.dino_companion?.anim_walk ?? true) ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}`,
                      color: (config.modules.dino_companion?.anim_walk ?? true) ? '#38bdf8' : '#94a3b8',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title="Wenn deaktiviert, bleibt der Dino gemütlich auf der Stelle stehen."
                  >
                    <input
                      type="checkbox"
                      checked={config.modules.dino_companion?.anim_walk ?? true}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            dino_companion: {
                              ...config.modules.dino_companion,
                              anim_walk: e.target.checked,
                            },
                          },
                        })
                      }
                      style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
                    />
                    <span>🐾 Laufen & Schlendern</span>
                  </label>

                  {/* Checkbox: Tail */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.73rem',
                      cursor: 'pointer',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: (config.modules.dino_companion?.anim_tail ?? true)
                        ? 'rgba(251, 191, 36, 0.15)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${(config.modules.dino_companion?.anim_tail ?? true) ? '#fbbf24' : 'rgba(255, 255, 255, 0.12)'}`,
                      color: (config.modules.dino_companion?.anim_tail ?? true) ? '#fbbf24' : '#94a3b8',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title="Wedelt zwischendurch fröhlich mit seiner Keule."
                  >
                    <input
                      type="checkbox"
                      checked={config.modules.dino_companion?.anim_tail ?? true}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            dino_companion: {
                              ...config.modules.dino_companion,
                              anim_tail: e.target.checked,
                            },
                          },
                        })
                      }
                      style={{ accentColor: '#fbbf24', cursor: 'pointer' }}
                    />
                    <span>✨ Keulen-Wedeln</span>
                  </label>

                  {/* Checkbox: Jump */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.73rem',
                      cursor: 'pointer',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: (config.modules.dino_companion?.anim_jump ?? true)
                        ? 'rgba(52, 211, 153, 0.15)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${(config.modules.dino_companion?.anim_jump ?? true) ? '#34d399' : 'rgba(255, 255, 255, 0.12)'}`,
                      color: (config.modules.dino_companion?.anim_jump ?? true) ? '#34d399' : '#94a3b8',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title="Macht ab und zu einen fröhlichen Freudensprung."
                  >
                    <input
                      type="checkbox"
                      checked={config.modules.dino_companion?.anim_jump ?? true}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            dino_companion: {
                              ...config.modules.dino_companion,
                              anim_jump: e.target.checked,
                            },
                          },
                        })
                      }
                      style={{ accentColor: '#34d399', cursor: 'pointer' }}
                    />
                    <span>🦘 Freudensprung</span>
                  </label>
                </div>

                {!(config.modules.dino_companion?.anim_walk ?? true) && (
                  <div style={{ fontSize: '0.69rem', color: '#38bdf8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                    ℹ️ Laufen ist pausiert: Dino bleibt auf der Stelle stehen.
                  </div>
                )}
                {!(config.modules.dino_companion?.anim_walk ?? true) &&
                 !(config.modules.dino_companion?.anim_tail ?? true) &&
                 !(config.modules.dino_companion?.anim_jump ?? true) && (
                  <div style={{ fontSize: '0.69rem', color: '#a78bfa', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                    💤 Ruhemodus: Alle Animationen pausiert — Dino steht entspannt auf der Stelle.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dino Speed, Scale, Opacity & Track Width Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginTop: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#f3f5f9' }}>
                <span>🏃 Schnelligkeit / Tempo:</span>
                <strong style={{ color: '#38bdf8' }}>{config.modules.dino_companion?.speed ?? 100}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                step="5"
                value={config.modules.dino_companion?.speed ?? 100}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    modules: {
                      ...config.modules,
                      dino_companion: {
                        ...config.modules.dino_companion,
                        speed: parseInt(e.target.value, 10),
                      },
                    },
                  })
                }
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#64748b' }}>
                <span>Gemütlich (50%)</span>
                <span>Normal (100%)</span>
                <span>Flink (160%)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#f3f5f9' }}>
                <span>🦕 Dino-Größe / Skalierung:</span>
                <strong style={{ color: '#a78bfa' }}>{config.modules.dino_companion?.scale ?? 100}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                step="5"
                value={config.modules.dino_companion?.scale ?? 100}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    modules: {
                      ...config.modules,
                      dino_companion: {
                        ...config.modules.dino_companion,
                        scale: parseInt(e.target.value, 10),
                      },
                    },
                  })
                }
                style={{ width: '100%', accentColor: '#a78bfa' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#64748b' }}>
                <span>Kompakt (60%)</span>
                <span>Standard (100%)</span>
                <span>Groß (140%)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#f3f5f9' }}>
                <span>✨ Transparenz:</span>
                <strong style={{ color: '#34d399' }}>{config.modules.dino_companion?.opacity ?? 100}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={config.modules.dino_companion?.opacity ?? 100}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    modules: {
                      ...config.modules,
                      dino_companion: {
                        ...config.modules.dino_companion,
                        opacity: parseInt(e.target.value, 10),
                      },
                    },
                  })
                }
                style={{ width: '100%', accentColor: '#34d399' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#64748b' }}>
                <span>Zart (20%)</span>
                <span>Halbtransparent (60%)</span>
                <span>Voll (100%)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#f3f5f9' }}>
                <span>📏 Laufbereich-Breite:</span>
                <strong style={{ color: '#fbbf24' }}>{config.modules.dino_companion?.track_width ?? 480} px</strong>
              </div>
              <input
                type="range"
                min="300"
                max="850"
                step="20"
                value={config.modules.dino_companion?.track_width ?? 480}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    modules: {
                      ...config.modules,
                      dino_companion: {
                        ...config.modules.dino_companion,
                        track_width: parseInt(e.target.value, 10),
                      },
                    },
                  })
                }
                style={{ width: '100%', accentColor: '#fbbf24' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#64748b' }}>
                <span>Kompakt (300px)</span>
                <span>Standard (480px)</span>
                <span>Breit (850px)</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 10 }}>
            ⚓ <strong>Dino-Laufbereich & Position:</strong> Solange dieses Einstellungsfenster geöffnet ist, siehst du unten auf dem Monitor die <strong>grün gestrichelte Begrenzung</strong> seines gesamten Laufbereichs (von links nach rechts). Du kannst diesen Bereich frei mit der Maus verschieben. Sobald du auf <strong>Speichern</strong> klickst, wird der Rahmen <strong>vollständig unsichtbar</strong>!
          </div>
        </div>

        {/* 6. Info-Module Ein- und Ausschalten */}
        <div className="settings-section">
          <div className="widget-title" style={{ marginBottom: 8 }}>
            <span>6. Info-Module Ein-/Ausschalten</span>
          </div>

          <div className="settings-grid">
            <label className="setting-toggle-card">
              <span>🏷️ Überschrift oben anzeigen (Standard: „Dino“)</span>
              <input
                type="checkbox"
                checked={config.modules.header_title?.enabled ?? true}
                onChange={() => toggleModule('header_title')}
              />
            </label>

            <label className="setting-toggle-card">
              <span>🕒 Uhrzeit & Kompakter Kalender</span>
              <input
                type="checkbox"
                checked={config.modules.clock_calendar.enabled}
                onChange={() => toggleModule('clock_calendar')}
              />
            </label>

            <label className="setting-toggle-card">
              <span>📅 Nächste Termine / Kalendernotizen (zwischen Uhr & Kalender)</span>
              <input
                type="checkbox"
                checked={config.modules.next_up_agenda.enabled}
                onChange={() => toggleModule('next_up_agenda')}
              />
            </label>

            <label className="setting-toggle-card">
              <span>⏱️ Sekunden in der Uhr anzeigen</span>
              <input
                type="checkbox"
                checked={config.modules.clock_calendar.show_seconds}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    modules: {
                      ...config.modules,
                      clock_calendar: {
                        ...config.modules.clock_calendar,
                        show_seconds: e.target.checked,
                      },
                    },
                  })
                }
              />
            </label>

            <label className="setting-toggle-card">
              <span>🌸 Zyklus-Kalender (Frauen-Zyklus) anzeigen</span>
              <input
                type="checkbox"
                checked={config.modules.cycle_tracker?.enabled ?? true}
                onChange={() => toggleModule('cycle_tracker')}
              />
            </label>

            <label className="setting-toggle-card">
              <span>🌙 Mondkalender (Mondphasen) anzeigen</span>
              <input
                type="checkbox"
                checked={config.modules.moon_calendar?.enabled ?? true}
                onChange={() => toggleModule('moon_calendar')}
              />
            </label>

            <label className="setting-toggle-card">
              <span>📊 System-Vitalwerte (CPU / RAM / GPU)</span>
              <input
                type="checkbox"
                checked={config.modules.system_vitals.enabled}
                onChange={() => toggleModule('system_vitals')}
              />
            </label>

            <label className="setting-toggle-card">
              <span>⏳ Countdown anzeigen</span>
              <input
                type="checkbox"
                checked={config.modules.countdown.enabled}
                onChange={() => toggleModule('countdown')}
              />
            </label>

            <label className="setting-toggle-card">
              <span>📝 Notizen-Karte anzeigen</span>
              <input
                type="checkbox"
                checked={config.modules.notes.enabled}
                onChange={() => toggleModule('notes')}
              />
            </label>
          </div>
        </div>

        {/* Footer Buttons: Zurücksetzen, Abbrechen, Speichern */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            paddingTop: 6,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button type="button" className="icon-btn active-amber" onClick={handleResetToDefaults}>
            <RotateCcw size={13} />
            <span>Zurücksetzen</span>
          </button>
          <button type="button" className="icon-btn" onClick={handleCancelAndClose}>
            <X size={13} />
            <span>Abbrechen</span>
          </button>
          <button
            type="button"
            className="icon-btn active-emerald"
            onClick={handleSaveAndClose}
            style={{ fontWeight: 700, padding: '0 16px' }}
          >
            <Save size={13} />
            <span>Speichern & Schließen</span>
          </button>
        </div>
      </div>

      {/* Begleiter-Auswahl Modal / Addon Gallery */}
      {isCompanionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 14, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsCompanionModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '860px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#0d111a',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f3f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🦕 Schreibtisch-Begleiter & Addons</span>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 9px', borderRadius: '999px', border: '1px solid rgba(56, 189, 248, 0.35)', fontWeight: 700 }}>
                    {allAvailableCompanions.length} Begleiter erkannt
                  </span>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 4 }}>
                  Klicke auf einen Begleiter, um ihn sofort auf deinem Desktop zu aktivieren. Neue Begleiter können einfach als einzelne <code>.companion.json</code> Addon-Datei hinzugefügt werden!
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => Bridge.openCompanionsFolder()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f3f5f9',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  title="Öffnet den Begleiter-Ordner im Windows Explorer"
                >
                  <FolderOpen size={13} color="#38bdf8" />
                  <span>Ordner öffnen</span>
                </button>

                <button
                  type="button"
                  onClick={() => Bridge.importCompanionFile()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    color: '#34d399',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                  title="Wähle eine .companion.json Datei aus"
                >
                  <Upload size={13} />
                  <span>Addon importieren</span>
                </button>

                <button
                  type="button"
                  onClick={() => Bridge.refreshCompanions()}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                  title="Begleiter-Liste neu laden"
                >
                  <RefreshCw size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCompanionModalOpen(false)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Modal Body: Cards Grid */}
            <div
              style={{
                padding: '20px',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: 14,
                maxHeight: 'calc(88vh - 90px)',
              }}
            >
              {allAvailableCompanions.map((comp) => {
                const isSelected =
                  (config.modules.dino_companion?.variant || 'ankylosaurus').toLowerCase() === comp.id.toLowerCase();
                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      onUpdateConfig({
                        ...config,
                        modules: {
                          ...config.modules,
                          dino_companion: {
                            ...config.modules.dino_companion,
                            variant: comp.id,
                          },
                        },
                      });
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      background: isSelected
                        ? 'rgba(56, 189, 248, 0.14)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected
                        ? '2px solid #38bdf8'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '50px',
                          borderRadius: '10px',
                          background: 'rgba(14, 18, 28, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          padding: '3px',
                        }}
                      >
                        <img
                          src={comp.preview_url || comp.sprites?.walk?.[0] || '/dino/walk_0.png'}
                          alt={comp.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/dino/walk_0.png';
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f3f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {comp.icon || '🦖'} {comp.name}
                        </div>
                        <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>
                          {comp.author || 'Begleiter-Addon'}
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          style={{
                            background: '#38bdf8',
                            color: '#080a10',
                            borderRadius: '999px',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)',
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35', flex: 1 }}>
                      {comp.description}
                    </div>

                    <button
                      type="button"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: isSelected
                          ? 'rgba(56, 189, 248, 0.25)'
                          : 'rgba(255, 255, 255, 0.06)',
                        border: isSelected
                          ? '1px solid #38bdf8'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        color: isSelected ? '#38bdf8' : '#e2e8f0',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginTop: 4,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check size={13} />
                          <span>Aktiv auf dem Desktop</span>
                        </>
                      ) : (
                        <span>Als Begleiter aktivieren</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
