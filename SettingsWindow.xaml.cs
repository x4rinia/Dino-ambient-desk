using System.Drawing;
using System.Windows;
using AmbientDeck.Models;
using Microsoft.Web.WebView2.Core;

namespace AmbientDeck;

public partial class SettingsWindow : Window
{
    private readonly MainWindow _mainWindow;
    private readonly CoreWebView2Environment _env;
    private readonly string _wwwroot;
    private readonly AmbientDeck.Services.StorageService? _storage;
    public bool IsWebViewReady { get; private set; }

    public SettingsWindow(
        MainWindow mainWindow,
        CoreWebView2Environment env,
        string wwwroot,
        MonitorInfo primaryMonitor,
        AmbientDeck.Services.StorageService? storage = null
    )
    {
        _mainWindow = mainWindow;
        _env = env;
        _wwwroot = wwwroot;
        _storage = storage;

        InitializeComponent();
        ShowInTaskbar = true;
        SettingsWebView.DefaultBackgroundColor = Color.FromArgb(255, 13, 16, 24);

        try
        {
            string iconPath = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app_icon.ico");
            if (System.IO.File.Exists(iconPath))
            {
                Icon = System.Windows.Media.Imaging.BitmapFrame.Create(new Uri(iconPath));
            }
        }
        catch
        {
        }

        // Position centered on the Primary Monitor (Hauptmonitor)
        WindowStartupLocation = WindowStartupLocation.Manual;
        double w = Width;
        double h = Height;
        Left = primaryMonitor.X + Math.Max(20, (primaryMonitor.Width - w) / 2);
        Top = primaryMonitor.Y + Math.Max(20, (primaryMonitor.Height - h) / 2);

        Loaded += OnLoaded;
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        try
        {
            await SettingsWebView.EnsureCoreWebView2Async(_env);
            var core = SettingsWebView.CoreWebView2;
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.IsStatusBarEnabled = false;

            core.SetVirtualHostNameToFolderMapping(
                "ambientdeck.local",
                _wwwroot,
                CoreWebView2HostResourceAccessKind.Allow
            );

            if (_storage != null)
            {
                string? addonDir = _storage.ResolveAddonSpritesDirectory();
                if (!string.IsNullOrEmpty(addonDir) && System.IO.Directory.Exists(addonDir))
                {
                    try
                    {
                        core.SetVirtualHostNameToFolderMapping(
                            "addons.ambientdeck.local",
                            addonDir,
                            CoreWebView2HostResourceAccessKind.Allow
                        );
                    }
                    catch { }
                }

                try
                {
                    var initialPayload = new
                    {
                        config = _mainWindow.CurrentConfig,
                        addon_companions = _storage.GetAddonCompanions(),
                        monitors = _mainWindow.ConnectedMonitors,
                        notes = _storage.LoadNotes(),
                        events = _storage.LoadAllEvents(),
                        quotes = _storage.LoadQuotes()
                    };
                    string initJson = System.Text.Json.JsonSerializer.Serialize(initialPayload);
                    await core.AddScriptToExecuteOnDocumentCreatedAsync($"window.__INITIAL_DATA__ = {initJson};");
                }
                catch { }
            }

            core.WebMessageReceived += (_, args) =>
            {
                _mainWindow.HandleWebMessage(args.TryGetWebMessageAsString());
            };

            core.Navigate("https://ambientdeck.local/index.html?view=settings");
            IsWebViewReady = true;
        }
        catch
        {
        }
    }

    public void PostJsonMessage(string json)
    {
        if (SettingsWebView.CoreWebView2 == null) return;
        try
        {
            SettingsWebView.CoreWebView2.PostWebMessageAsJson(json);
        }
        catch
        {
        }
    }
}

