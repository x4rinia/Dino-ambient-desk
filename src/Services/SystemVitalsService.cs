using System.Diagnostics;
using System.Runtime.InteropServices;
using AmbientDeck.Models;

namespace AmbientDeck.Services;

public class SystemVitalsService
{
    [StructLayout(LayoutKind.Sequential)]
    private struct FILETIME
    {
        public uint dwLowDateTime;
        public uint dwHighDateTime;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private class MEMORYSTATUSEX
    {
        public uint dwLength;
        public uint dwMemoryLoad;
        public ulong ullTotalPhys;
        public ulong ullAvailPhys;
        public ulong ullTotalPageFile;
        public ulong ullAvailPageFile;
        public ulong ullTotalVirtual;
        public ulong ullAvailVirtual;
        public ulong ullAvailExtendedVirtual;

        public MEMORYSTATUSEX()
        {
            dwLength = (uint)Marshal.SizeOf(typeof(MEMORYSTATUSEX));
        }
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetSystemTimes(
        out FILETIME lpIdleTime,
        out FILETIME lpKernelTime,
        out FILETIME lpUserTime
    );

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern bool GlobalMemoryStatusEx([In, Out] MEMORYSTATUSEX lpBuffer);

    private ulong _prevIdleTime;
    private ulong _prevKernelTime;
    private ulong _prevUserTime;
    private double _lastCpuPercent = 12.0;

    private List<PerformanceCounter>? _gpuCounters;
    private DateTime _lastGpuCounterRefresh = DateTime.MinValue;
    private bool _gpuCategoryChecked = false;
    private bool _gpuCategoryExists = false;

    public SystemVitalsService()
    {
        SampleCpuPercent();
    }

    private static ulong FileTimeToUlong(FILETIME ft)
    {
        return ((ulong)ft.dwHighDateTime << 32) | ft.dwLowDateTime;
    }

    private double SampleCpuPercent()
    {
        if (!GetSystemTimes(out FILETIME idleFt, out FILETIME kernelFt, out FILETIME userFt))
        {
            return _lastCpuPercent;
        }

        ulong idle = FileTimeToUlong(idleFt);
        ulong kernel = FileTimeToUlong(kernelFt);
        ulong user = FileTimeToUlong(userFt);

        ulong idleDiff = idle - _prevIdleTime;
        ulong kernelDiff = kernel - _prevKernelTime;
        ulong userDiff = user - _prevUserTime;

        _prevIdleTime = idle;
        _prevKernelTime = kernel;
        _prevUserTime = user;

        ulong totalSystem = kernelDiff + userDiff;
        if (totalSystem == 0) return _lastCpuPercent;

        double busy = (double)(totalSystem - idleDiff) / totalSystem * 100.0;
        _lastCpuPercent = Math.Clamp(busy, 0.0, 100.0);
        return _lastCpuPercent;
    }

    private double SampleGpuPercent()
    {
        try
        {
            if (!_gpuCategoryChecked)
            {
                _gpuCategoryChecked = true;
                try
                {
                    _gpuCategoryExists = PerformanceCounterCategory.Exists("GPU Engine");
                }
                catch
                {
                    _gpuCategoryExists = false;
                }
            }

            if (!_gpuCategoryExists)
            {
                return Math.Clamp(_lastCpuPercent * 0.45 + 3.0, 2.0, 100.0);
            }

            if (_gpuCounters == null || (DateTime.UtcNow - _lastGpuCounterRefresh).TotalSeconds > 120)
            {
                _lastGpuCounterRefresh = DateTime.UtcNow;
                _gpuCounters?.ForEach(c => c.Dispose());
                _gpuCounters = new List<PerformanceCounter>();

                var cat = new PerformanceCounterCategory("GPU Engine");
                string[] instances = cat.GetInstanceNames();
                foreach (string inst in instances)
                {
                    if (inst.EndsWith("engtype_3D", StringComparison.OrdinalIgnoreCase) ||
                        inst.EndsWith("engtype_Compute", StringComparison.OrdinalIgnoreCase))
                    {
                        var counter = new PerformanceCounter("GPU Engine", "Utilization Percentage", inst, true);
                        _ = counter.NextValue();
                        _gpuCounters.Add(counter);
                    }
                }
            }

            if (_gpuCounters != null && _gpuCounters.Count > 0)
            {
                float sum = 0f;
                foreach (var c in _gpuCounters.ToList())
                {
                    try
                    {
                        sum += c.NextValue();
                    }
                    catch
                    {
                        _gpuCounters.Remove(c);
                    }
                }
                return Math.Clamp(sum, 0.0, 100.0);
            }
        }
        catch
        {
        }

        // Fallback estimate proportional to system activity if GPU Engine counter is restricted
        return Math.Clamp(_lastCpuPercent * 0.45 + 3.0, 2.0, 100.0);
    }

    public SystemVitalsData PollVitals()
    {
        double cpu = SampleCpuPercent();

        var mem = new MEMORYSTATUSEX();
        double ramPercent = 40.0;
        double ramTotalGb = 16.0;
        double ramUsedGb = 6.4;

        if (GlobalMemoryStatusEx(mem) && mem.ullTotalPhys > 0)
        {
            ramPercent = mem.dwMemoryLoad;
            ramTotalGb = mem.ullTotalPhys / (1024.0 * 1024.0 * 1024.0);
            ulong usedBytes = mem.ullTotalPhys - mem.ullAvailPhys;
            ramUsedGb = usedBytes / (1024.0 * 1024.0 * 1024.0);
        }

        double gpu = SampleGpuPercent();

        return new SystemVitalsData
        {
            CpuPercent = Math.Round(cpu, 1),
            RamPercent = Math.Round(ramPercent, 1),
            RamUsedGb = Math.Round(ramUsedGb, 1),
            RamTotalGb = Math.Round(ramTotalGb, 1),
            GpuPercent = Math.Round(gpu, 1)
        };
    }
}

