using System.IO;
using System.Runtime.InteropServices;
using AmbientDeck.Models;
using Windows.Media.Control;
using Windows.Storage.Streams;

namespace AmbientDeck.Services;

public class MediaSessionService
{
    private GlobalSystemMediaTransportControlsSessionManager? _sessionManager;
    private bool _initializing;

    private const byte VK_MEDIA_NEXT_TRACK = 0xB0;
    private const byte VK_MEDIA_PREV_TRACK = 0xB1;
    private const byte VK_MEDIA_PLAY_PAUSE = 0xB3;
    private const uint KEYEVENTF_EXTENDEDKEY = 0x0001;
    private const uint KEYEVENTF_KEYUP = 0x0002;

    [DllImport("user32.dll")]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    private async Task EnsureManagerAsync()
    {
        if (_sessionManager != null || _initializing) return;
        _initializing = true;
        try
        {
            _sessionManager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        }
        catch
        {
            _sessionManager = null;
        }
        finally
        {
            _initializing = false;
        }
    }

    public async Task<MediaSessionData> GetCurrentMediaAsync()
    {
        await EnsureManagerAsync();
        if (_sessionManager == null)
        {
            return new MediaSessionData { HasSession = false };
        }

        try
        {
            var session = _sessionManager.GetCurrentSession();
            if (session == null)
            {
                return new MediaSessionData { HasSession = false };
            }

            var props = await session.TryGetMediaPropertiesAsync();
            var playback = session.GetPlaybackInfo();
            bool isPlaying = playback?.PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing;

            string? thumbBase64 = null;
            if (props?.Thumbnail != null)
            {
                try
                {
                    using IRandomAccessStreamWithContentType stream = await props.Thumbnail.OpenReadAsync();
                    using var netStream = stream.AsStreamForRead();
                    using var ms = new MemoryStream();
                    await netStream.CopyToAsync(ms);
                    byte[] bytes = ms.ToArray();
                    if (bytes.Length > 0)
                    {
                        thumbBase64 = Convert.ToBase64String(bytes);
                    }
                }
                catch
                {
                }
            }

            return new MediaSessionData
            {
                HasSession = true,
                Title = props?.Title ?? "Unknown Track",
                Artist = props?.Artist ?? "",
                Album = props?.AlbumTitle ?? "",
                IsPlaying = isPlaying,
                ThumbnailBase64 = thumbBase64
            };
        }
        catch
        {
            return new MediaSessionData { HasSession = false };
        }
    }

    public async Task ExecuteControlAsync(string command)
    {
        await EnsureManagerAsync();
        var session = _sessionManager?.GetCurrentSession();

        try
        {
            if (session != null)
            {
                switch (command)
                {
                    case "play_pause":
                        await session.TryTogglePlayPauseAsync();
                        return;
                    case "next":
                        await session.TrySkipNextAsync();
                        return;
                    case "previous":
                        await session.TrySkipPreviousAsync();
                        return;
                }
            }
        }
        catch
        {
        }

        // Hardware media key fallback if no explicit GSMTC session handled it
        byte vk = command switch
        {
            "next" => VK_MEDIA_NEXT_TRACK,
            "previous" => VK_MEDIA_PREV_TRACK,
            _ => VK_MEDIA_PLAY_PAUSE
        };
        keybd_event(vk, 0, KEYEVENTF_EXTENDEDKEY, UIntPtr.Zero);
        keybd_event(vk, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, UIntPtr.Zero);
    }
}

