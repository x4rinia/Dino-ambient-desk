using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Windows;
using System.Windows.Forms;
using System.Windows.Interop;
using System.Windows.Threading;
using AmbientDeck.Models;
using AmbientDeck.Services;
using Microsoft.Web.WebView2.Core;

namespace AmbientDeck;

public partial class MainWindow : Window
{
    [DllImport("psapi.dll")]
    private static extern int EmptyWorkingSet(IntPtr hwProc);

    public static void TrimProcessMemory()
    {
        try
        {
            GC.Collect(2, GCCollectionMode.Aggressive, true, true);
            GC.WaitForPendingFinalizers();
            EmptyWorkingSet(Process.GetCurrentProcess().Handle);
        }
        catch
        {
        }
    }
    private readonly StorageService _storage = new();
    private readonly SystemVitalsService _vitalsService = new();
    private readonly MediaSessionService _mediaService = new();
    private readonly CommsNotificationService _commsService = new();

    private AmbientDeckConfig _config = new();
    private List<MonitorInfo> _monitors = new();

    public AmbientDeckConfig CurrentConfig => _config;
    public List<MonitorInfo> ConnectedMonitors => _monitors;

    private IntPtr _hwnd;
    private bool _isInitializingWindow = true;
    private bool _webViewReady;

    private CoreWebView2Environment? _webViewEnv;
    private string _wwwroot = "";
    private SettingsWindow? _settingsWindow;

    private readonly DispatcherTimer _boundsDebounceTimer;
    private readonly DispatcherTimer _vitalsTimer;
    private readonly DispatcherTimer _mediaTimer;
    private readonly DispatcherTimer _commsTimer;

