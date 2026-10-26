import {
  AddonCompanionInfo,
  AmbientDeckConfig,
  CalendarEvent,
  DailyQuote,
  MonitorInfo,
  OrientationMode,
  WindowLayerMode,
} from './types';

export interface InitialDataPayload {
  config?: AmbientDeckConfig;
  settings_open?: boolean;
  monitors?: MonitorInfo[];
  wallpapers?: string[];
  windows_wallpaper_url?: string;
  notes?: string;
  events?: CalendarEvent[];
  quotes?: DailyQuote[];
  addon_companions?: AddonCompanionInfo[];
}

declare global {
  interface Window {
    __INITIAL_DATA__?: InitialDataPayload;
    chrome?: {
      webview?: {
        postMessage: (message: unknown) => void;
        addEventListener: (
          type: 'message',
          listener: (event: { data: unknown }) => void
        ) => void;
        removeEventListener: (
          type: 'message',
          listener: (event: { data: unknown }) => void
        ) => void;
      };
    };
  }
}

export const DEFAULT_CONFIG: AmbientDeckConfig = {
  window: {
    monitor_id: 1,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    is_locked: true,
    always_on_bottom: true,
    layer_mode: 'background',
    orientation_mode: 'auto',
    autostart: false,
  },
  theme: {
    color_mode: 'cyber_blue',
    background_mode: 'wallpaper_blur',
    wallpaper_blur_px: 16,
    custom_primary: '#38bdf8',
    custom_secondary: '#34d399',
    rainbow_speed: 5,
    font_family: "'Inter', 'Segoe UI', sans-serif",
    font_scale: 100,
    use_custom_text_color: false,
    text_color: '#f3f5f9',
  },
  modules: {
    header_title: {
      enabled: true,
      text: '',
    },
    slideshow: {
      enabled: true,
      interval_sec: 300,
      folder_path: './wallpapers',
      use_windows_wallpaper: true,
    },
    clock_calendar: {
      enabled: true,
      show_seconds: true,
      compact_calendar: true,
      google_ical_url: '',
    },
    notes: {
      enabled: true,
      file_path: './notes.md',
    },
    next_up_agenda: {
      enabled: true,
    },
    cycle_tracker: {
      enabled: true,
      last_period_start: '2026-10-12',
      cycle_length_days: 28,
      period_length_days: 5,
    },
    moon_calendar: {
      enabled: true,
    },
    system_vitals: {
      enabled: true,
      refresh_ms: 2000,
    },
    countdown: {
      enabled: true,
      label: 'Next Adventure',
      target_iso: '2026-12-01T00:00:00',
    },
    comms: {
      enabled: false,
      whatsapp_enabled: false,
      email_enabled: false,
      email_url: 'https://mail.google.com',
    },
    daily_digest: {
      enabled: false,
    },
    dino_companion: {
      enabled: true,
      variant: 'drache',
      auto_cycle: false,
      cycle_variants: ['ankylosaurus', 'triceratops', 'stegosaurus', 'brachiosaurus'],
      speed: 100,
      opacity: 100,
      track_width: 480,
    },
  },
};

type MessageListener = (type: string, payload: any) => void;
const listeners = new Set<MessageListener>();

export function onBackendMessage(listener: MessageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== 'undefined' && window.chrome?.webview) {
  window.chrome.webview.addEventListener('message', (event) => {
    try {
      const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (msg && msg.type) {
        listeners.forEach((fn) => fn(msg.type, msg.payload));
      }
    } catch (err) {
      console.error('Failed to parse backend message:', err);
    }
  });
}

export function sendToBackend(action: string, payload: Record<string, unknown> = {}): void {
  if (typeof window !== 'undefined' && window.chrome?.webview) {
    window.chrome.webview.postMessage(JSON.stringify({ action, ...payload }));
  } else {
    console.debug('[Dino_ambient_Deck Bridge Fallback]', action, payload);
  }
}

export const Bridge = {
  requestInit: () => sendToBackend('init'),
  closeSettings: () => sendToBackend('close_settings'),
  saveConfig: (config: AmbientDeckConfig) => sendToBackend('save_config', { config }),
  setLayerMode: (layerMode: WindowLayerMode) =>
    sendToBackend('set_layer_mode', { layer_mode: layerMode }),
  setOrientationMode: (orientationMode: OrientationMode, applyWindowResize = false) =>
    sendToBackend('set_orientation_mode', {
      orientation_mode: orientationMode,
      apply_window_resize: applyWindowResize,
    }),
  setAutostart: (autostart: boolean) => sendToBackend('set_autostart', { autostart }),
  selectMonitor: (monitorId: number) => sendToBackend('select_monitor', { monitor_id: monitorId }),
  setWindowSize: (width: number, height: number, centerOnMonitor = true) =>
    sendToBackend('set_window_size', {
      width,
      height,
      center_on_monitor: centerOnMonitor,
    }),
  setWindowBounds: (x: number, y: number, width: number, height: number) =>
    sendToBackend('set_window_bounds', { x, y, width, height }),
  saveNotes: (content: string) => sendToBackend('save_notes', { content }),
  openWallpapersFolder: () => sendToBackend('open_wallpapers_folder'),
  pickWallpaperFile: () => sendToBackend('pick_wallpaper_file'),
  addCalendarEvent: (title: string, startIso: string) =>
    sendToBackend('add_event', { title, start_iso: startIso }),
  saveManualEvents: (events: CalendarEvent[]) =>
    sendToBackend('save_manual_events', { events }),
  syncGoogleCalendar: (icalUrl: string) =>
    sendToBackend('sync_google_calendar', { ical_url: icalUrl }),
  openCompanionsFolder: () => sendToBackend('open_companions_folder'),
  importCompanionFile: () => sendToBackend('import_companion_file'),
  refreshCompanions: () => sendToBackend('refresh_companions'),
  openWindowsNotificationSettings: () =>
    sendToBackend('open_windows_notification_settings'),
};
