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
  windowsWallpaperUrl,
  wallpapers,
  windowConfig,
  monitors,
}) => {
  const wallpaperSrc =
    windowsWallpaperUrl || (wallpapers.length > 0 ? wallpapers[0] : null);

  const targetMonitor =
    monitors.find((m) => m.id === windowConfig.monitor_id) || monitors[0];

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const monWidth = targetMonitor ? targetMonitor.width / dpr : window.innerWidth;
  const monHeight = targetMonitor ? targetMonitor.height / dpr : window.innerHeight;
  const offsetX = targetMonitor ? -(windowConfig.x - targetMonitor.x) / dpr : 0;
  const offsetY = targetMonitor ? -(windowConfig.y - targetMonitor.y) / dpr : 0;

  return (
    <div className="slideshow-layer">
      {wallpaperSrc && (
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
          }}
        />
      )}
    </div>
  );
};
