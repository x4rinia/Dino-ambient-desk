using System.Text.Json.Serialization;

namespace AmbientDeck.Models;

public class AmbientDeckConfig
{
    [JsonPropertyName("window")]
    public WindowConfig Window { get; set; } = new();

    [JsonPropertyName("theme")]
    public ThemeConfig Theme { get; set; } = new();

    [JsonPropertyName("modules")]
    public ModulesConfig Modules { get; set; } = new();
}

public class WindowConfig
{
    [JsonPropertyName("monitor_id")]
    public int MonitorId { get; set; } = 1;

    [JsonPropertyName("x")]
    public int X { get; set; } = 0;

    [JsonPropertyName("y")]
    public int Y { get; set; } = 0;

    [JsonPropertyName("width")]
    public int Width { get; set; } = 1920;

    [JsonPropertyName("height")]
    public int Height { get; set; } = 1080;

    [JsonPropertyName("is_locked")]
    public bool IsLocked { get; set; } = false;

    [JsonPropertyName("always_on_bottom")]
    public bool AlwaysOnBottom { get; set; } = true;

    [JsonPropertyName("layer_mode")]
    public string LayerMode { get; set; } = "background";

    [JsonPropertyName("orientation_mode")]
    public string OrientationMode { get; set; } = "auto";

    [JsonPropertyName("autostart")]
    public bool Autostart { get; set; } = false;

    [JsonPropertyName("widget_positions")]
    public Dictionary<string, WidgetOffset> WidgetPositions { get; set; } = new();
}

public class WidgetOffset
{
    [JsonPropertyName("x")]
    public int X { get; set; } = 0;

    [JsonPropertyName("y")]
    public int Y { get; set; } = 0;
}

public class ThemeConfig
{
    [JsonPropertyName("color_mode")]
    public string ColorMode { get; set; } = "cyber_blue";

    [JsonPropertyName("background_mode")]
    public string BackgroundMode { get; set; } = "glass";

    [JsonPropertyName("wallpaper_blur_px")]
    public int WallpaperBlurPx { get; set; } = 16;

    [JsonPropertyName("custom_primary")]
    public string CustomPrimary { get; set; } = "#38bdf8";

    [JsonPropertyName("custom_secondary")]
    public string CustomSecondary { get; set; } = "#34d399";

    [JsonPropertyName("rainbow_speed")]
    public int RainbowSpeed { get; set; } = 5;

    [JsonPropertyName("font_family")]
    public string FontFamily { get; set; } = "Inter";

    [JsonPropertyName("font_scale")]
    public int FontScale { get; set; } = 100;

    [JsonPropertyName("use_custom_text_color")]
    public bool UseCustomTextColor { get; set; } = false;

    [JsonPropertyName("text_color")]
    public string TextColor { get; set; } = "#f3f5f9";
}

public class ModulesConfig
{
    [JsonPropertyName("header_title")]
    public HeaderTitleModuleConfig HeaderTitle { get; set; } = new();

    [JsonPropertyName("slideshow")]
    public SlideshowModuleConfig Slideshow { get; set; } = new();

    [JsonPropertyName("clock_calendar")]
    public ClockCalendarModuleConfig ClockCalendar { get; set; } = new();

    [JsonPropertyName("cycle_tracker")]
    public CycleTrackerModuleConfig CycleTracker { get; set; } = new();

    [JsonPropertyName("moon_calendar")]
    public ToggleableModuleConfig MoonCalendar { get; set; } = new();

    [JsonPropertyName("one_thing")]
    public OneThingModuleConfig OneThing { get; set; } = new();

    [JsonPropertyName("notes")]
    public NotesModuleConfig Notes { get; set; } = new();

    [JsonPropertyName("next_up_agenda")]
    public ToggleableModuleConfig NextUpAgenda { get; set; } = new();

    [JsonPropertyName("pomodoro")]
    public ToggleableModuleConfig Pomodoro { get; set; } = new();

    [JsonPropertyName("scrapboard")]
    public ToggleableModuleConfig Scrapboard { get; set; } = new();

    [JsonPropertyName("system_vitals")]
    public SystemVitalsModuleConfig SystemVitals { get; set; } = new();

    [JsonPropertyName("media_player")]
    public MediaPlayerModuleConfig MediaPlayer { get; set; } = new();

    [JsonPropertyName("countdown")]
    public CountdownModuleConfig Countdown { get; set; } = new();

    [JsonPropertyName("comms")]
    public CommsModuleConfig Comms { get; set; } = new();

    [JsonPropertyName("daily_digest")]
    public ToggleableModuleConfig DailyDigest { get; set; } = new();

    [JsonPropertyName("dino_companion")]
    public DinoCompanionModuleConfig DinoCompanion { get; set; } = new();
}

public class SlideshowModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("interval_sec")]
    public int IntervalSec { get; set; } = 300;

    [JsonPropertyName("folder_path")]
    public string FolderPath { get; set; } = "./wallpapers";

    [JsonPropertyName("use_windows_wallpaper")]
    public bool UseWindowsWallpaper { get; set; } = true;
}

