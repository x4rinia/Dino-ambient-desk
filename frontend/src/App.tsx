import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Move, RotateCcw } from 'lucide-react';
import {
  AmbientDeckConfig,
  BackgroundMode,
  CalendarEvent,
  MonitorInfo,
  SystemVitalsData,
  WidgetOffset,
} from './types';
import { Bridge, DEFAULT_CONFIG, onBackendMessage } from './bridge';
import { SlideshowBackground } from './components/SlideshowBackground';
import { ClockCalendarWidget } from './components/ClockCalendarWidget';
import { SystemVitalsWidget } from './components/SystemVitalsWidget';
import { CountdownWidget } from './components/CountdownWidget';
import { AmbientNotesWidget } from './components/QuickNotesFlyout';
import { CycleTrackerWidget } from './components/CycleTrackerWidget';
import { MoonCalendarWidget } from './components/MoonCalendarWidget';
import { DinoCompanion } from './components/DinoCompanion';
import { SettingsModal } from './components/SettingsModal';

interface DraggableWidgetBoxProps {
  id: string;
  label: string;
  isEditable: boolean;
  offset: WidgetOffset;
  fontScaleRatio: number;
  onOffsetChange: (id: string, next: WidgetOffset) => void;
  children: React.ReactNode;
}

const DraggableWidgetBox: React.FC<DraggableWidgetBoxProps> = ({
  id,
  label,
  isEditable,
  offset,
  fontScaleRatio,
  onOffsetChange,
  children,
}) => {
  const [dragging, setDragging] = useState(false);
  const [liveOffset, setLiveOffset] = useState<WidgetOffset>(offset);
  const startRef = useRef<{
    mouseX: number;
    mouseY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  useEffect(() => {
    if (!dragging) {
      setLiveOffset(offset);
    }
  }, [offset, dragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditable || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      baseX: liveOffset.x,
      baseY: liveOffset.y,
    };

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!startRef.current) return;
      const scale = fontScaleRatio || 1;
      const dx = Math.round((moveEv.clientX - startRef.current.mouseX) / scale);
      const dy = Math.round((moveEv.clientY - startRef.current.mouseY) / scale);
      setLiveOffset({
        x: startRef.current.baseX + dx,
        y: startRef.current.baseY + dy,
      });
    };

    const handleMouseUp = (upEv: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (startRef.current) {
        const scale = fontScaleRatio || 1;
        const dx = Math.round((upEv.clientX - startRef.current.mouseX) / scale);
        const dy = Math.round((upEv.clientY - startRef.current.mouseY) / scale);
        const finalPos = {
          x: startRef.current.baseX + dx,
          y: startRef.current.baseY + dy,
        };
        setLiveOffset(finalPos);
        onOffsetChange(id, finalPos);
      }
      startRef.current = null;
      setDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`draggable-widget-item ${isEditable ? 'editable' : ''} ${
        dragging ? 'dragging' : ''
      }`}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${liveOffset.x}px, ${liveOffset.y}px, 0)`,
        zIndex: dragging ? 50 : isEditable ? 20 : 10,
      }}
    >
      {isEditable && (
        <div className="widget-drag-handle-pill">
          <Move size={11} />
          <span>{label} verschieben</span>
        </div>
      )}
      {children}
    </div>
  );
};

export const App: React.FC = () => {
  const isSettingsWindow = useMemo(
    () => window.location.search.includes('view=settings'),
    []
  );

  const [config, setConfig] = useState<AmbientDeckConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [monitors, setMonitors] = useState<MonitorInfo[]>([
    {
      id: 1,
      name: 'DISPLAY1',
      label: 'Display 1: 1920x1080 @ (0, 0)',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      is_primary: true,
    },
  ]);
  const [wallpapers, setWallpapers] = useState<string[]>([]);
  const [windowsWallpaperUrl, setWindowsWallpaperUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [vitals, setVitals] = useState<SystemVitalsData>({
    cpu_percent: 12,
    ram_percent: 40,
    ram_used_gb: 12.8,
    ram_total_gb: 32,
    gpu_percent: 6,
  });

  const [viewport, setViewport] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const activeOrientation: 'portrait' | 'landscape' = useMemo(() => {
    const mode = config.window.orientation_mode || 'auto';
    if (mode === 'portrait') return 'portrait';
    if (mode === 'landscape') return 'landscape';
    const w = isSettingsWindow ? config.window.width : viewport.w;
    const h = isSettingsWindow ? config.window.height : viewport.h;
    return h > w || w < 920 ? 'portrait' : 'landscape';
  }, [
    config.window.orientation_mode,
    config.window.width,
    config.window.height,
    isSettingsWindow,
    viewport.w,
    viewport.h,
  ]);

  // Rainbow fade ONLY runs on the background dashboard, never in the Settings Window
  const [rainbowHue, setRainbowHue] = useState(0);
  useEffect(() => {
    if (isSettingsWindow || config.theme?.color_mode !== 'rainbow') return;
    const speed = Math.max(1, config.theme.rainbow_speed || 5);
    const timer = setInterval(() => {
      setRainbowHue((prev) => (prev + speed * 0.65) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [isSettingsWindow, config.theme?.color_mode, config.theme?.rainbow_speed]);

  // Theme & Font style ONLY for the background widget (.ambient-deck)
  const dashboardThemeStyle = useMemo((): React.CSSProperties => {
    const mode = config.theme?.color_mode || 'cyber_blue';
    let primary = '#38bdf8';
    let secondary = '#34d399';
    let tertiary = '#fbbf24';

    if (mode === 'emerald') {
      primary = '#10b981';
      secondary = '#6ee7b7';
      tertiary = '#38bdf8';
    } else if (mode === 'sunset_amber') {
      primary = '#fbbf24';
      secondary = '#f97316';
      tertiary = '#fb7185';
    } else if (mode === 'amethyst') {
      primary = '#c084fc';
      secondary = '#f472b6';
      tertiary = '#38bdf8';
    } else if (mode === 'crimson') {
      primary = '#fb7185';
      secondary = '#f43f5e';
      tertiary = '#fbbf24';
    } else if (mode === 'frost') {
      primary = '#f8fafc';
      secondary = '#94a3b8';
      tertiary = '#38bdf8';
    } else if (mode === 'custom') {
      primary = config.theme.custom_primary || '#38bdf8';
      secondary = config.theme.custom_secondary || '#34d399';
      tertiary = '#fbbf24';
    } else if (mode === 'rainbow') {
      const h1 = Math.round(rainbowHue);
      const h2 = Math.round((rainbowHue + 95) % 360);
      const h3 = Math.round((rainbowHue + 190) % 360);
      primary = `hsl(${h1}, 92%, 62%)`;
      secondary = `hsl(${h2}, 88%, 58%)`;
      tertiary = `hsl(${h3}, 92%, 62%)`;
    }

    const rawFont = (config.theme?.font_family || 'Inter').trim();
    const fontFam = rawFont.includes(',')
      ? rawFont
      : `"${rawFont.replace(/^['"]|['"]$/g, '')}", 'Segoe UI', sans-serif`;

    const blurPx = Math.max(4, config.theme?.wallpaper_blur_px ?? 18);

    const styleObj: Record<string, string | number> = {
      '--accent-blue': primary,
      '--accent-emerald': secondary,
      '--accent-amber': tertiary,
      '--accent-blue-glow': primary,
      '--accent-emerald-glow': secondary,
      '--font-sans': fontFam,
      '--font-mono': fontFam,
      '--widget-blur-px': `${blurPx}px`,
      fontFamily: fontFam,
    };

    if (config.theme?.use_custom_text_color && config.theme?.text_color) {
      styleObj['--text-primary'] = config.theme.text_color;
    } else if (config.theme?.color_mode === 'rainbow') {
      styleObj['--text-primary'] = `hsl(${Math.round(rainbowHue)}, 85%, 92%)`;
    }

    return styleObj as React.CSSProperties;
  }, [config.theme, rainbowHue]);

  const fontScaleRatio = useMemo(() => {
    const scale = config.theme?.font_scale || 100;
    return Math.min(1.5, Math.max(0.7, scale / 100));
  }, [config.theme?.font_scale]);

  useEffect(() => {
    const unsubscribe = onBackendMessage((type, payload) => {
      switch (type) {
        case 'init_state': {
          if (payload.config) {
            setConfig((prev) => ({
              ...prev,
              ...payload.config,
              theme: { ...prev.theme, ...(payload.config.theme || {}) },
              window: { ...prev.window, ...(payload.config.window || {}) },
              modules: {
                ...prev.modules,
                ...(payload.config.modules || {}),
                header_title: {
                  ...prev.modules.header_title,
                  ...(payload.config.modules?.header_title || {}),
                },
                slideshow: {
                  ...prev.modules.slideshow,
                  ...(payload.config.modules?.slideshow || {}),
                },
                cycle_tracker: {
                  ...prev.modules.cycle_tracker,
                  ...(payload.config.modules?.cycle_tracker || {}),
                },
                moon_calendar: {
                  ...prev.modules.moon_calendar,
                  ...(payload.config.modules?.moon_calendar || {}),
                },
                dino_companion: {
                  ...prev.modules.dino_companion,
                  ...(payload.config.modules?.dino_companion || {}),
                },
              },
            }));
          }
          if (typeof payload.settings_open === 'boolean') {
            setIsSettingsOpen(payload.settings_open);
          }
          if (payload.monitors && payload.monitors.length > 0) setMonitors(payload.monitors);
          if (payload.wallpapers) setWallpapers(payload.wallpapers);
          if (typeof payload.windows_wallpaper_url === 'string') {
            setWindowsWallpaperUrl(payload.windows_wallpaper_url);
          }
          if (typeof payload.notes === 'string') setNotes(payload.notes);
          if (payload.events) setEvents(payload.events);
          if (payload.vitals) setVitals(payload.vitals);
          break;
        }
        case 'settings_open_state': {
          if (payload && typeof payload.is_open === 'boolean') {
            setIsSettingsOpen(payload.is_open);
          }
          break;
        }
        case 'config_updated': {
          if (payload.config) setConfig(payload.config);
          break;
        }
        case 'notes_updated': {
          if (typeof payload.notes === 'string') setNotes(payload.notes);
          break;
        }
        case 'vitals_update': {
          if (payload) setVitals(payload);
          break;
        }
        case 'events_updated': {
          if (payload.events) setEvents(payload.events);
          break;
        }
        case 'wallpapers_updated': {
          if (payload.wallpapers) setWallpapers(payload.wallpapers);
          if (typeof payload.windows_wallpaper_url === 'string') {
            setWindowsWallpaperUrl(payload.windows_wallpaper_url);
          }
          break;
        }
        case 'monitors_updated': {
          if (payload.monitors) setMonitors(payload.monitors);
          break;
        }
        default:
          break;
      }
    });

    Bridge.requestInit();
    return unsubscribe;
  }, []);

  const updateAndPersistConfig = useCallback((next: AmbientDeckConfig) => {
    setConfig(next);
    Bridge.saveConfig(next);
  }, []);

  const handleWidgetOffsetChange = useCallback(
    (widgetId: string, nextOffset: WidgetOffset) => {
      setConfig((prev) => {
        const nextPositions = {
          ...(prev.window.widget_positions || {}),
          [widgetId]: nextOffset,
        };
        const updated: AmbientDeckConfig = {
          ...prev,
          window: {
            ...prev.window,
            widget_positions: nextPositions,
          },
        };
        Bridge.saveConfig(updated);
        return updated;
      });
    },
    []
  );

  const handleResetWidgetPositions = useCallback(() => {
    setConfig((prev) => {
      const updated: AmbientDeckConfig = {
        ...prev,
        window: {
          ...prev.window,
          widget_positions: {},
        },
      };
      Bridge.saveConfig(updated);
      return updated;
    });
  }, []);

  const handleSelectMonitor = (monitorId: number) => {
    Bridge.selectMonitor(monitorId);
    setConfig((prev) => ({
      ...prev,
      window: { ...prev.window, monitor_id: monitorId },
    }));
  };

  const handleChangeNotes = (content: string) => {
    setNotes(content);
    Bridge.saveNotes(content);
  };

  const handleSaveManualEvents = useCallback((nextManualEvents: CalendarEvent[]) => {
    Bridge.saveManualEvents(nextManualEvents);
  }, []);

  const rawBg = config.theme?.background_mode as string | undefined;
  const bgMode: BackgroundMode =
    rawBg === 'wallpaper_blur' || rawBg === 'black' ? rawBg : 'glass';

  const getOffset = (id: string): WidgetOffset =>
    config.window.widget_positions?.[id] || { x: 0, y: 0 };

  // Separate Settings Window on Primary Monitor: Neutral styling
  if (isSettingsWindow) {
    return (
      <div className="settings-window-container">
        <SettingsModal
          config={config}
          monitors={monitors}
          notes={notes}
          events={events}
          activeOrientation={activeOrientation}
          onUpdateConfig={updateAndPersistConfig}
          onChangeNotes={handleChangeNotes}
          onSaveManualEvents={handleSaveManualEvents}
          onSelectMonitor={handleSelectMonitor}
          onResetWidgetPositions={handleResetWidgetPositions}
          onClose={() => Bridge.closeSettings()}
        />
      </div>
    );
  }

  // Ambient Dashboard on the target monitor (Interactive for dragging ONLY when Settings is open)
  return (
    <div
      className={`ambient-deck ${isSettingsOpen ? 'editable-mode' : 'locked'} layout-${activeOrientation} bg-mode-${bgMode} ${
        config.theme?.color_mode === 'rainbow' ? 'rainbow-active' : ''
      }`}
      style={dashboardThemeStyle}
    >
      {/* Background Layer (Always shows sharp desktop wallpaper between the widgets) */}
      <SlideshowBackground
        backgroundMode={bgMode}
        blurPx={config.theme?.wallpaper_blur_px ?? 16}
        intervalSec={config.modules.slideshow.interval_sec}
        wallpapers={wallpapers}
        useWindowsWallpaper={config.modules.slideshow.use_windows_wallpaper ?? true}
        windowsWallpaperUrl={windowsWallpaperUrl || null}
        windowConfig={config.window}
        monitors={monitors}
      />

      {/* Floating Edit-Mode Banner (Visible ONLY when Settings Window is open) */}
      {isSettingsOpen && (
        <div className="edit-mode-floating-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Move size={13} color="#38bdf8" />
            <span>
              <strong>Verschiebe-Modus aktiv:</strong> Ziehe jedes Widget einzeln mit der Maus an deine Wunschposition!
            </span>
          </div>
          <button
            type="button"
            className="edit-mode-reset-btn"
            onClick={handleResetWidgetPositions}
          >
            <RotateCcw size={12} />
            <span>Positionen automatisch anordnen</span>
          </button>
        </div>
      )}

      {/* Clean Unified Widget Grid (No empty gaps when widgets are toggled off) */}
      <main
        className={`main-workspace widgets-flow-grid layout-${activeOrientation}`}
        style={{ zoom: fontScaleRatio }}
      >
        {(config.modules.header_title?.enabled ?? true) && (
          <DraggableWidgetBox
            id="header_title"
            label="Überschrift"
            isEditable={isSettingsOpen}
            offset={getOffset('header_title')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <section
              className="glass-panel"
              style={{
                position: 'relative',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
              }}
            >
              <div
                style={{
                  fontSize: '1.18rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textAlign: 'center',
                }}
              >
                <span style={{ color: 'var(--accent-emerald)' }}>🦖</span>
                <span>{config.modules.header_title?.text?.trim() || 'Dino'}</span>
              </div>
              <span
                style={{
                  position: 'absolute',
                  right: '14px',
                  bottom: '6px',
                  fontSize: '0.62rem',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  color: 'var(--text-muted, rgba(148, 163, 184, 0.55))',
                  userSelect: 'none',
                }}
              >
                by x4rinia
              </span>
            </section>
          </DraggableWidgetBox>
        )}

        {config.modules.clock_calendar.enabled && (
          <DraggableWidgetBox
            id="clock_calendar"
            label="Uhr & Kalender"
            isEditable={isSettingsOpen}
            offset={getOffset('clock_calendar')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <ClockCalendarWidget
              showSeconds={config.modules.clock_calendar.show_seconds}
              showNextEvent={config.modules.next_up_agenda?.enabled ?? true}
              events={events}
            />
          </DraggableWidgetBox>
        )}

        {(config.modules.cycle_tracker?.enabled ?? true) && (
          <DraggableWidgetBox
            id="cycle_tracker"
            label="Zyklus-Kalender"
            isEditable={isSettingsOpen}
            offset={getOffset('cycle_tracker')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <CycleTrackerWidget config={config.modules.cycle_tracker} />
          </DraggableWidgetBox>
        )}

        {(config.modules.moon_calendar?.enabled ?? true) && (
          <DraggableWidgetBox
            id="moon_calendar"
            label="Mondkalender"
            isEditable={isSettingsOpen}
            offset={getOffset('moon_calendar')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <MoonCalendarWidget enabled={true} />
          </DraggableWidgetBox>
        )}

        {config.modules.system_vitals.enabled && (
          <DraggableWidgetBox
            id="system_vitals"
            label="System-Vitalwerte"
            isEditable={isSettingsOpen}
            offset={getOffset('system_vitals')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <SystemVitalsWidget vitals={vitals} />
          </DraggableWidgetBox>
        )}

        {config.modules.countdown.enabled && (
          <DraggableWidgetBox
            id="countdown"
            label="Countdown"
            isEditable={isSettingsOpen}
            offset={getOffset('countdown')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <CountdownWidget
              label={config.modules.countdown.label}
              targetIso={config.modules.countdown.target_iso}
            />
          </DraggableWidgetBox>
        )}

        {config.modules.notes.enabled && (
          <DraggableWidgetBox
            id="notes"
            label="Notizen"
            isEditable={isSettingsOpen}
            offset={getOffset('notes')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <AmbientNotesWidget notes={notes} />
          </DraggableWidgetBox>
        )}
      </main>

      {/* L. Dino Companion (Transparent Ankylosaurus with Walking, Jumping, Looking & Tail Wagging) */}
      {config.modules.dino_companion.enabled && (
        <DinoCompanion
          speed={config.modules.dino_companion?.speed ?? 100}
          opacity={config.modules.dino_companion?.opacity ?? 100}
          trackWidth={config.modules.dino_companion?.track_width ?? 480}
          isEditable={isSettingsOpen}
          anchorOffset={getOffset('dino_companion')}
          onAnchorChange={(next) => handleWidgetOffsetChange('dino_companion', next)}
        />
      )}
    </div>
  );
};