    private NotifyIcon? _trayIcon;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = null,
        PropertyNameCaseInsensitive = true
    };

    public MainWindow()
    {
        InitializeComponent();
        ShowInTaskbar = false;
        DashboardWebView.DefaultBackgroundColor = Color.Transparent;

        _monitors = Win32WindowHelper.GetConnectedMonitors();
        _config = _storage.LoadConfig(_monitors);

        // 500 ms debounce timer for saving window bounds
        _boundsDebounceTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(500)
        };
        _boundsDebounceTimer.Tick += (_, _) =>
        {
            _boundsDebounceTimer.Stop();
            SaveCurrentWindowBounds();
        };

        // Hardware vitals timer (default 2000 ms)
        _vitalsTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(Math.Max(500, _config.Modules.SystemVitals.RefreshMs))
        };
        _vitalsTimer.Tick += (_, _) =>
        {
            if (!_webViewReady || !_config.Modules.SystemVitals.Enabled) return;
            var vitals = _vitalsService.PollVitals();
            SendToFrontend("vitals_update", vitals);
        };

        // Media session polling timer
        _mediaTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(2500)
        };
        _mediaTimer.Tick += async (_, _) =>
        {
            if (!_webViewReady || !_config.Modules.MediaPlayer.Enabled) return;
            var media = await _mediaService.GetCurrentMediaAsync();
            SendToFrontend("media_update", media);
        };

        // Communications (WhatsApp & E-Mail) polling timer
        _commsTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(4000)
        };
        _commsTimer.Tick += async (_, _) =>
        {
            if (!_webViewReady || !_config.Modules.Comms.Enabled) return;
            var comms = await _commsService.PollCommsAsync();
            SendToFrontend("comms_update", comms);
        };

        // Low-memory & energy-saver periodic trim timer (every 45s)
        var memTrimTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(45)
        };
        memTrimTimer.Tick += (_, _) =>
        {
            TrimProcessMemory();
        };
        memTrimTimer.Start();

        Loaded += OnWindowLoaded;
        Deactivated += OnWindowDeactivated;
        LocationChanged += OnWindowBoundsChanged;
        SizeChanged += OnWindowBoundsChanged;
        Closed += OnWindowClosed;
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        _hwnd = new WindowInteropHelper(this).Handle;

        // Always hide Dashboard from Taskbar & enable 100% click-through wallpaper mode
        Win32WindowHelper.SetToolWindowAndClickThrough(_hwnd, clickThrough: true);
        ApplyWindowLayerState(_config.Window.LayerMode);

        // Restore window position & size immediately from config.json
        Win32WindowHelper.MoveAndResizeWindow(
            _hwnd,
            _config.Window.X,
            _config.Window.Y,
            _config.Window.Width,
            _config.Window.Height,
            _config.Window.LayerMode
        );

        _isInitializingWindow = false;
    }

    private void OnWindowDeactivated(object? sender, EventArgs e)
    {
        if (_config.Window.LayerMode == "background")
        {
            Win32WindowHelper.SendToBottom(_hwnd);
        }
    }

    private void ApplyWindowLayerState(string layerMode)
    {
        string normalized = layerMode == "foreground" ? "foreground" : "background";
        _config.Window.LayerMode = normalized;
        _config.Window.AlwaysOnBottom = normalized == "background";

        if (normalized == "foreground")
        {
            Topmost = true;
            Win32WindowHelper.ApplyLayerMode(_hwnd, "foreground");
        }
        else
        {
            Topmost = false;
            Win32WindowHelper.ApplyLayerMode(_hwnd, "background");
        }
    }

    private async void OnWindowLoaded(object sender, RoutedEventArgs e)
    {
        InitializeSystemTray();
        await InitializeWebViewAsync();

        _vitalsTimer.Start();
        _mediaTimer.Start();
        _commsTimer.Start();
    }

    private async Task InitializeWebViewAsync()
    {
        try
        {
            string baseDataDir = Path.Combine(_storage.AppDataFolder, "WebView2Data");
            string userDataDir = baseDataDir;

            var options = new CoreWebView2EnvironmentOptions(
                "--disable-features=msSmartScreenProtection,TranslateUI --disable-gpu-shader-disk-cache"
            );

            try
            {
                _webViewEnv = await CoreWebView2Environment.CreateAsync(null, userDataDir, options);
            }
            catch (Exception ex) when (ex.HResult == unchecked((int)0x800700AA) || ex.Message.Contains("0x800700AA"))
            {
                // Fall back to a dedicated process-specific data directory if locked
                userDataDir = Path.Combine(Path.GetTempPath(), $"Dino_WebView2_{Environment.ProcessId}");
                _webViewEnv = await CoreWebView2Environment.CreateAsync(null, userDataDir, options);
            }

            await DashboardWebView.EnsureCoreWebView2Async(_webViewEnv);

            var core = DashboardWebView.CoreWebView2;
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.IsZoomControlEnabled = false;

            try
            {
                core.MemoryUsageTargetLevel = CoreWebView2MemoryUsageTargetLevel.Low;
            }
            catch
            {
            }

            _wwwroot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
            if (!Directory.Exists(_wwwroot))
            {
                string directDist = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "frontend", "dist");
                string devDist = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "frontend", "dist"));
                if (Directory.Exists(directDist)) _wwwroot = directDist;
                else if (Directory.Exists(devDist)) _wwwroot = devDist;
            }

            core.SetVirtualHostNameToFolderMapping(
                "ambientdeck.local",
                _wwwroot,
                CoreWebView2HostResourceAccessKind.Allow
            );

            UpdateWallpapersVirtualHostMapping();
            UpdateAddonSpritesVirtualHostMapping();
            SetupCompanionsWatcher();

            // Inject initial config and wallpaper before HTML loads so frontend renders synchronously without black flash
            try
            {
                string winWp = _storage.SyncWindowsDesktopWallpaper(_config.Modules.Slideshow.FolderPath) ?? "";
                var initialPayload = new
                {
                    config = _config,
                    settings_open = _settingsWindow != null && _settingsWindow.IsLoaded,
                    monitors = _monitors,
                    wallpapers = _storage.GetWallpaperUrls(_config.Modules.Slideshow.FolderPath),
                    windows_wallpaper_url = winWp,
                    notes = _storage.LoadNotes(),
                    events = _storage.LoadAllEvents(),
                    quotes = _storage.LoadQuotes(),
                    addon_companions = _storage.GetAddonCompanions()
                };
                string initJson = JsonSerializer.Serialize(initialPayload, JsonOptions);
                await core.AddScriptToExecuteOnDocumentCreatedAsync($"window.__INITIAL_DATA__ = {initJson};");
            }
            catch
            {
            }

            core.WebMessageReceived += (_, args) => HandleWebMessage(args.TryGetWebMessageAsString());
            core.Navigate("https://ambientdeck.local/index.html?view=dashboard");
            _webViewReady = true;

            // Fallback timer: ensure dashboard is revealed within 1200ms
            _ = Task.Delay(1200).ContinueWith(_ =>
            {
                Dispatcher.Invoke(() => { Opacity = 1; });
            });

            // Trim memory footprint shortly after navigation
            _ = Task.Delay(3500).ContinueWith(_ =>
            {
                Dispatcher.Invoke(TrimProcessMemory);
            });
        }
        catch (Exception ex)
        {
            System.Windows.MessageBox.Show(
                $"Fehler beim Initialisieren von WebView2: {ex.Message}",
                "Dino_ambient_Deck Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );
        }
    }

    private void UpdateWallpapersVirtualHostMapping()
    {
        if (DashboardWebView.CoreWebView2 == null) return;
        string wallpaperDir = _storage.ResolveWallpaperDirectory(_config.Modules.Slideshow.FolderPath);
        Directory.CreateDirectory(wallpaperDir);
        DashboardWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "wallpapers.ambientdeck.local",
            wallpaperDir,
            CoreWebView2HostResourceAccessKind.Allow
        );
    }

    private void UpdateAddonSpritesVirtualHostMapping()
    {
        if (DashboardWebView.CoreWebView2 == null) return;
        string? addonDir = _storage.ResolveAddonSpritesDirectory();
        if (!string.IsNullOrEmpty(addonDir) && Directory.Exists(addonDir))
        {
            try
            {
                DashboardWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "addons.ambientdeck.local",
                    addonDir,
                    CoreWebView2HostResourceAccessKind.Allow
                );
            }
            catch { }
        }
    }

    private FileSystemWatcher? _companionsWatcher;
    private System.Timers.Timer? _companionsDebounceTimer;

    private void SetupCompanionsWatcher()
    {
        try
        {
            string compDir = _storage.ResolveCompanionsDirectory();
            Directory.CreateDirectory(compDir);

            _companionsWatcher?.Dispose();
            _companionsWatcher = new FileSystemWatcher(compDir, "*.json")
            {
                NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite | NotifyFilters.Size,
                EnableRaisingEvents = true,
                IncludeSubdirectories = false
            };

            void OnCompanionsChanged(object sender, FileSystemEventArgs e)
            {
                _companionsDebounceTimer?.Stop();
                _companionsDebounceTimer?.Dispose();
                _companionsDebounceTimer = new System.Timers.Timer(300);
                _companionsDebounceTimer.AutoReset = false;
                _companionsDebounceTimer.Elapsed += (_, _) =>
                {
                    Dispatcher.Invoke(() =>
                    {
                        var companions = _storage.GetAddonCompanions();
                        SendToFrontend("companions_updated", new { addon_companions = companions });
                    });
                };
                _companionsDebounceTimer.Start();
            }

            _companionsWatcher.Created += OnCompanionsChanged;
            _companionsWatcher.Changed += OnCompanionsChanged;
            _companionsWatcher.Deleted += OnCompanionsChanged;
            _companionsWatcher.Renamed += (s, e) => OnCompanionsChanged(s, e);
        }
        catch { }
    }

    private void OpenSettingsWindowOnPrimaryMonitor()
    {
        if (_webViewEnv == null) return;

        // While Settings is open, allow dragging individual widgets on the dashboard
        Win32WindowHelper.SetToolWindowAndClickThrough(_hwnd, clickThrough: false);
        SendToFrontend("settings_open_state", new { is_open = true });

        if (_settingsWindow != null && _settingsWindow.IsLoaded)
        {
            if (_settingsWindow.WindowState == WindowState.Minimized)
            {
                _settingsWindow.WindowState = WindowState.Normal;
            }
            _settingsWindow.Show();
            _settingsWindow.Activate();
            return;
        }

        _monitors = Win32WindowHelper.GetConnectedMonitors();
        var primaryMonitor = _monitors.FirstOrDefault(m => m.IsPrimary) ?? _monitors.First();

        _settingsWindow = new SettingsWindow(this, _webViewEnv, _wwwroot, primaryMonitor, _storage);
        _settingsWindow.Closed += (_, _) =>
        {
            _settingsWindow = null;
            // Lock dashboard back to 100% click-through wallpaper mode when Settings closes
            Win32WindowHelper.SetToolWindowAndClickThrough(_hwnd, clickThrough: true);
            ApplyWindowLayerState(_config.Window.LayerMode);
            SendToFrontend("settings_open_state", new { is_open = false });
        };
        _settingsWindow.Show();
        _settingsWindow.Activate();
    }

    public async void HandleWebMessage(string raw)
    {
        try
        {
            using JsonDocument doc = JsonDocument.Parse(raw);
            JsonElement root = doc.RootElement;
            if (!root.TryGetProperty("action", out JsonElement actionEl)) return;

            string action = actionEl.GetString() ?? "";
            switch (action)
            {
                case "init":
                {
                    _monitors = Win32WindowHelper.GetConnectedMonitors();
                    var vitals = _vitalsService.PollVitals();
                    string winWp = _storage.SyncWindowsDesktopWallpaper(_config.Modules.Slideshow.FolderPath) ?? "";
                    var fastPayload = new
                    {
                        config = _config,
                        settings_open = _settingsWindow != null && _settingsWindow.IsLoaded,
                        monitors = _monitors,
                        wallpapers = _storage.GetWallpaperUrls(_config.Modules.Slideshow.FolderPath),
                        windows_wallpaper_url = winWp,
                        notes = _storage.LoadNotes(),
                        events = _storage.LoadAllEvents(),
                        quotes = _storage.LoadQuotes(),
                        addon_companions = _storage.GetAddonCompanions(),
                        vitals
                    };
                    SendToFrontend("init_state", fastPayload);

                    // Seamless reveal: dashboard is rendered and ready with user settings
                    Dispatcher.Invoke(() =>
                    {
                        Opacity = 1;
                    });

                    _ = Task.Run(async () =>
                    {
                        var comms = await _commsService.PollCommsAsync();
                        Dispatcher.Invoke(() =>
                        {
                            SendToFrontend("comms_update", comms);
                        });
                    });
                    break;
                }

                case "close_settings":
                {
                    _settingsWindow?.Close();
                    break;
                }

                case "open_windows_notification_settings":
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo
                        {
                            FileName = "ms-settings:privacy-notifications",
                            UseShellExecute = true
                        });
                    }
                    catch
                    {
                        try
                        {
                            Process.Start(new ProcessStartInfo
                            {
                                FileName = "ms-settings:notifications",
                                UseShellExecute = true
                            });
                        }
                        catch
                        {
                        }
                    }
                    break;
                }

                case "save_config":
                {
                    if (root.TryGetProperty("config", out JsonElement cfgEl))
                    {
                        var updated = JsonSerializer.Deserialize<AmbientDeckConfig>(cfgEl.GetRawText(), JsonOptions);
                        if (updated != null)
                        {
                            if ((updated.Window.WidgetPositions == null || updated.Window.WidgetPositions.Count == 0) &&
                                _config.Window.WidgetPositions != null && _config.Window.WidgetPositions.Count > 0)
                            {
                                updated.Window.WidgetPositions = _config.Window.WidgetPositions;
                            }
                            _config = updated;
                            ApplyWindowLayerState(_config.Window.LayerMode);
                            _storage.SaveConfig(_config);
                            _vitalsTimer.Interval = TimeSpan.FromMilliseconds(Math.Max(500, _config.Modules.SystemVitals.RefreshMs));
                            UpdateWallpapersVirtualHostMapping();
                            string winWp = _storage.SyncWindowsDesktopWallpaper(_config.Modules.Slideshow.FolderPath) ?? "";
                            SendToFrontend("config_updated", new { config = _config });
                            SendToFrontend("wallpapers_updated", new
                            {
                                wallpapers = _storage.GetWallpaperUrls(_config.Modules.Slideshow.FolderPath),
                                windows_wallpaper_url = winWp
                            });
                        }
                    }
                    break;
                }

                case "set_layer_mode":
                {
                    if (root.TryGetProperty("layer_mode", out JsonElement layerEl))
                    {
                        SetLayerMode(layerEl.GetString() ?? "background");
                    }
                    break;
                }

                case "set_orientation_mode":
                {
                    string mode = root.GetProperty("orientation_mode").GetString() ?? "auto";
                    bool applyResize = root.TryGetProperty("apply_window_resize", out JsonElement resEl) && resEl.GetBoolean();
                    _config.Window.OrientationMode = mode;

                    if (applyResize)
                    {
                        var mon = _monitors.FirstOrDefault(m => m.Id == _config.Window.MonitorId) ?? _monitors.First();
                        if (mode == "portrait" && _config.Window.Width > _config.Window.Height)
                        {
                            int newW = Math.Min(720, mon.Width);
                            int newH = Math.Min(1200, mon.Height);
                            ResizeAndPositionWindow(newW, newH, centerOnMonitor: true);
                        }
                        else if (mode == "landscape" && _config.Window.Height > _config.Window.Width)
                        {
                            int newW = Math.Min(1440, mon.Width);
                            int newH = Math.Min(860, mon.Height);
                            ResizeAndPositionWindow(newW, newH, centerOnMonitor: true);
                        }
                    }

                    _storage.SaveConfig(_config);
                    SendToFrontend("config_updated", new { config = _config });
                    break;
                }

                case "set_window_size":
                {
                    int w = root.GetProperty("width").GetInt32();
                    int h = root.GetProperty("height").GetInt32();
                    bool center = !root.TryGetProperty("center_on_monitor", out JsonElement cEl) || cEl.GetBoolean();
                    ResizeAndPositionWindow(w, h, center);
                    break;
                }

                case "set_window_bounds":
                {
                    int x = root.GetProperty("x").GetInt32();
                    int y = root.GetProperty("y").GetInt32();
                    int w = Math.Max(440, root.GetProperty("width").GetInt32());
                    int h = Math.Max(380, root.GetProperty("height").GetInt32());

                    _config.Window.X = x;
                    _config.Window.Y = y;
                    _config.Window.Width = w;
                    _config.Window.Height = h;

                    Win32WindowHelper.MoveAndResizeWindow(_hwnd, x, y, w, h, _config.Window.LayerMode);
                    _storage.SaveConfig(_config);
                    SendToFrontend("config_updated", new { config = _config });
                    break;
                }

                case "set_window_scale_percent":
                {
                    int pct = Math.Clamp(root.GetProperty("percent").GetInt32(), 30, 100);
                    ScaleWindowToMonitorPercent(pct);
                    break;
                }

                case "set_autostart":
                {
                    if (root.TryGetProperty("autostart", out JsonElement autoEl))
                    {
                        SetAutostartMode(autoEl.GetBoolean());
                    }
                    break;
                }

                case "select_monitor":
                {
                    if (root.TryGetProperty("monitor_id", out JsonElement monEl))
                    {
                        SendWindowToMonitor(monEl.GetInt32());
                    }
                    break;
                }

                case "save_notes":
                {
                    if (root.TryGetProperty("content", out JsonElement contentEl))
                    {
                        string content = contentEl.GetString() ?? "";
                        _storage.SaveNotes(content, _config.Modules.Notes.FilePath);
                        SendToFrontend("notes_updated", new { notes = content });
                    }
                    break;
                }

                case "open_wallpapers_folder":
                {
                    string dir = _storage.ResolveWallpaperDirectory(_config.Modules.Slideshow.FolderPath);
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = dir,
                        UseShellExecute = true
                    });
                    break;
                }

                case "pick_wallpaper_file":
                {
                    using var dlg = new OpenFileDialog
                    {
                        Title = "Hintergrundbild für Dino_ambient_Deck auswählen",
                        Filter = "Bilder (*.jpg;*.jpeg;*.png;*.webp;*.svg;*.gif)|*.jpg;*.jpeg;*.png;*.webp;*.svg;*.gif",
                        Multiselect = true
                    };
                    if (dlg.ShowDialog() == System.Windows.Forms.DialogResult.OK)
                    {
                        string targetDir = _storage.ResolveWallpaperDirectory(_config.Modules.Slideshow.FolderPath);
                        Directory.CreateDirectory(targetDir);
                        foreach (string srcFile in dlg.FileNames)
                        {
                            try
                            {
                                string dest = Path.Combine(targetDir, Path.GetFileName(srcFile));
                                File.Copy(srcFile, dest, overwrite: true);
                            }
                            catch
                            {
                            }
                        }
                        _config.Modules.Slideshow.UseWindowsWallpaper = false;
                        _storage.SaveConfig(_config);
                        UpdateWallpapersVirtualHostMapping();
                        string winWp = _storage.SyncWindowsDesktopWallpaper(_config.Modules.Slideshow.FolderPath) ?? "";
                        SendToFrontend("config_updated", new { config = _config });
                        SendToFrontend("wallpapers_updated", new
                        {
                            wallpapers = _storage.GetWallpaperUrls(_config.Modules.Slideshow.FolderPath),
                            windows_wallpaper_url = winWp
                        });
                    }
                    break;
                }

                case "add_event":
                {
                    string title = root.GetProperty("title").GetString() ?? "Termin";
                    string startIso = root.GetProperty("start_iso").GetString() ?? DateTime.Now.AddHours(1).ToString("s");
                    var updatedEvents = _storage.AddJsonEvent(title, startIso);
                    SendToFrontend("events_updated", new { events = updatedEvents });
                    break;
                }

                case "save_manual_events":
                {
                    if (root.TryGetProperty("events", out JsonElement evsEl))
                    {
                        var manualList = JsonSerializer.Deserialize<List<CalendarEvent>>(evsEl.GetRawText(), JsonOptions) ?? new List<CalendarEvent>();
                        var updatedEvents = _storage.SaveManualEvents(manualList);
                        SendToFrontend("events_updated", new { events = updatedEvents });
                    }
                    break;
                }

                case "open_companions_folder":
                {
                    string dir = _storage.ResolveCompanionsDirectory();
                    Directory.CreateDirectory(dir);
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = dir,
                        UseShellExecute = true
                    });
                    break;
                }

                case "open_companion_editor":
                {
                    try
                    {
                        string? editorPath = _storage.ResolveCompanionEditorPath();
                        if (!string.IsNullOrEmpty(editorPath) && File.Exists(editorPath))
                        {
                            string editorDir = Path.GetDirectoryName(editorPath)!;
                            string jsContent = "window.__COMPANION_IMPORT_DATA__ = null;\n";

                            if (root.TryGetProperty("companion", out var pComp) && pComp.ValueKind == JsonValueKind.Object)
                            {
                                string compJson = pComp.GetRawText();
                                jsContent = $"window.__COMPANION_IMPORT_DATA__ = {compJson};\n";
                            }

                            // Write active_edit.js to both the runtime editor dir and AppData editor dir
                            try
                            {
                                File.WriteAllText(Path.Combine(editorDir, "active_edit.js"), jsContent);
                            }
                            catch { }

                            try
                            {
                                string appDataEditorDir = Path.Combine(_storage.AppDataFolder, "companion-editor");
                                if (Directory.Exists(appDataEditorDir))
                                {
                                    File.WriteAllText(Path.Combine(appDataEditorDir, "active_edit.js"), jsContent);
                                }
                            }
                            catch { }

                            string abs = Path.GetFullPath(editorPath);
                            try
                            {
                                Process.Start(new ProcessStartInfo
                                {
                                    FileName = abs,
                                    UseShellExecute = true
                                });
                            }
                            catch
                            {
                                Process.Start(new ProcessStartInfo
                                {
                                    FileName = "cmd.exe",
                                    Arguments = $"/c start \"\" \"{abs}\"",
                                    CreateNoWindow = true,
                                    UseShellExecute = false
                                });
                            }
                        }
                    }
                    catch { }
                    break;
                }

                case "import_companion_file":
                {
                    using var dlg = new OpenFileDialog
                    {
                        Title = "Begleiter-Addon (.companion.json) importieren",
                        Filter = "Begleiter Addons (*.companion.json;*.json)|*.companion.json;*.json|Alle Dateien (*.*)|*.*",
                        Multiselect = true
                    };
                    if (dlg.ShowDialog() == System.Windows.Forms.DialogResult.OK)
                    {
                        string targetDir = _storage.ResolveCompanionsDirectory();
                        Directory.CreateDirectory(targetDir);
                        foreach (string srcFile in dlg.FileNames)
                        {
                            try
                            {
                                string dest = Path.Combine(targetDir, Path.GetFileName(srcFile));
                                File.Copy(srcFile, dest, overwrite: true);
                            }
                            catch { }
                        }
                        var updatedCompanions = _storage.GetAddonCompanions();
                        SendToFrontend("companions_updated", new { addon_companions = updatedCompanions });
                    }
                    break;
                }

                case "refresh_companions":
                {
                    var updatedCompanions = _storage.GetAddonCompanions();
                    SendToFrontend("companions_updated", new { addon_companions = updatedCompanions });
                    break;
                }
            }
        }
        catch
        {
        }
    }

    private void SendToFrontend(string type, object payload)
    {
        try
        {
            string json = JsonSerializer.Serialize(new { type, payload }, JsonOptions);
            if (_webViewReady && DashboardWebView.CoreWebView2 != null)
            {
                DashboardWebView.CoreWebView2.PostWebMessageAsJson(json);
            }
            _settingsWindow?.PostJsonMessage(json);
        }
        catch
        {
        }
    }

    private void OnWindowBoundsChanged(object? sender, EventArgs e)
    {
        if (_isInitializingWindow) return;
        _boundsDebounceTimer.Stop();
        _boundsDebounceTimer.Start();
    }

    private void SaveCurrentWindowBounds()
    {
        if (_hwnd == IntPtr.Zero) return;
        if (Win32WindowHelper.GetWindowRect(_hwnd, out Win32WindowHelper.RECT rect))
        {
            int x = rect.Left;
            int y = rect.Top;
            int w = rect.Right - rect.Left;
            int h = rect.Bottom - rect.Top;

            if (w >= 400 && h >= 300)
            {
                _config.Window.X = x;
                _config.Window.Y = y;
                _config.Window.Width = w;
                _config.Window.Height = h;

                int cx = x + w / 2;
                int cy = y + h / 2;
                var match = _monitors.FirstOrDefault(m =>
                    cx >= m.X && cx < m.X + m.Width && cy >= m.Y && cy < m.Y + m.Height);
                if (match != null)
                {
                    _config.Window.MonitorId = match.Id;
                }

                _storage.SaveConfig(_config);
                SendToFrontend("config_updated", new { config = _config });
            }
        }
    }

    private void ResizeAndPositionWindow(int width, int height, bool centerOnMonitor)
    {
        _monitors = Win32WindowHelper.GetConnectedMonitors();
        var mon = _monitors.FirstOrDefault(m => m.Id == _config.Window.MonitorId) ?? _monitors.First();

        int w = Math.Clamp(width, 440, mon.Width);
        int h = Math.Clamp(height, 380, mon.Height);
        int x = _config.Window.X;
        int y = _config.Window.Y;

        if (centerOnMonitor)
        {
            x = mon.X + (mon.Width - w) / 2;
            y = mon.Y + (mon.Height - h) / 2;
        }

        _config.Window.X = x;
        _config.Window.Y = y;
        _config.Window.Width = w;
        _config.Window.Height = h;

        Win32WindowHelper.MoveAndResizeWindow(_hwnd, x, y, w, h, _config.Window.LayerMode);
        _storage.SaveConfig(_config);
        SendToFrontend("config_updated", new { config = _config });
    }

    private void ScaleWindowToMonitorPercent(int percent)
    {
        _monitors = Win32WindowHelper.GetConnectedMonitors();
        var mon = _monitors.FirstOrDefault(m => m.Id == _config.Window.MonitorId) ?? _monitors.First();

        int w = Math.Max(440, (int)Math.Round(mon.Width * (percent / 100.0)));
        int h = Math.Max(380, (int)Math.Round(mon.Height * (percent / 100.0)));
        ResizeAndPositionWindow(w, h, centerOnMonitor: true);
    }

    private void SetLayerMode(string layerMode)
    {
        ApplyWindowLayerState(layerMode);
        _storage.SaveConfig(_config);
        SendToFrontend("config_updated", new { config = _config });
    }

    private void SetAutostartMode(bool autostart)
    {
        _config.Window.Autostart = autostart;
        _storage.SetWindowsAutostart(autostart);
        _storage.SaveConfig(_config);
        SendToFrontend("config_updated", new { config = _config });
    }

    private void SendWindowToMonitor(int monitorId)
    {
        _monitors = Win32WindowHelper.GetConnectedMonitors();
        var target = _monitors.FirstOrDefault(m => m.Id == monitorId) ?? _monitors.First();

        _config.Window.MonitorId = target.Id;
        _config.Window.X = target.X;
        _config.Window.Y = target.Y;
        _config.Window.Width = target.Width;
        _config.Window.Height = target.Height;

        Win32WindowHelper.MoveAndResizeWindow(
            _hwnd,
            target.X,
            target.Y,
            target.Width,
            target.Height,
            _config.Window.LayerMode
        );

        _storage.SaveConfig(_config);
        SendToFrontend("config_updated", new { config = _config });
    }

    private void InitializeSystemTray()
    {
        // Dropdown menu with ONLY "Einstellungen" and "Beenden" as requested
        var menu = new ContextMenuStrip();

        var settingsItem = new ToolStripMenuItem("Einstellungen")
        {
            Font = new Font(menu.Font, System.Drawing.FontStyle.Bold)
        };
        settingsItem.Click += (_, _) => OpenSettingsWindowOnPrimaryMonitor();
        menu.Items.Add(settingsItem);

        menu.Items.Add(new ToolStripSeparator());

        var quitItem = new ToolStripMenuItem("Beenden");
        quitItem.Click += (_, _) =>
        {
            if (_trayIcon != null) _trayIcon.Visible = false;
            _settingsWindow?.Close();
            System.Windows.Application.Current.Shutdown();
        };
        menu.Items.Add(quitItem);

        _trayIcon = new NotifyIcon
        {
            Text = "Dino_ambient_Deck — Klick für Einstellungen",
            Icon = CreateCustomTrayIcon(),
            ContextMenuStrip = menu,
            Visible = true
        };

        _trayIcon.MouseClick += (_, args) =>
        {
            if (args.Button == MouseButtons.Left)
            {
                OpenSettingsWindowOnPrimaryMonitor();
            }
        };
        _trayIcon.DoubleClick += (_, _) => OpenSettingsWindowOnPrimaryMonitor();
    }

    private static System.Drawing.Icon CreateCustomTrayIcon()
    {
        try
        {
            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app_icon.ico");
            if (File.Exists(iconPath))
            {
                return new System.Drawing.Icon(iconPath, new System.Drawing.Size(32, 32));
            }
        }
        catch
        {
        }

        using var bmp = new Bitmap(32, 32);
        using var g = Graphics.FromImage(bmp);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.Clear(Color.Transparent);

        using var bgBrush = new SolidBrush(Color.FromArgb(240, 18, 22, 34));
        g.FillEllipse(bgBrush, 1, 1, 30, 30);

        using var borderPen = new Pen(Color.FromArgb(255, 56, 189, 248), 2f);
        g.DrawEllipse(borderPen, 2, 2, 28, 28);

        using var shellBrush = new SolidBrush(Color.FromArgb(255, 52, 211, 153));
        g.FillPie(shellBrush, 7, 10, 18, 16, 180, 180);

        using var spikeBrush = new SolidBrush(Color.FromArgb(255, 251, 191, 36));
        g.FillRectangle(spikeBrush, 11, 8, 3, 3);
        g.FillRectangle(spikeBrush, 16, 7, 3, 3);
        g.FillRectangle(spikeBrush, 21, 9, 3, 3);

        IntPtr hIcon = bmp.GetHicon();
        return System.Drawing.Icon.FromHandle(hIcon);
    }

    private void OnWindowClosed(object? sender, EventArgs e)
    {
        _vitalsTimer.Stop();
        _mediaTimer.Stop();
        _commsTimer.Stop();
        _settingsWindow?.Close();
        if (_trayIcon != null)
        {
            _trayIcon.Visible = false;
            _trayIcon.Dispose();
        }
    }
}
