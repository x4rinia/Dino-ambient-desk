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
    public bool IsWebViewReady { get; private set; }

    public SettingsWindow(
        MainWindow mainWindow,
        CoreWebView2Environment env,
        string wwwroot,
        MonitorInfo primaryMonitor
    )
    {
        _mainWindow = mainWindow;
        _env = env;
        _wwwroot = wwwroot;

        InitializeComponent();
        ShowInTaskbar = true;
        SettingsWebView.DefaultBackgroundColor = Color.FromArgb(255, 13, 16, 24);

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
        if (!IsWebViewReady || SettingsWebView.CoreWebView2 == null) return;
        try
        {
            SettingsWebView.CoreWebView2.PostWebMessageAsJson(json);
        }
        catch
        {
        }
    }
}

