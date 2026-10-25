export type WindowLayerMode = 'background' | 'foreground';
export type OrientationMode = 'auto' | 'portrait' | 'landscape';
export type BackgroundMode =
  | 'glass'
  | 'wallpaper_blur'
  | 'black';

export type ColorThemeMode =
  | 'cyber_blue'
  | 'emerald'
  | 'sunset_amber'
  | 'amethyst'
  | 'crimson'
  | 'frost'
  | 'custom'
  | 'rainbow';

export type DinoVariant =
  | 'ankylosaurus'
  | 'triceratops'
  | 'stegosaurus'
  | 'brachiosaurus';

export interface WidgetOffset {
  x: number;
  y: number;
}

export interface WindowConfig {
  monitor_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  is_locked: boolean;
  always_on_bottom: boolean;
  layer_mode: WindowLayerMode;
  orientation_mode: OrientationMode;
  autostart: boolean;
  widget_positions?: Record<string, WidgetOffset>;
}

export interface ThemeConfig {
  color_mode: ColorThemeMode;
  background_mode: BackgroundMode;
  wallpaper_blur_px: number;
  custom_primary: string;
  custom_secondary: string;
  rainbow_speed: number;
  font_family: string;
  font_scale: number;
  use_custom_text_color: boolean;
  text_color: string;
}

export interface SlideshowModuleConfig {
  enabled: boolean;
  interval_sec: number;
  folder_path: string;
  use_windows_wallpaper: boolean;
}

export interface ClockCalendarModuleConfig {
  enabled: boolean;
  show_seconds: boolean;
  compact_calendar: boolean;
  google_ical_url: string;
}

export interface NotesModuleConfig {
  enabled: boolean;
  file_path: string;
}

export interface CycleTrackerModuleConfig {
  enabled: boolean;
  last_period_start: string;
  cycle_length_days: number;
  period_length_days: number;
}

export interface MoonCalendarModuleConfig {
  enabled: boolean;
}

export interface SystemVitalsModuleConfig {
  enabled: boolean;
  refresh_ms: number;
}

export interface CountdownModuleConfig {
  enabled: boolean;
  label: string;
  target_iso: string;
}

export interface CommsModuleConfig {
  enabled: boolean;
  whatsapp_enabled: boolean;
  email_enabled: boolean;
  email_url: string;
}

export interface HeaderTitleModuleConfig {
  enabled: boolean;
  text: string;
}

export interface DinoCompanionModuleConfig {
  enabled: boolean;
  variant: string;
  auto_cycle?: boolean;
  cycle_variants?: DinoVariant[];
}

export interface ToggleableModuleConfig {
  enabled: boolean;
}

export interface ModulesConfig {
  header_title: HeaderTitleModuleConfig;
  slideshow: SlideshowModuleConfig;
  clock_calendar: ClockCalendarModuleConfig;
  notes: NotesModuleConfig;
  next_up_agenda: ToggleableModuleConfig;
  cycle_tracker: CycleTrackerModuleConfig;
  moon_calendar: MoonCalendarModuleConfig;
  system_vitals: SystemVitalsModuleConfig;
  countdown: CountdownModuleConfig;
  comms: CommsModuleConfig;
  daily_digest: ToggleableModuleConfig;
  dino_companion: DinoCompanionModuleConfig;
}

export interface AmbientDeckConfig {
  window: WindowConfig;
  theme: ThemeConfig;
  modules: ModulesConfig;
}

export interface MonitorInfo {
  id: number;
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_primary: boolean;
}

export interface SystemVitalsData {
  cpu_percent: number;
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  gpu_percent: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_iso: string;
  end_iso?: string;
  location?: string;
  source?: 'json' | 'ics' | 'google';
}

export interface DailyQuote {
  id: string;
  category: 'Coding Tip' | 'Shortcut' | 'Quote';
  title: string;
  content: string;
  author_or_key?: string;
}

export interface CommsNotificationItem {
  id: string;
  app: 'whatsapp' | 'email';
  sender: string;
  preview: string;
  timestamp: string;
}

export interface CommsStatusData {
  listener_permitted: boolean;
  whatsapp_running: boolean;
  whatsapp_unread: number;
  email_unread: number;
  recent_items: CommsNotificationItem[];
}
