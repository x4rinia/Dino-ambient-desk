using System.Diagnostics;
using AmbientDeck.Models;
using Windows.UI.Notifications;
using Windows.UI.Notifications.Management;

namespace AmbientDeck.Services;

public class CommsNotificationService
{
    private UserNotificationListener? _listener;
    private bool _listenerChecked;
    private bool _listenerPermitted;

    private readonly HashSet<uint> _dismissedIds = new();
    private readonly List<CommsNotificationItem> _cachedItems = new();

    private async Task EnsureListenerAsync()
    {
        if (_listenerChecked) return;
        _listenerChecked = true;
        try
        {
            _listener = UserNotificationListener.Current;
            var access = await _listener.RequestAccessAsync();
            _listenerPermitted = access == UserNotificationListenerAccessStatus.Allowed;
        }
        catch
        {
            _listenerPermitted = false;
        }
    }

    public async Task<CommsStatusData> PollCommsAsync()
    {
        await EnsureListenerAsync();

        bool whatsappRunning = false;
        try
        {
            var procs = Process.GetProcesses();
            foreach (var p in procs)
            {
                try
                {
                    if (p.ProcessName.Contains("WhatsApp", StringComparison.OrdinalIgnoreCase))
                    {
                        whatsappRunning = true;
                        break;
                    }
                }
                catch
                {
                }
                finally
                {
                    p.Dispose();
                }
            }
        }
        catch
        {
        }

        int waUnread = 0;
        int mailUnread = 0;
        var items = new List<CommsNotificationItem>();

        if (_listenerPermitted && _listener != null)
        {
            try
            {
                var notifs = await _listener.GetNotificationsAsync(NotificationKinds.Toast);
                foreach (var n in notifs.OrderByDescending(x => x.CreationTime))
                {
                    if (_dismissedIds.Contains(n.Id)) continue;

                    string appName = "";
                    try
                    {
                        appName = n.AppInfo?.DisplayInfo?.DisplayName ?? "";
                    }
                    catch
                    {
                    }

                    var binding = n.Notification?.Visual?.GetBinding(KnownNotificationBindings.ToastGeneric);
                    if (binding == null) continue;

                    var texts = binding.GetTextElements().Select(t => t.Text).Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
                    if (texts.Count == 0) continue;

                    string title = texts[0];
                    string body = texts.Count > 1 ? string.Join(" — ", texts.Skip(1)) : "";

                    bool isWa = appName.Contains("WhatsApp", StringComparison.OrdinalIgnoreCase) ||
                                title.Contains("WhatsApp", StringComparison.OrdinalIgnoreCase);

                    bool isMail = appName.Contains("Outlook", StringComparison.OrdinalIgnoreCase) ||
                                  appName.Contains("Mail", StringComparison.OrdinalIgnoreCase) ||
                                  appName.Contains("Thunderbird", StringComparison.OrdinalIgnoreCase) ||
                                  title.Contains("Gmail", StringComparison.OrdinalIgnoreCase);

                    if (isWa)
                    {
                        waUnread++;
                        items.Add(new CommsNotificationItem
                        {
                            Id = n.Id.ToString(),
                            App = "whatsapp",
                            Sender = title,
                            Preview = string.IsNullOrEmpty(body) ? "Neue WhatsApp Nachricht" : body,
                            Timestamp = n.CreationTime.ToLocalTime().ToString("HH:mm")
                        });
                    }
                    else if (isMail)
                    {
                        mailUnread++;
                        items.Add(new CommsNotificationItem
                        {
                            Id = n.Id.ToString(),
                            App = "email",
                            Sender = title,
                            Preview = string.IsNullOrEmpty(body) ? "Neue E-Mail" : body,
                            Timestamp = n.CreationTime.ToLocalTime().ToString("HH:mm")
                        });
                    }
                }
            }
            catch
            {
            }
        }

        foreach (var c in _cachedItems)
        {
            if (c.App == "whatsapp") waUnread++;
            else mailUnread++;
            items.Add(c);
        }

        return new CommsStatusData
        {
            ListenerPermitted = _listenerPermitted,
            WhatsappRunning = whatsappRunning,
            WhatsappUnread = waUnread,
            EmailUnread = mailUnread,
            RecentItems = items.Take(5).ToList()
        };
    }

    public async Task ClearNotificationsAsync()
    {
        _cachedItems.Clear();
        if (_listenerPermitted && _listener != null)
        {
            try
            {
                var notifs = await _listener.GetNotificationsAsync(NotificationKinds.Toast);
                foreach (var n in notifs)
                {
                    _dismissedIds.Add(n.Id);
                }
            }
            catch
            {
            }
        }
    }

    public void OpenWhatsApp()
    {
        try
        {
            // Try launching installed WhatsApp Desktop protocol first
            Process.Start(new ProcessStartInfo
            {
                FileName = "whatsapp://",
                UseShellExecute = true
            });
        }
        catch
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "https://web.whatsapp.com",
                    UseShellExecute = true
                });
            }
            catch
            {
            }
        }
    }

    public void OpenEmail(string? emailUrl)
    {
        string target = string.IsNullOrWhiteSpace(emailUrl) ? "https://mail.google.com" : emailUrl.Trim();
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = target,
                UseShellExecute = true
            });
        }
        catch
        {
        }
    }
}

