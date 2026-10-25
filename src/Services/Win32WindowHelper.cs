using System.Runtime.InteropServices;
using AmbientDeck.Models;

namespace AmbientDeck.Services;

public static class Win32WindowHelper
{
    public static readonly IntPtr HWND_BOTTOM = new(1);
    public static readonly IntPtr HWND_TOP = new(0);
    public static readonly IntPtr HWND_TOPMOST = new(-1);
    public static readonly IntPtr HWND_NOTOPMOST = new(-2);

    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOZORDER = 0x0004;
    public const uint SWP_NOACTIVATE = 0x0010;
    public const uint SWP_FRAMECHANGED = 0x0020;
    public const uint SWP_SHOWWINDOW = 0x0040;

    public const int GWL_EXSTYLE = -20;
    public const int WS_EX_TRANSPARENT = 0x00000020;
    public const int WS_EX_TOOLWINDOW = 0x00000080;
    public const int WS_EX_APPWINDOW = 0x00040000;
    public const int WS_EX_LAYERED = 0x00080000;
    public const int WS_EX_NOACTIVATE = 0x08000000;

    public const int WM_NCLBUTTONDOWN = 0x00A1;
    public const int HTCAPTION = 2;
    public const int HTLEFT = 10;
    public const int HTRIGHT = 11;
    public const int HTTOP = 12;
    public const int HTTOPLEFT = 13;
    public const int HTTOPRIGHT = 14;
    public const int HTBOTTOM = 15;
    public const int HTBOTTOMLEFT = 16;
    public const int HTBOTTOMRIGHT = 17;

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private struct MONITORINFOEX
    {
        public int cbSize;
        public RECT rcMonitor;
        public RECT rcWork;
        public uint dwFlags;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string szDevice;
    }

    private delegate bool MonitorEnumProc(
        IntPtr hMonitor,
        IntPtr hdcMonitor,
        ref RECT lprcMonitor,
        IntPtr dwData
    );

    [DllImport("user32.dll")]
    private static extern bool EnumDisplayMonitors(
        IntPtr hdc,
        IntPtr lprcClip,
        MonitorEnumProc lpfnEnum,
        IntPtr dwData
    );

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    private static extern bool GetMonitorInfo(IntPtr hMonitor, ref MONITORINFOEX lpmi);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetWindowPos(
        IntPtr hWnd,
        IntPtr hWndInsertAfter,
        int X,
        int Y,
        int cx,
        int cy,
        uint uFlags
    );

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll")]
    public static extern bool ReleaseCapture();

    [DllImport("user32.dll")]
    public static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);

    public static void SetToolWindowAndClickThrough(IntPtr hwnd, bool clickThrough)
    {
        if (hwnd == IntPtr.Zero) return;
        int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);

        // Always hide from Taskbar & Alt+Tab (ToolWindow)
        exStyle |= WS_EX_TOOLWINDOW;
        exStyle &= ~WS_EX_APPWINDOW;

        if (clickThrough)
        {
            exStyle |= WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_NOACTIVATE;
        }
        else
        {
            exStyle &= ~(WS_EX_TRANSPARENT | WS_EX_NOACTIVATE);
        }

        SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);
        SetWindowPos(
            hwnd,
            IntPtr.Zero,
            0,
            0,
            0,
            0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED
        );
    }

    public static List<MonitorInfo> GetConnectedMonitors()
    {
        var list = new List<MonitorInfo>();
        int idx = 1;

        EnumDisplayMonitors(
            IntPtr.Zero,
            IntPtr.Zero,
            (IntPtr hMonitor, IntPtr hdcMonitor, ref RECT lprcMonitor, IntPtr dwData) =>
            {
                var mi = new MONITORINFOEX();
                mi.cbSize = Marshal.SizeOf(typeof(MONITORINFOEX));
                if (GetMonitorInfo(hMonitor, ref mi))
                {
                    int w = mi.rcMonitor.Right - mi.rcMonitor.Left;
                    int h = mi.rcMonitor.Bottom - mi.rcMonitor.Top;
                    int x = mi.rcMonitor.Left;
                    int y = mi.rcMonitor.Top;
                    bool isPrimary = (mi.dwFlags & 1) != 0;

                    list.Add(
                        new MonitorInfo
                        {
                            Id = idx,
                            Name = mi.szDevice?.Trim('\0') ?? $"DISPLAY{idx}",
                            Label = $"Display {idx}: {w}x{h} @ ({x}, {y}){(isPrimary ? " [Primary]" : "")}",
                            X = x,
                            Y = y,
                            Width = w,
                            Height = h,
                            IsPrimary = isPrimary
                        }
                    );
                    idx++;
                }
                return true;
            },
            IntPtr.Zero
        );

        if (list.Count == 0)
        {
            list.Add(
                new MonitorInfo
                {
                    Id = 1,
                    Name = "DISPLAY1",
                    Label = "Display 1: 1920x1080 @ (0, 0)",
                    X = 0,
                    Y = 0,
                    Width = 1920,
                    Height = 1080,
                    IsPrimary = true
                }
            );
        }

        return list;
    }

    public static void SendToBottom(IntPtr hwnd)
    {
        if (hwnd == IntPtr.Zero) return;
        SetWindowPos(hwnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
    }

    public static void ApplyLayerMode(IntPtr hwnd, string layerMode)
    {
        if (hwnd == IntPtr.Zero) return;
        IntPtr targetZ = layerMode switch
        {
            "foreground" => HWND_TOPMOST,
            "background" => HWND_BOTTOM,
            _ => HWND_NOTOPMOST
        };
        uint flags = SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE;
        SetWindowPos(hwnd, targetZ, 0, 0, 0, 0, flags);
    }

    public static void MoveAndResizeWindow(IntPtr hwnd, int x, int y, int width, int height, string layerMode)
    {
        if (hwnd == IntPtr.Zero) return;
        IntPtr zOrder = layerMode switch
        {
            "foreground" => HWND_TOPMOST,
            "background" => HWND_BOTTOM,
            _ => HWND_NOTOPMOST
        };
        SetWindowPos(
            hwnd,
            zOrder,
            x,
            y,
            Math.Max(440, width),
            Math.Max(380, height),
            SWP_NOACTIVATE | SWP_SHOWWINDOW
        );
    }

    public static void StartDrag(IntPtr hwnd)
    {
        if (hwnd == IntPtr.Zero) return;
        ReleaseCapture();
        SendMessage(hwnd, WM_NCLBUTTONDOWN, new IntPtr(HTCAPTION), IntPtr.Zero);
    }

    public static void StartResize(IntPtr hwnd, string direction)
    {
        if (hwnd == IntPtr.Zero) return;
        int ht = direction.ToLowerInvariant() switch
        {
            "n" => HTTOP,
            "s" => HTBOTTOM,
            "e" => HTRIGHT,
            "w" => HTLEFT,
            "nw" => HTTOPLEFT,
            "ne" => HTTOPRIGHT,
            "sw" => HTBOTTOMLEFT,
            "se" => HTBOTTOMRIGHT,
            _ => HTBOTTOMRIGHT
        };
        ReleaseCapture();
        SendMessage(hwnd, WM_NCLBUTTONDOWN, new IntPtr(ht), IntPtr.Zero);
    }
}
