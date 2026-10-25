import React, { useEffect, useRef, useState } from 'react';
import { Anchor } from 'lucide-react';
import { DinoVariant, WidgetOffset } from '../types';

const ALL_VARIANTS: DinoVariant[] = [
  'ankylosaurus',
  'triceratops',
  'stegosaurus',
  'brachiosaurus',
];

interface DinoCompanionProps {
  variant?: DinoVariant | string;
  autoCycle?: boolean;
  cycleVariants?: DinoVariant[];
  isEditable?: boolean;
  anchorOffset?: WidgetOffset;
  onAnchorChange?: (next: WidgetOffset) => void;
}

export const DinoCompanion: React.FC<DinoCompanionProps> = ({
  variant = 'ankylosaurus',
  autoCycle = false,
  cycleVariants,
  isEditable = false,
  anchorOffset = { x: 0, y: 0 },
  onAnchorChange,
}) => {
  const [walkX, setWalkX] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [stepPhase, setStepPhase] = useState(0);
  const [hour, setHour] = useState(() => new Date().getHours());
  const [cycledVariant, setCycledVariant] = useState<DinoVariant>(
    (variant as DinoVariant) || 'ankylosaurus'
  );

  // Dragging state for the Dino Anchor Point
  const [dragging, setDragging] = useState(false);
  const [liveAnchor, setLiveAnchor] = useState<WidgetOffset>(anchorOffset);
  const startDragRef = useRef<{
    mouseX: number;
    mouseY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  useEffect(() => {
    if (!dragging) {
      setLiveAnchor(anchorOffset);
    }
  }, [anchorOffset, dragging]);

  useEffect(() => {
    if (!autoCycle) {
      setCycledVariant((variant as DinoVariant) || 'ankylosaurus');
    }
  }, [variant, autoCycle]);

  // Automatic cycling through the selected Dino variants when "Wechsel" is checked
  useEffect(() => {
    if (!autoCycle) return;
    const pool = cycleVariants && cycleVariants.length > 0 ? cycleVariants : ALL_VARIANTS;
    setCycledVariant((prev) => (pool.includes(prev) ? prev : pool[0]));

    const timer = setInterval(() => {
      setCycledVariant((prev) => {
        const poolNow = cycleVariants && cycleVariants.length > 0 ? cycleVariants : ALL_VARIANTS;
        const idx = poolNow.indexOf(prev);
        if (idx === -1) return poolNow[0];
        return poolNow[(idx + 1) % poolNow.length];
      });
    }, 20000);
    return () => clearInterval(timer);
  }, [autoCycle, cycleVariants]);

  useEffect(() => {
    const clockTimer = setInterval(() => setHour(new Date().getHours()), 30000);
    return () => clearInterval(clockTimer);
  }, []);

  const isNightMode = hour >= 22 || hour < 6;

  // Periodic blinking in day mode
  useEffect(() => {
    if (isNightMode) return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, [isNightMode]);

  // Periodic ±34px left/right stroll around the Anchor Point (never leaving the screen)
  useEffect(() => {
    if (isNightMode) return;
    const walkInterval = setInterval(() => {
      setWalkX((prev) => {
        const next = prev <= 0 ? 34 : -34;
        setFacingLeft(next < prev);
        return next;
      });
      let ticks = 0;
      const footTimer = setInterval(() => {
        ticks++;
        setStepPhase((s) => (s + 1) % 2);
        if (ticks >= 6) {
          clearInterval(footTimer);
          setStepPhase(0);
        }
      }, 100);
    }, 5500);
    return () => clearInterval(walkInterval);
  }, [isNightMode]);

  // Clamp anchor offset so the Dino stage (170x74) + its ±34px walk range never leaves the viewport
  const clampAnchor = (raw: WidgetOffset): WidgetOffset => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 720;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1280;
    // Default stage anchor is right: 20px, bottom: 10px, width: 170px, height: 74px
    // So dx can go from -(vw - 198) to +12, and dy can go from -(vh - 94) to +6
    const minX = -Math.max(0, vw - 198);
    const maxX = 12;
    const minY = -Math.max(0, vh - 94);
    const maxY = 6;
    return {
      x: Math.min(maxX, Math.max(minX, Math.round(raw.x))),
      y: Math.min(maxY, Math.max(minY, Math.round(raw.y))),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditable || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    startDragRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      baseX: liveAnchor.x,
      baseY: liveAnchor.y,
    };

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!startDragRef.current) return;
      const next = clampAnchor({
        x: startDragRef.current.baseX + (moveEv.clientX - startDragRef.current.mouseX),
        y: startDragRef.current.baseY + (moveEv.clientY - startDragRef.current.mouseY),
      });
      setLiveAnchor(next);
    };

    const handleMouseUp = (upEv: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (startDragRef.current) {
        const finalPos = clampAnchor({
          x: startDragRef.current.baseX + (upEv.clientX - startDragRef.current.mouseX),
          y: startDragRef.current.baseY + (upEv.clientY - startDragRef.current.mouseY),
        });
        setLiveAnchor(finalPos);
        onAnchorChange?.(finalPos);
      }
      startDragRef.current = null;
      setDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderAnkylosaurus = () => (
    <svg
      width="96"
      height="58"
      viewBox="0 0 48 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect x="6" y="26" width="36" height="2" fill="rgba(0,0,0,0.45)" />
      <rect x="2" y={isNightMode ? 20 : 18} width="5" height="4" fill="#fbbf24" />
      <rect x="3" y={isNightMode ? 21 : 19} width="3" height="2" fill="#f59e0b" />
      <rect x="7" y={isNightMode ? 21 : 19} width="6" height="3" fill="#2dd4bf" />
      <rect x="14" y={isNightMode ? 12 : 10} width="3" height="2" fill="#fbbf24" />
      <rect x="19" y={isNightMode ? 10 : 8} width="4" height="2" fill="#fbbf24" />
      <rect x="25" y={isNightMode ? 10 : 8} width="4" height="2" fill="#fbbf24" />
      <rect x="31" y={isNightMode ? 12 : 10} width="3" height="2" fill="#fbbf24" />
      <rect x="12" y={isNightMode ? 14 : 12} width="22" height="8" fill="#0d9488" />
      <rect x="14" y={isNightMode ? 12 : 10} width="18" height="3" fill="#14b8a6" />
      <rect x="16" y={isNightMode ? 15 : 13} width="2" height="2" fill="#5eead4" />
      <rect x="22" y={isNightMode ? 14 : 12} width="2" height="2" fill="#5eead4" />
      <rect x="28" y={isNightMode ? 15 : 13} width="2" height="2" fill="#5eead4" />
      <rect x="13" y={isNightMode ? 21 : 20} width="20" height="3" fill="#99f6e4" />
      <rect x="34" y={isNightMode ? 15 : 13} width="3" height="2" fill="#fbbf24" />
      <rect x="34" y={isNightMode ? 17 : 15} width="9" height="7" fill="#2dd4bf" />
      <rect x="41" y={isNightMode ? 19 : 17} width="3" height="4" fill="#14b8a6" />
      {isNightMode || isBlinking ? (
        <rect x="38" y={isNightMode ? 19 : 17} width="3" height="1" fill="#090d16" />
      ) : (
        <>
          <rect x="38" y="17" width="2" height="2" fill="#090d16" />
          <rect x="39" y="17" width="1" height="1" fill="#ffffff" />
        </>
      )}
      {isNightMode ? (
        <>
          <rect x="14" y="24" width="5" height="2" fill="#0f766e" />
          <rect x="27" y="24" width="5" height="2" fill="#0f766e" />
        </>
      ) : (
        <>
          <rect x={stepPhase === 0 ? 14 : 15} y="23" width="4" height="4" fill="#0f766e" />
          <rect x={stepPhase === 0 ? 20 : 19} y="23" width="4" height="4" fill="#14b8a6" />
          <rect x={stepPhase === 0 ? 27 : 28} y="23" width="4" height="4" fill="#0f766e" />
          <rect x={stepPhase === 0 ? 32 : 31} y="23" width="4" height="4" fill="#14b8a6" />
        </>
      )}
    </svg>
  );

  const renderTriceratops = () => (
    <svg
      width="98"
      height="58"
      viewBox="0 0 49 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect x="6" y="26" width="37" height="2" fill="rgba(0,0,0,0.45)" />
      <rect x="3" y={isNightMode ? 20 : 18} width="4" height="3" fill="#ea580c" />
      <rect x="7" y={isNightMode ? 18 : 16} width="5" height="5" fill="#f97316" />
      <rect x="12" y={isNightMode ? 14 : 12} width="20" height="9" fill="#f97316" />
      <rect x="14" y={isNightMode ? 12 : 10} width="16" height="3" fill="#fb923c" />
      <rect x="17" y={isNightMode ? 14 : 12} width="3" height="2" fill="#fdba74" />
      <rect x="23" y={isNightMode ? 13 : 11} width="3" height="2" fill="#fdba74" />
      <rect x="13" y={isNightMode ? 21 : 20} width="18" height="3" fill="#fed7aa" />
      <rect x="30" y={isNightMode ? 9 : 7} width="6" height="11" fill="#ea580c" />
      <rect x="31" y={isNightMode ? 10 : 8} width="4" height="9" fill="#fb923c" />
      <rect x="30" y={isNightMode ? 7 : 5} width="2" height="2" fill="#fef08a" />
      <rect x="33" y={isNightMode ? 7 : 5} width="2" height="2" fill="#fef08a" />
      <rect x="35" y={isNightMode ? 14 : 12} width="8" height="8" fill="#f97316" />
      <rect x="42" y={isNightMode ? 17 : 15} width="3" height="5" fill="#ea580c" />
      <rect x="39" y={isNightMode ? 10 : 8} width="6" height="2" fill="#fef9c3" />
      <rect x="41" y={isNightMode ? 9 : 7} width="4" height="1" fill="#ffffff" />
      <rect x="44" y={isNightMode ? 14 : 12} width="2" height="3" fill="#fef9c3" />
      {isNightMode || isBlinking ? (
        <rect x="38" y={isNightMode ? 17 : 15} width="3" height="1" fill="#090d16" />
      ) : (
        <>
          <rect x="38" y="15" width="2" height="2" fill="#090d16" />
          <rect x="39" y="15" width="1" height="1" fill="#ffffff" />
        </>
      )}
      {isNightMode ? (
        <>
          <rect x="14" y="24" width="5" height="2" fill="#c2410c" />
          <rect x="27" y="24" width="5" height="2" fill="#c2410c" />
        </>
      ) : (
        <>
          <rect x={stepPhase === 0 ? 14 : 15} y="23" width="4" height="4" fill="#c2410c" />
          <rect x={stepPhase === 0 ? 19 : 18} y="23" width="4" height="4" fill="#ea580c" />
          <rect x={stepPhase === 0 ? 26 : 27} y="23" width="4" height="4" fill="#c2410c" />
          <rect x={stepPhase === 0 ? 31 : 30} y="23" width="4" height="4" fill="#ea580c" />
        </>
      )}
    </svg>
  );

  const renderStegosaurus = () => (
    <svg
      width="98"
      height="58"
      viewBox="0 0 49 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect x="6" y="26" width="36" height="2" fill="rgba(0,0,0,0.45)" />
      <rect x="2" y={isNightMode ? 17 : 15} width="2" height="3" fill="#f472b6" />
      <rect x="5" y={isNightMode ? 16 : 14} width="2" height="3" fill="#f472b6" />
      <rect x="3" y={isNightMode ? 19 : 17} width="9" height="4" fill="#9333ea" />
      <rect x="13" y={isNightMode ? 10 : 8} width="3" height="4" fill="#f472b6" />
      <rect x="18" y={isNightMode ? 7 : 5} width="4" height="6" fill="#ec4899" />
      <rect x="19" y={isNightMode ? 6 : 4} width="2" height="2" fill="#fbcfe8" />
      <rect x="24" y={isNightMode ? 7 : 5} width="4" height="6" fill="#ec4899" />
      <rect x="25" y={isNightMode ? 6 : 4} width="2" height="2" fill="#fbcfe8" />
      <rect x="30" y={isNightMode ? 10 : 8} width="3" height="4" fill="#f472b6" />
      <rect x="12" y={isNightMode ? 14 : 12} width="22" height="8" fill="#7e22ce" />
      <rect x="14" y={isNightMode ? 12 : 10} width="18" height="3" fill="#a855f7" />
      <rect x="17" y={isNightMode ? 15 : 13} width="2" height="2" fill="#d8b4fe" />
      <rect x="24" y={isNightMode ? 14 : 12} width="2" height="2" fill="#d8b4fe" />
      <rect x="13" y={isNightMode ? 21 : 20} width="20" height="3" fill="#e9d5ff" />
      <rect x="34" y={isNightMode ? 17 : 15} width="9" height="6" fill="#a855f7" />
      <rect x="42" y={isNightMode ? 18 : 16} width="3" height="4" fill="#9333ea" />
      {isNightMode || isBlinking ? (
        <rect x="39" y={isNightMode ? 19 : 17} width="3" height="1" fill="#090d16" />
      ) : (
        <>
          <rect x="39" y="17" width="2" height="2" fill="#090d16" />
          <rect x="40" y="17" width="1" height="1" fill="#ffffff" />
        </>
      )}
      {isNightMode ? (
        <>
          <rect x="14" y="24" width="5" height="2" fill="#6b21a8" />
          <rect x="27" y="24" width="5" height="2" fill="#6b21a8" />
        </>
      ) : (
        <>
          <rect x={stepPhase === 0 ? 14 : 15} y="23" width="4" height="4" fill="#6b21a8" />
          <rect x={stepPhase === 0 ? 20 : 19} y="23" width="4" height="4" fill="#9333ea" />
          <rect x={stepPhase === 0 ? 27 : 28} y="23" width="4" height="4" fill="#6b21a8" />
          <rect x={stepPhase === 0 ? 32 : 31} y="23" width="4" height="4" fill="#9333ea" />
        </>
      )}
    </svg>
  );

  const renderBrachiosaurus = () => (
    <svg
      width="98"
      height="66"
      viewBox="0 0 49 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect x="6" y="30" width="34" height="2" fill="rgba(0,0,0,0.45)" />
      <rect x="2" y={isNightMode ? 25 : 23} width="5" height="2" fill="#059669" />
      <rect x="7" y={isNightMode ? 23 : 21} width="6" height="4" fill="#10b981" />
      <rect x="13" y={isNightMode ? 18 : 16} width="19" height="9" fill="#10b981" />
      <rect x="15" y={isNightMode ? 16 : 14} width="15" height="3" fill="#34d399" />
      <rect x="17" y={isNightMode ? 19 : 17} width="2" height="2" fill="#a7f3d0" />
      <rect x="22" y={isNightMode ? 18 : 16} width="2" height="2" fill="#a7f3d0" />
      <rect x="14" y={isNightMode ? 25 : 24} width="17" height="3" fill="#d1fae5" />
      <rect x="30" y={isNightMode ? 10 : 5} width="5" height="14" fill="#10b981" />
      <rect x="31" y={isNightMode ? 10 : 5} width="2" height="12" fill="#34d399" />
      <rect x="33" y={isNightMode ? 7 : 2} width="4" height="2" fill="#fbbf24" />
      <rect x="32" y={isNightMode ? 8 : 3} width="9" height="6" fill="#34d399" />
      <rect x="39" y={isNightMode ? 10 : 5} width="3" height="4" fill="#10b981" />
      {isNightMode || isBlinking ? (
        <rect x="36" y={isNightMode ? 10 : 5} width="3" height="1" fill="#090d16" />
      ) : (
        <>
          <rect x="36" y="5" width="2" height="2" fill="#090d16" />
          <rect x="37" y="5" width="1" height="1" fill="#ffffff" />
        </>
      )}
      {isNightMode ? (
        <>
          <rect x="15" y="28" width="5" height="2" fill="#047857" />
          <rect x="26" y="28" width="5" height="2" fill="#047857" />
        </>
      ) : (
        <>
          <rect x={stepPhase === 0 ? 15 : 16} y="27" width="4" height="4" fill="#047857" />
          <rect x={stepPhase === 0 ? 20 : 19} y="27" width="4" height="4" fill="#10b981" />
          <rect x={stepPhase === 0 ? 26 : 27} y="27" width="4" height="4" fill="#047857" />
          <rect x={stepPhase === 0 ? 30 : 29} y="27" width="4" height="4" fill="#10b981" />
        </>
      )}
    </svg>
  );

  const clampedAnchor = clampAnchor(liveAnchor);
  const activeDino = autoCycle ? cycledVariant : (variant as DinoVariant);

  return (
    <div
      className={`dino-stage ${isEditable ? 'editable-anchor' : ''} ${
        dragging ? 'dragging' : ''
      }`}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${clampedAnchor.x}px, ${clampedAnchor.y}px, 0)`,
        pointerEvents: isEditable ? 'auto' : 'none',
        cursor: isEditable ? (dragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      {isEditable && (
        <div
          className="widget-drag-handle-pill"
          style={{ top: -18, right: 'auto', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        >
          <Anchor size={11} />
          <span>Dino-Ankerpunkt (bleibt im Bild)</span>
        </div>
      )}

      <div
        className="dino-actor"
        style={{
          transform: `translateX(${isNightMode ? 0 : walkX}px) scaleX(${
            facingLeft ? -1 : 1
          })`,
        }}
      >
        {isNightMode && (
          <>
            <span className="zzz-particle">Zzz</span>
            <span className="zzz-particle delay-1">z</span>
            <span className="zzz-particle delay-2">Z</span>
          </>
        )}

        {activeDino === 'triceratops'
          ? renderTriceratops()
          : activeDino === 'stegosaurus'
          ? renderStegosaurus()
          : activeDino === 'brachiosaurus'
          ? renderBrachiosaurus()
          : renderAnkylosaurus()}
      </div>
    </div>
  );
};
