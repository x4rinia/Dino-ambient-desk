import React from 'react';
import { BackgroundMode, MonitorInfo, WindowConfig } from '../types';

interface SlideshowBackgroundProps {
  backgroundMode: BackgroundMode;
  blurPx: number;
  intervalSec: number;
  useWindowsWallpaper: boolean;
  windowsWallpaperUrl: string | null;
  wallpapers: string[];
  windowConfig: WindowConfig;
  monitors: MonitorInfo[];
}

export const SlideshowBackground: React.FC<SlideshowBackgroundProps> = ({
  backgroundMode,
  blurPx,
  windowsWallpaperUrl,
  wallpapers,
  windowConfig,
  monitors,
}) => {
  if (backgroundMode === 'black') {
    return null;
  }

  // Priority: If user uploaded custom wallpapers, prefer the uploaded wallpaper!
  // Otherwise use the Windows desktop wallpaper for this monitor.
  const wallpaperSrc =
    wallpapers.length > 0
      ? wallpapers[0]
      : windowsWallpaperUrl || null;

  if (!wallpaperSrc) {
    return null;
  }

  const targetMonitor =
    monitors.find((m) => m.id === windowConfig.monitor_id) || monitors[0];

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const monWidth = targetMonitor ? targetMonitor.width / dpr : window.innerWidth;
  const monHeight = targetMonitor ? targetMonitor.height / dpr : window.innerHeight;
  const offsetX = targetMonitor ? -(windowConfig.x - targetMonitor.x) / dpr : 0;
  const offsetY = targetMonitor ? -(windowConfig.y - targetMonitor.y) / dpr : 0;

  const isBlurred = backgroundMode === 'wallpaper_blur';

  return (
    <div
      className="slideshow-layer"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        className="desktop-wallpaper-mirror"
        style={{
          position: 'fixed',
          left: `${offsetX}px`,
          top: `${offsetY}px`,
          width: `${monWidth}px`,
          height: `${monHeight}px`,
          backgroundImage: `url("${wallpaperSrc}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
          filter: isBlurred ? `blur(${blurPx || 14}px)` : 'none',
          transform: isBlurred ? 'scale(1.05)' : 'none',
          opacity: 0.95,
          transition: 'filter 0.3s ease, opacity 0.3s ease',
        }}
      />
    </div>
  );
};
