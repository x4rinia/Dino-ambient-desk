using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace AmbientDeck;

public partial class App : System.Windows.Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        // Global safety net: prevent unhandled dispatcher errors or task faults from crashing the deck
        AppDomain.CurrentDomain.UnhandledException += (s, args) =>
        {
            try
            {
                File.AppendAllText(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "crash.log"),
                    $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] AppDomain Exception: {args.ExceptionObject}\n"
                );
            }
            catch { }
        };

        DispatcherUnhandledException += (s, args) =>
        {
            try
            {
                File.AppendAllText(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "crash.log"),
                    $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Dispatcher Exception: {args.Exception}\n"
                );
            }
            catch { }
            args.Handled = true; // Never crash the application on UI thread dispatcher errors
        };

        TaskScheduler.UnobservedTaskException += (s, args) =>
        {
            try
            {
                File.AppendAllText(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "crash.log"),
                    $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Task Exception: {args.Exception}\n"
                );
            }
            catch { }
            args.SetObserved();
        };

        // When user launches the app, terminate any orphaned background instances so it always opens cleanly
        try
        {
            var current = Process.GetCurrentProcess();
            var others = Process.GetProcessesByName(current.ProcessName)
                .Where(p => p.Id != current.Id)
                .ToList();

            foreach (var other in others)
            {
                try
                {
                    other.Kill();
                    other.WaitForExit(1000);
                }
                catch
                {
                }
            }
        }
        catch
        {
        }

        base.OnStartup(e);
    }
}

