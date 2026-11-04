import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Move, RotateCcw, Maximize2 } from 'lucide-react';
import {
  AddonCompanionInfo,
  AmbientDeckConfig,
  BackgroundMode,
  CalendarEvent,
  MonitorInfo,
  SystemVitalsData,
  WidgetOffset,
} from './types';
import { Bridge, DEFAULT_CONFIG, onBackendMessage } from './bridge';
import { SlideshowBackground } from './components/SlideshowBackground';
import { ClockWidget } from './components/ClockWidget';
import { CalendarWidget } from './components/CalendarWidget';
import { NextUpAgendaWidget } from './components/NextUpAgendaWidget';
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
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [liveOffset, setLiveOffset] = useState<WidgetOffset>(() => {
    const rawX = Number(offset?.x) || 0;
    const rawY = Number(offset?.y) || 0;
    const isOut = rawX < -200 || rawX > 2500 || rawY < -200 || rawY > 2000;
    return {
      x: isOut ? 0 : rawX,
      y: isOut ? 0 : rawY,
      scale: Math.max(0.75, Math.min(1.35, Number(offset?.scale) || 1)),
      width: offset?.width,
    };
  });

  const startRef = useRef<{
    mouseX: number;
    mouseY: number;
    baseX: number;
    baseY: number;
    rectLeft: number;
    rectTop: number;
    rectWidth: number;
    rectHeight: number;
  } | null>(null);

  // Synchronize when positions are reset or updated externally
  useEffect(() => {
    if (!dragging && !resizing) {
      const rawX = Number(offset?.x) || 0;
      const rawY = Number(offset?.y) || 0;
      const isOut = rawX < -200 || rawX > 2500 || rawY < -200 || rawY > 2000;
      setLiveOffset({
        x: isOut ? 0 : rawX,
        y: isOut ? 0 : rawY,
        scale: Math.max(0.75, Math.min(1.35, Number(offset?.scale) || 1)),
        width: offset?.width,
      });
    }
  }, [offset?.x, offset?.y, offset?.scale, offset?.width, dragging, resizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditable || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.widget-scale-btn, .widget-scale-label, .widget-resize-grip')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const rect = boxRef.current?.getBoundingClientRect();
    setDragging(true);
    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      baseX: Number(liveOffset.x) || 0,
      baseY: Number(liveOffset.y) || 0,
      rectLeft: rect?.left ?? 0,
      rectTop: rect?.top ?? 0,
      rectWidth: Math.max(80, rect?.width ?? 200),
      rectHeight: Math.max(50, rect?.height ?? 150),
    };

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!startRef.current) return;
      const scaleRatio = fontScaleRatio || 1;
      const rawDx = (moveEv.clientX - startRef.current.mouseX) / scaleRatio;
      const rawDy = (moveEv.clientY - startRef.current.mouseY) / scaleRatio;

      // Boundary clamping: keep widget fully within the desktop monitor view
      const minLeft = 10;
      const maxLeft = Math.max(minLeft, window.innerWidth - startRef.current.rectWidth - 10);
      const minTop = 10;
      const maxTop = Math.max(minTop, window.innerHeight - startRef.current.rectHeight - 10);

      const targetLeft = startRef.current.rectLeft + rawDx;
      const targetTop = startRef.current.rectTop + rawDy;

      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));
      const clampedTop = Math.max(minTop, Math.min(maxTop, targetTop));

      const clampedDx = clampedLeft - startRef.current.rectLeft;
      const clampedDy = clampedTop - startRef.current.rectTop;

      const nextX = Math.max(-200, Math.min(2500, Math.round(startRef.current.baseX + clampedDx)));
      const nextY = Math.max(-200, Math.min(2000, Math.round(startRef.current.baseY + clampedDy)));

      setLiveOffset((prev) => ({
        ...prev,
        x: nextX,
        y: nextY,
      }));
    };

    const handleMouseUp = (upEv: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (startRef.current) {
        const scaleRatio = fontScaleRatio || 1;
        const rawDx = (upEv.clientX - startRef.current.mouseX) / scaleRatio;
        const rawDy = (upEv.clientY - startRef.current.mouseY) / scaleRatio;

        const minLeft = 10;
        const maxLeft = Math.max(minLeft, window.innerWidth - startRef.current.rectWidth - 10);
        const minTop = 10;
        const maxTop = Math.max(minTop, window.innerHeight - startRef.current.rectHeight - 10);

        const targetLeft = startRef.current.rectLeft + rawDx;
        const targetTop = startRef.current.rectTop + rawDy;

        const clampedLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));
        const clampedTop = Math.max(minTop, Math.min(maxTop, targetTop));

        const clampedDx = clampedLeft - startRef.current.rectLeft;
        const clampedDy = clampedTop - startRef.current.rectTop;

        const nextX = Math.max(-200, Math.min(2500, Math.round(startRef.current.baseX + clampedDx)));
        const nextY = Math.max(-200, Math.min(2000, Math.round(startRef.current.baseY + clampedDy)));

        const finalPos = {
          ...liveOffset,
          x: nextX,
          y: nextY,
          scale: Math.max(0.75, Math.min(1.35, Number(liveOffset.scale) || 1)),
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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isEditable || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = Math.max(0.75, Math.min(1.35, Number(liveOffset.scale) || 1));

    const handleMouseMove = (moveEv: MouseEvent) => {
      const scaleRatio = fontScaleRatio || 1;
      const dx = (moveEv.clientX - startX) / scaleRatio;
      const dy = (moveEv.clientY - startY) / scaleRatio;

      const factor = (dx + dy) / 280;
      // Boundaries: min 75%, max 135%
      const nextScale = Math.max(0.75, Math.min(1.35, Math.round((startScale + factor) * 20) / 20));

      setLiveOffset((prev) => ({
        ...prev,
        scale: nextScale,
      }));
    };

    const handleMouseUp = (upEv: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const scaleRatio = fontScaleRatio || 1;
      const dx = (upEv.clientX - startX) / scaleRatio;
      const dy = (upEv.clientY - startY) / scaleRatio;
      const factor = (dx + dy) / 280;
      const nextScale = Math.max(0.75, Math.min(1.35, Math.round((startScale + factor) * 20) / 20));

      const finalPos = {
        ...liveOffset,
        scale: nextScale,
      };
      setLiveOffset(finalPos);
      onOffsetChange(id, finalPos);
      setResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const safeScale = Math.max(0.75, Math.min(1.35, Number(liveOffset.scale) || 1));
  const safeX = Number(liveOffset.x) || 0;
  const safeY = Number(liveOffset.y) || 0;

  return (
    <div
      ref={boxRef}
      className={`draggable-widget-item ${isEditable ? 'editable' : ''} ${
        dragging ? 'dragging' : ''
      } ${resizing ? 'resizing' : ''}`}
      data-widget-id={id}
      id={`widget-box-${id}`}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${safeX}px, ${safeY}px, 0) scale(${safeScale})`,
        transformOrigin: 'top left',
        zIndex: dragging || resizing ? 50 : isEditable ? 20 : 10,
        maxWidth: '100%',
      }}
    >
      {isEditable && (
        <>
          <div className="widget-drag-handle-pill">
            <div className="widget-move-trigger" title={`${label} verschieben (ziehen)`}>
              <Move size={11} />
              <span>{label}</span>
            </div>
            <div className="widget-scale-controls">
              <button
                type="button"
                className="widget-scale-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = safeScale;
                  const nextScale = Math.max(0.75, Math.round((cur - 0.05) * 100) / 100);
                  const next = { ...liveOffset, scale: nextScale };
                  setLiveOffset(next);
                  onOffsetChange(id, next);
                }}
                title="Widget verkleinern (Mindestgröße: 75%)"
              >
                -
              </button>
              <span
                className="widget-scale-label"
                onClick={(e) => {
                  e.stopPropagation();
                  // Reset widget to 100% and back to default grid position (0, 0)
                  const next = { x: 0, y: 0, scale: 1 };
                  setLiveOffset(next);
                  onOffsetChange(id, next);
                }}
                title="Klick zum Zurücksetzen auf Standard-Größe (100%)"
              >
                {Math.round(safeScale * 100)}%
              </span>
              <button
                type="button"
                className="widget-scale-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = safeScale;
                  const nextScale = Math.min(1.35, Math.round((cur + 0.05) * 100) / 100);
                  const next = { ...liveOffset, scale: nextScale };
                  setLiveOffset(next);
                  onOffsetChange(id, next);
                }}
                title="Widget vergrößern (Maximalgröße: 135%)"
              >
                +
              </button>
            </div>
          </div>

          <div
            className={`widget-resize-grip ${resizing ? 'resizing' : ''}`}
            onMouseDown={handleResizeMouseDown}
            title={`${label} vergrößern / verkleinern (ziehen: 75% - 135%)`}
          >
            <Maximize2 size={11} />
          </div>
        </>
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

  const initialData = typeof window !== 'undefined' ? window.__INITIAL_DATA__ : undefined;

  const [config, setConfig] = useState<AmbientDeckConfig>(() => {
    if (initialData?.config) return initialData.config;
    try {
      const saved = localStorage.getItem('ambientdeck_cached_config');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CONFIG;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => initialData?.settings_open ?? false);
  const [monitors, setMonitors] = useState<MonitorInfo[]>(() => {
    if (initialData?.monitors && initialData.monitors.length > 0) return initialData.monitors;
    return [
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
    ];
  });
  const [wallpapers, setWallpapers] = useState<string[]>(() => initialData?.wallpapers || []);
  const [windowsWallpaperUrl, setWindowsWallpaperUrl] = useState<string>(() => {
    if (initialData?.windows_wallpaper_url) return initialData.windows_wallpaper_url;
    try {
      return localStorage.getItem('ambientdeck_cached_wallpaper') || '';
    } catch {}
    return '';
  });
  const [notes, setNotes] = useState<string>(() => initialData?.notes || '');
  const [events, setEvents] = useState<CalendarEvent[]>(() => initialData?.events || []);
  const [addonCompanions, setAddonCompanions] = useState<AddonCompanionInfo[]>(() => {
    if (initialData?.addon_companions && initialData.addon_companions.length > 0) {
      return initialData.addon_companions;
    }
    return [];
  });
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
    try {
      localStorage.setItem('ambientdeck_cached_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    if (windowsWallpaperUrl) {
      try {
        localStorage.setItem('ambientdeck_cached_wallpaper', windowsWallpaperUrl);
      } catch {}
    }
  }, [windowsWallpaperUrl]);

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
    const targetMon = monitors.find((m) => m.id === config.window.monitor_id);
    if (targetMon) {
      return targetMon.width >= targetMon.height ? 'landscape' : 'portrait';
    }
    const w = isSettingsWindow ? config.window.width : viewport.w;
    const h = isSettingsWindow ? config.window.height : viewport.h;
    return w >= h ? 'landscape' : 'portrait';
  }, [
    config.window.orientation_mode,
    config.window.monitor_id,
    config.window.width,
    config.window.height,
    isSettingsWindow,
    monitors,
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
      '--custom-widget-bg': config.theme?.custom_widget_bg_color || '#141824',
      '--custom-bg-color': config.theme?.custom_bg_color || '#090b10',
      fontFamily: fontFam,
    };

    if (config.theme?.color_mode === 'rainbow') {
      const h1 = Math.round(rainbowHue);
      const h2 = Math.round((rainbowHue + 70) % 360);
      const h3 = Math.round((rainbowHue + 140) % 360);
      styleObj['--text-primary'] = `hsl(${h1}, 95%, 95%)`;
      styleObj['--text-secondary'] = `hsl(${h2}, 85%, 88%)`;
      styleObj['--text-muted'] = `hsl(${h3}, 75%, 80%)`;
    } else {
      styleObj['--text-primary'] = '#ffffff';
      styleObj['--text-secondary'] = `color-mix(in srgb, ${primary} 28%, #f8fafc)`;
      styleObj['--text-muted'] = `color-mix(in srgb, ${primary} 22%, #e2e8f0)`;
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
          if (payload.addon_companions) {
            setAddonCompanions(payload.addon_companions);
          }
          if (payload.vitals) setVitals(payload.vitals);
          break;
        }
        case 'companions_updated': {
          if (payload?.addon_companions) {
            setAddonCompanions(payload.addon_companions);
          }
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
        case 'wallpapers_preview': {
          if (payload.wallpapers) setWallpapers(payload.wallpapers);
          if (payload.preview_url) {
            setWallpapers([payload.preview_url]);
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
      const sanitized: WidgetOffset = {
        x: Math.max(-200, Math.min(2500, Math.round(Number(nextOffset.x) || 0))),
        y: Math.max(-200, Math.min(2000, Math.round(Number(nextOffset.y) || 0))),
        scale:
          typeof nextOffset.scale === 'number' && !isNaN(nextOffset.scale)
            ? Math.max(0.75, Math.min(1.35, Math.round(nextOffset.scale * 100) / 100))
            : 1,
        width:
          typeof nextOffset.width === 'number' && !isNaN(nextOffset.width)
            ? Math.round(nextOffset.width)
            : undefined,
      };

      let latestPositions: Record<string, WidgetOffset> = {};
      setConfig((prev) => {
        latestPositions = {
          ...(prev.window.widget_positions || {}),
          [widgetId]: sanitized,
        };
        return {
          ...prev,
          window: {
            ...prev.window,
            widget_positions: latestPositions,
          },
        };
      });

      // Send to backend outside setConfig to avoid React state updater side-effects
      Bridge.saveWidgetPositions(latestPositions);
    },
    []
  );

  const handleResetWidgetPositions = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      window: {
        ...prev.window,
        widget_positions: {},
      },
    }));
    Bridge.saveWidgetPositions({});
  }, []);

  const handleSelectMonitor = (monitorId: number) => {
    Bridge.selectMonitor(monitorId);
    const target = monitors.find((m) => m.id === monitorId);
    if (target) {
      const isLandscape = target.width >= target.height;
      const nextW = (config.window.orientation_mode === 'portrait')
        ? Math.min(720, target.width)
        : target.width;
      const nextH = target.height;
      Bridge.setWindowBounds(target.x, target.y, nextW, nextH);
      setConfig((prev) => ({
        ...prev,
        window: {
          ...prev.window,
          monitor_id: monitorId,
          x: target.x,
          y: target.y,
          width: nextW,
          height: nextH,
          widget_positions: {},
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        window: { ...prev.window, monitor_id: monitorId },
      }));
    }
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
    rawBg === 'glass' || rawBg === 'color' || rawBg === 'black' ? rawBg : 'wallpaper_blur';

  const getOffset = (id: string): WidgetOffset => {
    const saved = config.window.widget_positions?.[id];
    if (
      saved &&
      typeof saved.x === 'number' &&
      !isNaN(saved.x) &&
      typeof saved.y === 'number' &&
      !isNaN(saved.y)
    ) {
      // Automatic safety clamp: if an offset is out of bounds, return default 0 so widget never vanishes
      const isOutOfBounds = saved.x < -200 || saved.x > 2500 || saved.y < -200 || saved.y > 2000;
      if (isOutOfBounds) {
        return { x: 0, y: 0, scale: 1 };
      }
      return {
        x: saved.x,
        y: saved.y,
        scale: Math.max(0.75, Math.min(1.35, Number(saved.scale) || 1)),
        width: saved.width,
      };
    }
    return { x: 0, y: 0, scale: 1 };
  };

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
          addonCompanions={addonCompanions}
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
      <SlideshowBackground
        backgroundMode={bgMode}
        customBgColor={config.theme?.custom_bg_color || '#090b10'}
        blurPx={config.theme?.wallpaper_blur_px ?? 14}
        intervalSec={config.modules.slideshow?.interval_sec ?? 30}
        useWindowsWallpaper={true}
        windowsWallpaperUrl={windowsWallpaperUrl}
        wallpapers={wallpapers}
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
                {(config.modules.header_title?.icon ?? 'trex') !== 'none' && (
                  <span style={{ color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>
                    {(config.modules.header_title?.icon ?? 'trex') === 'sauropod' ? '🦕' : '🦖'}
                  </span>
                )}
                <span>{config.modules.header_title?.text?.trim() || 'Dino'}</span>
              </div>
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '4px',
                  fontSize: '0.54rem',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  letterSpacing: '0.04em',
                  color: 'rgba(226, 232, 240, 0.42)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                by X4rinia
              </span>
            </section>
          </DraggableWidgetBox>
        )}

        {config.modules.clock_calendar.enabled && (
          <DraggableWidgetBox
            id="clock"
            label="Uhrzeit & Datum"
            isEditable={isSettingsOpen}
            offset={getOffset('clock')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <ClockWidget showSeconds={config.modules.clock_calendar.show_seconds} />
          </DraggableWidgetBox>
        )}

        {(config.modules.next_up_agenda?.enabled ?? true) && (
          <DraggableWidgetBox
            id="agenda"
            label="Nächste Termine"
            isEditable={isSettingsOpen}
            offset={getOffset('agenda')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <NextUpAgendaWidget events={events} />
          </DraggableWidgetBox>
        )}

        {(config.modules.clock_calendar.compact_calendar ?? true) && (
          <DraggableWidgetBox
            id="calendar"
            label="Monatskalender"
            isEditable={isSettingsOpen}
            offset={getOffset('calendar')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <CalendarWidget events={events} />
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

        {(config.modules.system_vitals?.enabled ?? true) && (
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

        {(config.modules.countdown?.enabled ?? true) && (
          <DraggableWidgetBox
            id="countdown"
            label="Countdown"
            isEditable={isSettingsOpen}
            offset={getOffset('countdown')}
            fontScaleRatio={fontScaleRatio}
            onOffsetChange={handleWidgetOffsetChange}
          >
            <CountdownWidget
              label={config.modules.countdown?.label || 'Countdown'}
              targetIso={config.modules.countdown?.target_iso}
            />
          </DraggableWidgetBox>
        )}

        {(config.modules.notes?.enabled ?? true) && (
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

      {/* L. Dino Companion (Transparent Ankylosaurus with Walking, Jumping & Tail Wagging) */}
      {(config.modules.dino_companion?.enabled ?? true) && (
        <DinoCompanion
          speed={config.modules.dino_companion?.speed ?? 100}
          scale={config.modules.dino_companion?.scale ?? 100}
          opacity={config.modules.dino_companion?.opacity ?? 100}
          trackWidth={config.modules.dino_companion?.track_width ?? 480}
          allowWalk={config.modules.dino_companion?.anim_walk ?? true}
          allowTail={config.modules.dino_companion?.anim_tail ?? true}
          allowJump={config.modules.dino_companion?.anim_jump ?? true}
          isEditable={isSettingsOpen}
          anchorOffset={getOffset('dino_companion')}
          onAnchorChange={(next) => handleWidgetOffsetChange('dino_companion', next)}
          onTrackWidthChange={(nextWidth) => {
            setConfig((prev) => {
              const updated = {
                ...prev,
                modules: {
                  ...prev.modules,
                  dino_companion: {
                    ...prev.modules.dino_companion,
                    track_width: nextWidth,
                  },
                },
              };
              Bridge.saveConfig(updated);
              return updated;
            });
          }}
          variant={config.modules.dino_companion?.variant}
          addonCompanions={addonCompanions}
        />
      )}
    </div>
  );
};
