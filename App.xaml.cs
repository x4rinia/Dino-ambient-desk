using System.Diagnostics;
using System.Linq;
using System.Windows;

namespace AmbientDeck;

public partial class App : System.Windows.Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
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