public class CycleTrackerModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("last_period_start")]
    public string LastPeriodStart { get; set; } = DateTime.Now.AddDays(-11).ToString("yyyy-MM-dd");

    [JsonPropertyName("cycle_length_days")]
    public int CycleLengthDays { get; set; } = 28;

    [JsonPropertyName("period_length_days")]
    public int PeriodLengthDays { get; set; } = 5;
}

public class ClockCalendarModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("show_seconds")]
    public bool ShowSeconds { get; set; } = true;

    [JsonPropertyName("compact_calendar")]
    public bool CompactCalendar { get; set; } = true;

    [JsonPropertyName("google_ical_url")]
    public string GoogleIcalUrl { get; set; } = "";
}

public class OneThingModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("task")]
    public string Task { get; set; } = "";

    [JsonPropertyName("completed")]
    public bool Completed { get; set; } = false;

    [JsonPropertyName("last_date")]
    public string? LastDate { get; set; }
}

public class NotesModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("file_path")]
    public string FilePath { get; set; } = "./notes.md";
}

public class SystemVitalsModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("refresh_ms")]
    public int RefreshMs { get; set; } = 2000;
}

public class MediaPlayerModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;
}

public class CountdownModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("label")]
    public string Label { get; set; } = "Next Adventure";

    [JsonPropertyName("target_iso")]
    public string TargetIso { get; set; } = "2026-12-01T00:00:00";
}

public class CommsModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("whatsapp_enabled")]
    public bool WhatsappEnabled { get; set; } = true;

    [JsonPropertyName("email_enabled")]
    public bool EmailEnabled { get; set; } = true;

    [JsonPropertyName("email_url")]
    public string EmailUrl { get; set; } = "https://mail.google.com";
}

public class HeaderTitleModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("text")]
    public string Text { get; set; } = "";
}

public class DinoCompanionModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("variant")]
    public string Variant { get; set; } = "ankylosaurus";

    [JsonPropertyName("auto_cycle")]
    public bool AutoCycle { get; set; } = false;

    [JsonPropertyName("cycle_variants")]
    public List<string> CycleVariants { get; set; } = new() { "ankylosaurus", "triceratops", "stegosaurus", "brachiosaurus" };

    [JsonPropertyName("speed")]
    public int Speed { get; set; } = 100;

    [JsonPropertyName("opacity")]
    public int Opacity { get; set; } = 100;
}

public class ToggleableModuleConfig
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;
}

public class MonitorInfo
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("label")]
    public string Label { get; set; } = "";

    [JsonPropertyName("x")]
    public int X { get; set; }

    [JsonPropertyName("y")]
    public int Y { get; set; }

    [JsonPropertyName("width")]
    public int Width { get; set; }

    [JsonPropertyName("height")]
    public int Height { get; set; }

    [JsonPropertyName("is_primary")]
    public bool IsPrimary { get; set; }
}

public class SystemVitalsData
{
    [JsonPropertyName("cpu_percent")]
    public double CpuPercent { get; set; }

    [JsonPropertyName("ram_percent")]
    public double RamPercent { get; set; }

    [JsonPropertyName("ram_used_gb")]
    public double RamUsedGb { get; set; }

    [JsonPropertyName("ram_total_gb")]
    public double RamTotalGb { get; set; }

    [JsonPropertyName("gpu_percent")]
    public double GpuPercent { get; set; }
}

public class MediaSessionData
{
    [JsonPropertyName("has_session")]
    public bool HasSession { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("artist")]
    public string Artist { get; set; } = "";

    [JsonPropertyName("album")]
    public string Album { get; set; } = "";

    [JsonPropertyName("is_playing")]
    public bool IsPlaying { get; set; }

    [JsonPropertyName("thumbnail_base64")]
    public string? ThumbnailBase64 { get; set; }
}

public class CalendarEvent
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("start_iso")]
    public string StartIso { get; set; } = "";

    [JsonPropertyName("end_iso")]
    public string? EndIso { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("source")]
    public string Source { get; set; } = "json";
}

public class DailyQuote
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("category")]
    public string Category { get; set; } = "Coding Tip";

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("content")]
    public string Content { get; set; } = "";

    [JsonPropertyName("author_or_key")]
    public string? AuthorOrKey { get; set; }
}

public class ScrapItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("type")]
    public string Type { get; set; } = "text";

    [JsonPropertyName("value")]
    public string Value { get; set; } = "";

    [JsonPropertyName("label")]
    public string Label { get; set; } = "";

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = "";

    [JsonPropertyName("saved_path")]
    public string? SavedPath { get; set; }
}

public class CommsNotificationItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("app")]
    public string App { get; set; } = "whatsapp";

    [JsonPropertyName("sender")]
    public string Sender { get; set; } = "";

    [JsonPropertyName("preview")]
    public string Preview { get; set; } = "";

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = "";
}

public class CommsStatusData
{
    [JsonPropertyName("listener_permitted")]
    public bool ListenerPermitted { get; set; }

    [JsonPropertyName("whatsapp_running")]
    public bool WhatsappRunning { get; set; }

    [JsonPropertyName("whatsapp_unread")]
    public int WhatsappUnread { get; set; }

    [JsonPropertyName("email_unread")]
    public int EmailUnread { get; set; }

    [JsonPropertyName("recent_items")]
    public List<CommsNotificationItem> RecentItems { get; set; } = new();
}
