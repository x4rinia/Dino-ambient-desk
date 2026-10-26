using System.Threading;
using System.Windows;

namespace AmbientDeck;

public partial class App : System.Windows.Application
{
    private static Mutex? _mutex;

    protected override void OnStartup(StartupEventArgs e)
    {
        const string appName = "Global\\DinoAmbientDeck_SingleInstance_Mutex";
        _mutex = new Mutex(true, appName, out bool createdNew);

        if (!createdNew)
        {
            // Another instance is already running! Gracefully exit second instance.
            Shutdown();
            return;
        }

        base.OnStartup(e);
    }

    protected override void OnExit(ExitEventArgs e)
    {
        try
        {
            _mutex?.ReleaseMutex();
        }
        catch { }
        _mutex?.Dispose();
        base.OnExit(e);
    }
}

