using System.Globalization;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using AmbientDeck.Models;
using Microsoft.Win32;

namespace AmbientDeck.Services;

public class StorageService
{
    public string AppDataFolder { get; }
    public string ConfigFilePath { get; }
    public string AppDataNotesPath { get; }
    public string EventsJsonPath { get; }
    public string EventsIcsPath { get; }
    public string GoogleIcsCachePath { get; }
    public string QuotesJsonPath { get; }
    public string DropsFolderPath { get; }
    public string DefaultWallpapersFolder { get; }

    private static readonly HttpClient Http = new()
    {
        Timeout = TimeSpan.FromSeconds(12)
    };

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };

    public StorageService()
    {
        string roaming = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        AppDataFolder = Path.Combine(roaming, "Dino_ambient_Deck");
        Directory.CreateDirectory(AppDataFolder);

        // Migrate existing files from %APPDATA%/AmbientDeck if present
        string legacyFolder = Path.Combine(roaming, "AmbientDeck");
        if (Directory.Exists(legacyFolder))
        {
            foreach (string file in new[] { "config.json", "notes.md", "events.json", "events.ics", "quotes.json" })
            {
                string src = Path.Combine(legacyFolder, file);
                string dst = Path.Combine(AppDataFolder, file);
                if (File.Exists(src) && !File.Exists(dst))
                {
                    try
                    {
                        File.Copy(src, dst);
                    }
                    catch
                    {
                    }
                }
            }
        }

        ConfigFilePath = Path.Combine(AppDataFolder, "config.json");
        AppDataNotesPath = Path.Combine(AppDataFolder, "notes.md");
        EventsJsonPath = Path.Combine(AppDataFolder, "events.json");
        EventsIcsPath = Path.Combine(AppDataFolder, "events.ics");
        GoogleIcsCachePath = Path.Combine(AppDataFolder, "google_calendar.ics");
        try { if (File.Exists(GoogleIcsCachePath)) File.Delete(GoogleIcsCachePath); } catch { }
        QuotesJsonPath = Path.Combine(AppDataFolder, "quotes.json");

        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        DropsFolderPath = Path.Combine(baseDir, "drops");
        DefaultWallpapersFolder = Path.Combine(baseDir, "wallpapers");

        Directory.CreateDirectory(DropsFolderPath);
        Directory.CreateDirectory(DefaultWallpapersFolder);

        EnsureSeedFiles();
        EnsureCompanionsSynced();
    }

    private void EnsureSeedFiles()
    {
        if (!File.Exists(AppDataNotesPath))
        {
            File.WriteAllText(
                AppDataNotesPath,
                "# Dino_ambient_Deck Notizen\n\n- Jede Eingabe wird automatisch in `%APPDATA%/Dino_ambient_Deck/notes.md` gespeichert\n- Layout (Hochkant / Querformat), Größe und Farben sind in den Einstellungen anpassbar\n"
            );
        }

        if (!File.Exists(QuotesJsonPath))
        {
            var defaultQuotes = new List<DailyQuote>
            {
                new()
                {
                    Id = "q1",
                    Category = "Coding Tip",
                    Title = "Debounce High-Frequency I/O",
                    Content = "Debounce window resize/move listeners (500ms) before persisting state to disk.",
                    AuthorOrKey = "Systems Design"
                },
                new()
                {
                    Id = "q2",
                    Category = "Shortcut",
                    Title = "Windows Virtual Desktop Switch",
                    Content = "Drücke Ctrl + Win + Pfeiltaste Links/Rechts um blitzschnell zwischen Desktops zu wechseln.",
                    AuthorOrKey = "Ctrl+Win+Arrows"
                },
                new()
                {
                    Id = "q3",
                    Category = "Quote",
                    Title = "Calm Technology",
                    Content = "\"The most profound technologies are those that disappear. They weave themselves into the fabric of everyday life.\"",
                    AuthorOrKey = "Mark Weiser"
                },
                new()
                {
                    Id = "q4",
                    Category = "Coding Tip",
                    Title = "Idempotent State Transitions",
                    Content = "Design configuration reloads so applying the same config twice produces zero side-effects.",
                    AuthorOrKey = "Architecture"
                }
            };
            File.WriteAllText(QuotesJsonPath, JsonSerializer.Serialize(defaultQuotes, JsonOptions));
        }

        if (!File.Exists(EventsJsonPath))
        {
            File.WriteAllText(EventsJsonPath, JsonSerializer.Serialize(new List<CalendarEvent>(), JsonOptions));
        }

        if (!Directory.EnumerateFiles(DefaultWallpapersFolder).Any())
        {
            File.WriteAllText(
                Path.Combine(DefaultWallpapersFolder, "01-midnight-aurora.svg"),
                """
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
                  <defs>
                    <radialGradient id="bg" cx="25%" cy="20%" r="80%">
                      <stop offset="0%" stop-color="#0d2b45"/>
                      <stop offset="50%" stop-color="#091326"/>
                      <stop offset="100%" stop-color="#04070f"/>
                    </radialGradient>
                    <radialGradient id="glow" cx="75%" cy="70%" r="50%">
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.24"/>
                      <stop offset="100%" stop-color="#04070f" stop-opacity="0"/>
                    </radialGradient>
                  </defs>
                  <rect width="1920" height="1080" fill="url(#bg)"/>
                  <rect width="1920" height="1080" fill="url(#glow)"/>
                  <circle cx="1480" cy="220" r="320" fill="#38bdf8" opacity="0.07"/>
                  <path d="M0,820 Q480,710 960,800 T1920,730 L1920,1080 L0,1080 Z" fill="#071020" opacity="0.78"/>
                  <path d="M0,900 Q600,820 1200,890 T1920,840 L1920,1080 L0,1080 Z" fill="#03060d" opacity="0.92"/>
                </svg>
                """
            );

            File.WriteAllText(
                Path.Combine(DefaultWallpapersFolder, "02-cyber-nebula.svg"),
                """
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
                  <defs>
                    <radialGradient id="neb" cx="70%" cy="25%" r="85%">
                      <stop offset="0%" stop-color="#1e1b4b"/>
                      <stop offset="55%" stop-color="#0f172a"/>
                      <stop offset="100%" stop-color="#05070d"/>
                    </radialGradient>
                  </defs>
                  <rect width="1920" height="1080" fill="url(#neb)"/>
                  <circle cx="420" cy="320" r="340" fill="#38bdf8" opacity="0.06"/>
                  <circle cx="1520" cy="680" r="380" fill="#f59e0b" opacity="0.05"/>
                  <path d="M0,830 Q540,730 1080,820 T1920,750 L1920,1080 L0,1080 Z" fill="#080d1a" opacity="0.82"/>
                </svg>
                """
            );

            File.WriteAllText(
                Path.Combine(DefaultWallpapersFolder, "03-emerald-horizon.svg"),
                """
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
                  <defs>
                    <radialGradient id="em" cx="45%" cy="15%" r="85%">
                      <stop offset="0%" stop-color="#063932"/>
                      <stop offset="55%" stop-color="#081824"/>
                      <stop offset="100%" stop-color="#04070d"/>
                    </radialGradient>
                  </defs>
                  <rect width="1920" height="1080" fill="url(#em)"/>
                  <circle cx="960" cy="260" r="360" fill="#34d399" opacity="0.06"/>
                  <path d="M0,810 Q480,740 960,810 T1920,760 L1920,1080 L0,1080 Z" fill="#061019" opacity="0.85"/>
                </svg>
                """
            );
        }
    }

    public AmbientDeckConfig LoadConfig(List<MonitorInfo> monitors)
    {
        AmbientDeckConfig config;
        if (File.Exists(ConfigFilePath))
        {
            try
            {
                string json = File.ReadAllText(ConfigFilePath);
                config = JsonSerializer.Deserialize<AmbientDeckConfig>(json, JsonOptions) ?? new AmbientDeckConfig();
            }
            catch
            {
                config = CreateDefaultConfig(monitors);
            }
        }
        else
        {
            config = CreateDefaultConfig(monitors);
        }

        if (string.IsNullOrWhiteSpace(config.Window.LayerMode) || config.Window.LayerMode == "normal")
        {
            config.Window.LayerMode = config.Window.AlwaysOnBottom ? "background" : "foreground";
        }
        if (string.IsNullOrWhiteSpace(config.Window.OrientationMode))
        {
            config.Window.OrientationMode = "auto";
        }
        if (string.IsNullOrWhiteSpace(config.Theme.BackgroundMode) ||
            config.Theme.BackgroundMode == "white" ||
            config.Theme.BackgroundMode == "wallpaper")
        {
            config.Theme.BackgroundMode = "glass";
        }
        if (string.IsNullOrWhiteSpace(config.Theme.FontFamily))
        {
            config.Theme.FontFamily = "Inter";
        }
        if (config.Theme.FontScale < 70 || config.Theme.FontScale > 150)
        {
            config.Theme.FontScale = 100;
        }
        if (config.Theme.ColorMode == "custom")
        {
            config.Theme.ColorMode = "cyber_blue";
        }
        config.Theme.UseCustomTextColor = false;
        config.Theme.UseCustomSecondaryColor = false;
        if (string.IsNullOrWhiteSpace(config.Modules.CycleTracker.LastPeriodStart))
        {
            config.Modules.CycleTracker.LastPeriodStart = DateTime.Now.AddDays(-11).ToString("yyyy-MM-dd");
        }
        if (config.Modules.DinoCompanion.CycleVariants == null || config.Modules.DinoCompanion.CycleVariants.Count == 0)
        {
            config.Modules.DinoCompanion.CycleVariants = new List<string> { "ankylosaurus", "triceratops", "stegosaurus", "brachiosaurus" };
        }

        // Daily rollover check for "One Thing"
        string today = DateTime.Now.ToString("yyyy-MM-dd");
        if (!string.IsNullOrEmpty(config.Modules.OneThing.LastDate) && config.Modules.OneThing.LastDate != today)
        {
            if (config.Modules.OneThing.Completed)
            {
                config.Modules.OneThing.Task = "";
                config.Modules.OneThing.Completed = false;
            }
            config.Modules.OneThing.LastDate = today;
        }
        else if (string.IsNullOrEmpty(config.Modules.OneThing.LastDate))
        {
            config.Modules.OneThing.LastDate = today;
        }

        SaveConfig(config);
        return config;
    }

    private static AmbientDeckConfig CreateDefaultConfig(List<MonitorInfo> monitors)
    {
        var target = monitors.LastOrDefault() ?? new MonitorInfo
        {
            Id = 1,
            X = 0,
            Y = 0,
            Width = 1920,
            Height = 1080
        };

        return new AmbientDeckConfig
        {
            Window = new WindowConfig
            {
                MonitorId = target.Id,
                X = target.X,
                Y = target.Y,
                Width = target.Width,
                Height = target.Height,
                IsLocked = false,
                AlwaysOnBottom = true,
                LayerMode = "background",
                OrientationMode = "auto",
                Autostart = false
            }
        };
    }

    public void SaveConfig(AmbientDeckConfig config)
    {
        try
        {
            string json = JsonSerializer.Serialize(config, JsonOptions);
            File.WriteAllText(ConfigFilePath, json);
        }
        catch
        {
        }
    }

    public string LoadNotes()
    {
        try
        {
            return File.Exists(AppDataNotesPath) ? File.ReadAllText(AppDataNotesPath) : "";
        }
        catch
        {
            return "";
        }
    }

    public void SaveNotes(string content, string? customRelativePath = null)
    {
        try
        {
            File.WriteAllText(AppDataNotesPath, content);
            if (!string.IsNullOrWhiteSpace(customRelativePath))
            {
                string localPath = Path.IsPathRooted(customRelativePath)
                    ? customRelativePath
                    : Path.Combine(AppDomain.CurrentDomain.BaseDirectory, customRelativePath.TrimStart('.', '/', '\\'));
                string? dir = Path.GetDirectoryName(localPath);
                if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
                File.WriteAllText(localPath, content);
            }
        }
        catch
        {
        }
    }

    public string ResolveWallpaperDirectory(string configuredPath)
    {
        if (string.IsNullOrWhiteSpace(configuredPath) || configuredPath == "./wallpapers")
        {
            return DefaultWallpapersFolder;
        }
        if (Path.IsPathRooted(configuredPath) && Directory.Exists(configuredPath))
        {
            return configuredPath;
        }
        string rel = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, configuredPath.TrimStart('.', '/', '\\'));
        if (Directory.Exists(rel)) return rel;
        return DefaultWallpapersFolder;
    }

    public string? SyncWindowsDesktopWallpaper(string configuredPath)
    {
        try
        {
            string roaming = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string transcoded = Path.Combine(roaming, "Microsoft", "Windows", "Themes", "TranscodedWallpaper");
            string? srcFile = null;

            if (File.Exists(transcoded))
            {
                srcFile = transcoded;
            }
            else
            {
                string cachedDir = Path.Combine(roaming, "Microsoft", "Windows", "Themes", "CachedFiles");
                if (Directory.Exists(cachedDir))
                {
                    srcFile = Directory.EnumerateFiles(cachedDir, "*.jpg").FirstOrDefault();
                }

                if (srcFile == null)
                {
                    using RegistryKey? deskKey = Registry.CurrentUser.OpenSubKey(@"Control Panel\Desktop");
                    string? regPath = deskKey?.GetValue("WallPaper") as string;
                    if (!string.IsNullOrWhiteSpace(regPath) && File.Exists(regPath))
                    {
                        srcFile = regPath;
                    }
                }
            }

            if (srcFile != null && File.Exists(srcFile))
            {
                string folder = ResolveWallpaperDirectory(configuredPath);
                Directory.CreateDirectory(folder);
                string dstFile = Path.Combine(folder, "_windows_desktop_wallpaper.jpg");
                File.Copy(srcFile, dstFile, overwrite: true);
                long ticks = File.GetLastWriteTimeUtc(srcFile).Ticks;
                return $"https://wallpapers.ambientdeck.local/_windows_desktop_wallpaper.jpg?v={ticks}";
            }
        }
        catch
        {
        }

        return null;
    }

    public List<string> GetWallpaperUrls(string configuredPath)
    {
        string folder = ResolveWallpaperDirectory(configuredPath);
        if (!Directory.Exists(folder)) return new List<string>();

        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"
        };

        return Directory
            .EnumerateFiles(folder)
            .Where(f => allowed.Contains(Path.GetExtension(f)) &&
                        !Path.GetFileName(f).Equals("_windows_desktop_wallpaper.jpg", StringComparison.OrdinalIgnoreCase))
            .OrderBy(f => f)
            .Select(f => $"https://wallpapers.ambientdeck.local/{Uri.EscapeDataString(Path.GetFileName(f))}")
            .ToList();
    }

    public string ResolveCompanionsDirectory()
    {
        string appData = Path.Combine(AppDataFolder, "companions");
        Directory.CreateDirectory(appData);
        return appData;
    }

    public void EnsureCompanionsSynced()
    {
        try
        {
            string appData = ResolveCompanionsDirectory();

            // Clean up any broken/stub legacy files that have no sprites
            string legacyStub = Path.Combine(appData, "companion.json");
            if (File.Exists(legacyStub) && new FileInfo(legacyStub).Length < 1000)
            {
                try { File.Delete(legacyStub); } catch { }
            }

            // Clean up old experimental addons removed by user request
            string[] deprecatedAddons = { "diddl", "elfe", "hund1", "hund2", "katze1", "katze2", "optimus", "robot", "troll" };
            foreach (var dep in deprecatedAddons)
            {
                try
                {
                    string p1 = Path.Combine(appData, $"{dep}.companion.json");
                    if (File.Exists(p1)) File.Delete(p1);
                    string p2 = Path.Combine(appData, $"{dep}.json");
                    if (File.Exists(p2)) File.Delete(p2);
                }
                catch { }
            }

            // Find source bundled companions folder
            var candidateSourceDirs = new[]
            {
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "companions"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "companions"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "companions")
            };

            foreach (var srcDir in candidateSourceDirs)
            {
                if (Directory.Exists(srcDir) && !Path.GetFullPath(srcDir).Equals(Path.GetFullPath(appData), StringComparison.OrdinalIgnoreCase))
                {
                    foreach (var file in Directory.EnumerateFiles(srcDir, "*.companion.json"))
                    {
                        try
                        {
                            string fileName = Path.GetFileName(file);
                            string dst = Path.Combine(appData, fileName);
                            if (!File.Exists(dst) || new FileInfo(dst).Length < 1000 || File.GetLastWriteTimeUtc(file) > File.GetLastWriteTimeUtc(dst))
                            {
                                File.Copy(file, dst, true);
                            }
                        }
                        catch { }
                    }
                }
            }
            // Also sync companion-editor to AppData so it is ALWAYS available
            try
            {
                string dstEditorDir = Path.Combine(AppDataFolder, "companion-editor");
                string? srcEditorPath = ResolveCompanionEditorPath();
                if (!string.IsNullOrEmpty(srcEditorPath) && File.Exists(srcEditorPath))
                {
                    string srcEditorDir = Path.GetDirectoryName(srcEditorPath)!;
                    if (!Path.GetFullPath(srcEditorDir).Equals(Path.GetFullPath(dstEditorDir), StringComparison.OrdinalIgnoreCase))
                    {
                        Directory.CreateDirectory(dstEditorDir);
                        foreach (var f in Directory.EnumerateFiles(srcEditorDir))
                        {
                            string target = Path.Combine(dstEditorDir, Path.GetFileName(f));
                            if (!File.Exists(target) || File.GetLastWriteTimeUtc(f) > File.GetLastWriteTimeUtc(target))
                            {
                                File.Copy(f, target, true);
                            }
                        }
                    }
                }
            }
            catch { }
        }
        catch { }
    }

    public string? ResolveCompanionEditorPath()
    {
        var candidates = new List<string>
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "companion-editor", "index.html"),
            Path.Combine(Environment.CurrentDirectory, "companion-editor", "index.html"),
            Path.Combine(Path.GetDirectoryName(Environment.ProcessPath ?? "") ?? "", "companion-editor", "index.html"),
            Path.Combine(Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..")), "companion-editor", "index.html"),
            Path.Combine(Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..")), "companion-editor", "index.html"),
            Path.Combine(Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..")), "companion-editor", "index.html"),
            Path.Combine(AppDataFolder, "companion-editor", "index.html")
        };

        foreach (var c in candidates)
        {
            try
            {
                if (File.Exists(c)) return Path.GetFullPath(c);
            }
            catch { }
        }

        return null;
    }

    public string? ResolveAddonSpritesDirectory()
    {
        string direct = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Addon_sprites");
        if (Directory.Exists(direct)) return direct;

        string dev = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "Addon_sprites"));
        if (Directory.Exists(dev)) return dev;

        string parent = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "Addon_sprites"));
        if (Directory.Exists(parent)) return parent;

        return null;
    }

    public List<AddonCompanionInfo> GetAddonCompanions()
    {
        EnsureCompanionsSynced();

        var list = new List<AddonCompanionInfo>();
        var scannedIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // 1. Scan single-file companion addons (.companion.json / .json) across all candidate directories
        var scanDirs = new List<string>
        {
            ResolveCompanionsDirectory(),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "companions"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "companions"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "companions")
        };

        foreach (var compDir in scanDirs)
        {
            if (!Directory.Exists(compDir)) continue;

            try
            {
                foreach (var filePath in Directory.EnumerateFiles(compDir, "*.json"))
                {
                    try
                    {
                        string fileName = Path.GetFileName(filePath).ToLowerInvariant();
                        if (fileName.Contains("readme") || fileName.Contains("manifest")) continue;

                        string text = File.ReadAllText(filePath);
                        using var doc = JsonDocument.Parse(text);
                        var root = doc.RootElement;

                        string id = root.TryGetProperty("id", out var pId) ? (pId.GetString() ?? "") : "";
                        if (string.IsNullOrWhiteSpace(id))
                        {
                            id = Path.GetFileNameWithoutExtension(filePath)
                                .Replace(".companion", "", StringComparison.OrdinalIgnoreCase)
                                .ToLowerInvariant();
                        }
                        id = id.ToLowerInvariant();
                        if (scannedIds.Contains(id)) continue;

                        string name = root.TryGetProperty("name", out var pName) ? (pName.GetString() ?? id) : id;
                        string desc = root.TryGetProperty("description", out var pDesc) ? (pDesc.GetString() ?? "") : "";
                        string icon = root.TryGetProperty("icon", out var pIcon) ? (pIcon.GetString() ?? "✨") : "✨";
                        string author = root.TryGetProperty("author", out var pAuth) ? (pAuth.GetString() ?? "Addon") : "Addon";
                        string previewUrl = root.TryGetProperty("preview", out var pPrev) ? (pPrev.GetString() ?? "") : "";
                        if (string.IsNullOrEmpty(previewUrl) && root.TryGetProperty("preview_url", out var pPrevUrl))
                        {
                            previewUrl = pPrevUrl.GetString() ?? "";
                        }
                        int scale = root.TryGetProperty("scale", out var pScale) ? pScale.GetInt32() : 100;
                        int speed = root.TryGetProperty("speed", out var pSpd) ? pSpd.GetInt32() : 100;
                        bool isFlying = (root.TryGetProperty("is_flying", out var pFly) && pFly.GetBoolean()) || id.Equals("biene", StringComparison.OrdinalIgnoreCase);

                        CompanionSprites? sprites = null;
                        if (root.TryGetProperty("sprites", out var pSprites) && pSprites.ValueKind == JsonValueKind.Object)
                        {
                            sprites = new CompanionSprites();
                            if (pSprites.TryGetProperty("walk", out var sWalk) && sWalk.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var el in sWalk.EnumerateArray())
                                {
                                    string? s = el.GetString();
                                    if (!string.IsNullOrEmpty(s)) sprites.Walk.Add(s);
                                }
                            }
                            if (pSprites.TryGetProperty("tail", out var sTail) && sTail.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var el in sTail.EnumerateArray())
                                {
                                    string? s = el.GetString();
                                    if (!string.IsNullOrEmpty(s)) sprites.Tail.Add(s);
                                }
                            }
                            if (pSprites.TryGetProperty("jump", out var sJump) && sJump.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var el in sJump.EnumerateArray())
                                {
                                    string? s = el.GetString();
                                    if (!string.IsNullOrEmpty(s)) sprites.Jump.Add(s);
                                }
                            }
                        }

                        // Fallback: If only preview image was provided, use it as walk frame
                        if ((sprites == null || sprites.Walk.Count == 0) && !string.IsNullOrEmpty(previewUrl))
                        {
                            sprites ??= new CompanionSprites();
                            sprites.Walk.Add(previewUrl);
                        }

                        if (sprites != null && sprites.Walk.Count > 0)
                        {
                            if (sprites.Jump.Count == 0) sprites.Jump.AddRange(sprites.Walk);
                            if (sprites.Tail.Count == 0) sprites.Tail.AddRange(sprites.Walk);
                            if (string.IsNullOrEmpty(previewUrl)) previewUrl = sprites.Walk[0];
                        }

                        // VALIDATION: Skip invalid stubs that don't have animation frames
                        if (sprites == null || sprites.Walk.Count == 0) continue;

                        scannedIds.Add(id);
                        list.Add(new AddonCompanionInfo
                        {
                            Id = id,
                            Name = name,
                            Description = desc,
                            Icon = icon,
                            Author = author,
                            PreviewUrl = previewUrl,
                            WalkFrames = sprites.Walk.Count,
                            JumpFrames = sprites.Jump.Count,
                            TailFrames = sprites.Tail.Count,
                            Scale = scale,
                            Speed = speed,
                            IsFlying = isFlying,
                            Sprites = sprites
                        });
                    }
                    catch { }
                }
            }
            catch { }
        }

        // 2. Legacy folder-based companions in Addon_sprites are discontinued; only single-file packages are used.
        return list;
    }

    public List<DailyQuote> LoadQuotes()
    {
        try
        {
            if (File.Exists(QuotesJsonPath))
            {
                return JsonSerializer.Deserialize<List<DailyQuote>>(
                        File.ReadAllText(QuotesJsonPath),
                        JsonOptions
                    ) ?? new List<DailyQuote>();
            }
        }
        catch
        {
        }
        return new List<DailyQuote>();
    }

    public async Task<List<CalendarEvent>> SyncGoogleCalendarIcsAsync(string icalUrl)
    {
        if (!string.IsNullOrWhiteSpace(icalUrl))
        {
            try
            {
                if (icalUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                    icalUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    string icsContent = await Http.GetStringAsync(icalUrl);
                    if (icsContent.Contains("BEGIN:VCALENDAR", StringComparison.OrdinalIgnoreCase))
                    {
                        await File.WriteAllTextAsync(GoogleIcsCachePath, icsContent);
                    }
                }
                else if (File.Exists(icalUrl))
                {
                    File.Copy(icalUrl, GoogleIcsCachePath, overwrite: true);
                }
            }
            catch
            {
            }
        }

        return LoadAllEvents();
    }

    public List<CalendarEvent> LoadAllEvents()
    {
        var results = new List<CalendarEvent>();
        var today = DateTime.Today;

        // 1. Load & auto-clean events.json (keep events of today & future, remove expired days, max 3 active)
        try
        {
            if (File.Exists(EventsJsonPath))
            {
                var fromJson = JsonSerializer.Deserialize<List<CalendarEvent>>(
                    File.ReadAllText(EventsJsonPath),
                    JsonOptions
                );
                if (fromJson != null)
                {
                    var cleaned = fromJson
                        .Where(ev =>
                            ev.Id != "ev-1" &&
                            ev.Id != "ev-2" &&
                            !ev.Title.Contains("Architecture Review", StringComparison.OrdinalIgnoreCase) &&
                            !ev.Title.Equals("Team Sync", StringComparison.OrdinalIgnoreCase) &&
                            DateTime.TryParse(ev.StartIso, out DateTime dt) &&
                            dt.Date >= today)
                        .OrderBy(ev => DateTime.Parse(ev.StartIso))
                        .Take(3)
                        .ToList();

                    if (cleaned.Count != fromJson.Count)
                    {
                        File.WriteAllText(EventsJsonPath, JsonSerializer.Serialize(cleaned, JsonOptions));
                    }

                    results.AddRange(cleaned);
                }
            }
        }
        catch
        {
        }

        return results;
    }

    public List<CalendarEvent> SaveManualEvents(List<CalendarEvent> manualEvents)
    {
        var today = DateTime.Today;
        var active = (manualEvents ?? new List<CalendarEvent>())
            .Where(ev =>
                !string.IsNullOrWhiteSpace(ev.Title) &&
                DateTime.TryParse(ev.StartIso, out DateTime dt) &&
                dt.Date >= today)
            .OrderBy(ev => DateTime.Parse(ev.StartIso))
            .Take(3)
            .Select(ev => new CalendarEvent
            {
                Id = string.IsNullOrWhiteSpace(ev.Id)
                    ? $"ev-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}"
                    : ev.Id,
                Title = ev.Title.Trim(),
                StartIso = ev.StartIso,
                Source = "json"
            })
            .ToList();

        try
        {
            File.WriteAllText(EventsJsonPath, JsonSerializer.Serialize(active, JsonOptions));
        }
        catch
        {
        }

        return LoadAllEvents();
    }

    public List<CalendarEvent> AddJsonEvent(string title, string startIso)
    {
        var list = new List<CalendarEvent>();
        try
        {
            if (File.Exists(EventsJsonPath))
            {
                list = JsonSerializer.Deserialize<List<CalendarEvent>>(
                        File.ReadAllText(EventsJsonPath),
                        JsonOptions
                    ) ?? new List<CalendarEvent>();
            }
        }
        catch
        {
        }

        list.Add(
            new CalendarEvent
            {
                Id = $"ev-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                Title = title,
                StartIso = startIso,
                Source = "json"
            }
        );

        return SaveManualEvents(list);
    }

    private static List<CalendarEvent> ParseIcsFile(string path, string sourceTag)
    {
        var events = new List<CalendarEvent>();
        string[] lines = File.ReadAllLines(path);
        bool inEvent = false;
        string uid = "";
        string summary = "";
        string dtStart = "";

        foreach (string rawLine in lines)
        {
            string line = rawLine.Trim();
            if (line.Equals("BEGIN:VEVENT", StringComparison.OrdinalIgnoreCase))
            {
                inEvent = true;
                uid = Guid.NewGuid().ToString("N");
                summary = "Kalender-Termin";
                dtStart = "";
            }
            else if (line.Equals("END:VEVENT", StringComparison.OrdinalIgnoreCase) && inEvent)
            {
                inEvent = false;
                if (!string.IsNullOrEmpty(dtStart))
                {
                    events.Add(
                        new CalendarEvent
                        {
                            Id = uid,
                            Title = summary,
                            StartIso = dtStart,
                            Source = sourceTag
                        }
                    );
                }
            }
            else if (inEvent)
            {
                if (line.StartsWith("UID:", StringComparison.OrdinalIgnoreCase))
                {
                    uid = line[4..].Trim();
                }
                else if (line.StartsWith("SUMMARY", StringComparison.OrdinalIgnoreCase))
                {
                    int colonIdx = line.IndexOf(':');
                    if (colonIdx > 0) summary = line[(colonIdx + 1)..].Trim();
                }
                else if (line.StartsWith("DTSTART", StringComparison.OrdinalIgnoreCase))
                {
                    int colonIdx = line.IndexOf(':');
                    if (colonIdx > 0)
                    {
                        string val = line[(colonIdx + 1)..].Trim();
                        dtStart = ConvertIcsDateToIso(val);
                    }
                }
            }
        }

        return events;
    }

    private static string ConvertIcsDateToIso(string icsVal)
    {
        bool isUtc = icsVal.EndsWith("Z", StringComparison.OrdinalIgnoreCase);
        string clean = icsVal.TrimEnd('Z');
        if (DateTime.TryParseExact(
                clean,
                new[] { "yyyyMMddTHHmmss", "yyyyMMddTHHmm", "yyyyMMdd" },
                CultureInfo.InvariantCulture,
                isUtc ? DateTimeStyles.AssumeUniversal : DateTimeStyles.AssumeLocal,
                out DateTime parsed
            ))
        {
            return parsed.ToLocalTime().ToString("yyyy-MM-ddTHH:mm:ss");
        }
        return DateTime.Now.AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss");
    }

    public string SaveDroppedFile(string fileName, string base64Data)
    {
        string safeName = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(safeName)) safeName = $"drop-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.bin";
        string destPath = Path.Combine(DropsFolderPath, safeName);
        byte[] bytes = Convert.FromBase64String(base64Data);
        File.WriteAllBytes(destPath, bytes);
        return destPath;
    }

    public void SetWindowsAutostart(bool enable)
    {
        try
        {
            const string runKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Run";
            using RegistryKey? key = Registry.CurrentUser.OpenSubKey(runKeyPath, writable: true);
            if (key == null) return;

            key.DeleteValue("AmbientDeck", throwOnMissingValue: false);

            if (enable)
            {
                string exePath = Environment.ProcessPath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Dino_ambient_Deck.exe");
                key.SetValue("Dino_ambient_Deck", $"\"{exePath}\"");
            }
            else
            {
                key.DeleteValue("Dino_ambient_Deck", throwOnMissingValue: false);
            }
        }
        catch
        {
        }
    }
}
