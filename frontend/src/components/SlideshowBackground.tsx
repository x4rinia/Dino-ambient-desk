import React from 'react';
import { BackgroundMode, MonitorInfo, WindowConfig } from '../types';

interface SlideshowBackgroundProps {
  backgroundMode: BackgroundMode;
  customBgColor?: string;
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
  customBgColor = '#090b10',
  windowsWallpaperUrl,
  wallpapers,
  windowConfig,
  monitors,
}) => {
  // Option: Feste Farbe
  if (backgroundMode === 'color' || backgroundMode === 'black') {
    return (
      <div
        className="slideshow-layer"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: customBgColor,
          pointerEvents: 'none',
        }}
      />
    );
  }

  // Option: Windows-Hintergrundbild oder eigenes hochgeladenes Bild (bleibt IMMER gestochen scharf)
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
      {/* The wallpaper itself stays 100% sharp. Only widget cards blur their own backdrop in CSS */}
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
    </div>
  );
};
