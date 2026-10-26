import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Anchor, ArrowLeftRight } from 'lucide-react';
import { AddonCompanionInfo, WidgetOffset } from '../types';

export const DINO_SPRITES = {
  walk: [
    '/dino/walk_0.png',
    '/dino/walk_1.png',
    '/dino/walk_2.png',
    '/dino/walk_3.png',
  ],
  jump: [
    '/dino/jump_0.png',
    '/dino/jump_1.png',
    '/dino/jump_2.png',
    '/dino/jump_3.png',
  ],
  tail: [
    '/dino/tail_0.png',
    '/dino/tail_1.png',
    '/dino/tail_2.png',
    '/dino/tail_3.png',
  ],
};

type DinoAction = 'walk' | 'jump' | 'tail';

interface DinoCompanionProps {
  speed?: number;
  scale?: number;
  opacity?: number;
  trackWidth?: number;
  allowWalk?: boolean;
  allowTail?: boolean;
  allowJump?: boolean;
  isEditable?: boolean;
  anchorOffset?: WidgetOffset;
  onAnchorChange?: (next: WidgetOffset) => void;
  variant?: string;
  addonCompanions?: AddonCompanionInfo[];
}

export const DinoCompanion: React.FC<DinoCompanionProps> = ({
  speed = 100,
  scale = 100,
  opacity = 100,
  trackWidth = 480,
  allowWalk = true,
  allowTail = true,
  allowJump = true,
  isEditable = false,
  anchorOffset = { x: 0, y: 0 },
  onAnchorChange,
  variant,
  addonCompanions = [],
}) => {
  const [currentAction, setCurrentAction] = useState<DinoAction>('walk');
  const [frameIndex, setFrameIndex] = useState(0);

  // Dynamically resolve sprites: Addon companion if chosen and available, otherwise built-in Dino
  const activeCompanion = useMemo(() => {
    if (!variant || variant === 'ankylosaurus') return null;
    return addonCompanions.find(
      (c) => c.id.toLowerCase() === variant.toLowerCase()
    ) || null;
  }, [variant, addonCompanions]);

  const activeSprites = useMemo(() => {
    if (activeCompanion) {
      if (activeCompanion.sprites?.walk && activeCompanion.sprites.walk.length > 0) {
        return {
          walk: activeCompanion.sprites.walk,
          jump:
            activeCompanion.sprites.jump && activeCompanion.sprites.jump.length > 0
              ? activeCompanion.sprites.jump
              : activeCompanion.sprites.walk,
          tail:
            activeCompanion.sprites.tail && activeCompanion.sprites.tail.length > 0
              ? activeCompanion.sprites.tail
              : activeCompanion.sprites.walk,
        };
      }
      return {
        walk: Array.from(
          { length: activeCompanion.walk_frames || 4 },
          (_, i) => `${activeCompanion.base_url}/walk_${i}.png`
        ),
        jump: Array.from(
          { length: activeCompanion.jump_frames || 4 },
          (_, i) => `${activeCompanion.base_url}/jump_${i}.png`
        ),
        tail: Array.from(
          { length: activeCompanion.tail_frames || 4 },
          (_, i) => `${activeCompanion.base_url}/tail_${i}.png`
        ),
      };
    }
    return DINO_SPRITES;
  }, [activeCompanion]);

  // Smooth walking path state: walkX ranges from -halfTrack to +halfTrack
  const halfTrack = Math.max(120, Math.round(trackWidth / 2));
  const [walkX, setWalkX] = useState<number>(allowWalk ? -halfTrack + 40 : 0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = walking right, -1 = walking left

  // Position and direction refs so the animation loop never cancels itself
  const walkXRef = useRef<number>(allowWalk ? -halfTrack + 40 : 0);
  const dirRef = useRef<1 | -1>(1);

  // Dragging state for the Dino Anchor Point
  const [dragging, setDragging] = useState(false);
  const [liveAnchor, setLiveAnchor] = useState<WidgetOffset>(anchorOffset);
  const startDragRef = useRef<{
    mouseX: number;
    mouseY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  // Preload all frames on mount or when companion changes
  useEffect(() => {
    Object.values(activeSprites).forEach((list) => {
      list.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, [activeSprites]);

  useEffect(() => {
    if (!dragging) {
      setLiveAnchor(anchorOffset);
    }
  }, [anchorOffset, dragging]);

  // Clamp anchor offset so the track stays inside the viewport
  const clampAnchor = (raw: WidgetOffset): WidgetOffset => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 720;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1280;
    const minX = -Math.max(0, vw - trackWidth - 60);
    const maxX = 20;
    const minY = -Math.max(0, vh - 220);
    const maxY = 10;
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

  // State Scheduler: Moves continuously across the track width without freezing!
  useEffect(() => {
    let isCancelled = false;
    let actionTimer: any = null;
    const speedMultiplier = Math.max(0.4, Math.min(2.2, (speed || 100) / 100));
    const currentHalfTrack = Math.max(120, Math.round(trackWidth / 2));
    const boundaryMargin = 25;

    const playSequence = (
      action: DinoAction,
      frameDelays: number[],
      onComplete: () => void
    ) => {
      setCurrentAction(action);
      let idx = 0;
      setFrameIndex(idx);
      const scaledDelays = frameDelays.map((d) =>
        Math.max(50, Math.round(d / speedMultiplier))
      );

      const nextTick = () => {
        if (isCancelled) return;
        idx++;
        if (idx < scaledDelays.length) {
          setFrameIndex(idx);
          actionTimer = setTimeout(nextTick, scaledDelays[idx]);
        } else {
          onComplete();
        }
      };

      actionTimer = setTimeout(nextTick, scaledDelays[0]);
    };

    const scheduleNextAction = () => {
      if (isCancelled) return;

      // If walk is disabled, ensure Dino stays stationary at center (walkX = 0)
      if (!allowWalk) {
        walkXRef.current = 0;
        setWalkX(0);
      } else {
        // Check boundaries using refs
        if (walkXRef.current >= currentHalfTrack - boundaryMargin) {
          dirRef.current = -1;
          setDirection(-1);
        } else if (walkXRef.current <= -currentHalfTrack + boundaryMargin) {
          dirRef.current = 1;
          setDirection(1);
        }
      }

      // Action choices dynamically filtered by enabled settings:
      // walkWeight: 60, tailWeight: 25, jumpWeight: 20
      const walkWeight = allowWalk ? 60 : 0;
      const tailWeight = allowTail ? 25 : 0;
      const jumpWeight = allowJump ? 20 : 0;
      const totalWeight = walkWeight + tailWeight + jumpWeight;

      // If all animations are deactivated: peacefully stay idle standing in place
      if (totalWeight === 0) {
        setCurrentAction('walk');
        setFrameIndex(0);
        walkXRef.current = 0;
        setWalkX(0);
        actionTimer = setTimeout(scheduleNextAction, 1200);
        return;
      }

      const roll = Math.random() * totalWeight;

      if (roll < walkWeight) {
        // WALK: Take 10-16 continuous steps across the track
        setCurrentAction('walk');
        const numSteps = Math.floor(Math.random() * 7 + 10);
        const stepPx = Math.floor(Math.random() * 3 + 6); // 6 to 8px per step
        let stepCount = 0;
        const stepInterval = Math.max(60, Math.round(130 / speedMultiplier));

        const walkInterval = setInterval(() => {
          if (isCancelled) {
            clearInterval(walkInterval);
            return;
          }
          stepCount++;
          setFrameIndex((prev) => (prev + 1) % activeSprites.walk.length);

          // Update position
          walkXRef.current += dirRef.current * stepPx;

          // Boundary bounce
          if (walkXRef.current >= currentHalfTrack - boundaryMargin) {
            walkXRef.current = currentHalfTrack - boundaryMargin;
            dirRef.current = -1;
            setDirection(-1);
          } else if (walkXRef.current <= -currentHalfTrack + boundaryMargin) {
            walkXRef.current = -currentHalfTrack + boundaryMargin;
            dirRef.current = 1;
            setDirection(1);
          }

          setWalkX(walkXRef.current);

          if (stepCount >= numSteps) {
            clearInterval(walkInterval);
            actionTimer = setTimeout(
              scheduleNextAction,
              Math.max(300, Math.round(800 / speedMultiplier))
            );
          }
        }, stepInterval);
      } else if (roll < walkWeight + tailWeight) {
        // TAIL WAG: Wedelt fröhlich mit der Keule
        const sequence = [0, 1, 2, 3, 0, 1, 2, 3];
        const stepDelay = Math.max(50, Math.round(115 / speedMultiplier));
        setCurrentAction('tail');
        let i = 0;
        setFrameIndex(sequence[0]);
        const tick = () => {
          if (isCancelled) return;
          i++;
          if (i < sequence.length) {
            setFrameIndex(sequence[i]);
            actionTimer = setTimeout(tick, stepDelay);
          } else {
            setCurrentAction('walk');
            setFrameIndex(0);
            actionTimer = setTimeout(
              scheduleNextAction,
              Math.max(400, Math.round(900 / speedMultiplier))
            );
          }
        };
        actionTimer = setTimeout(tick, stepDelay);
      } else {
        // JUMP & REJOICE: Springt fröhlich hoch und jubelt!
        playSequence('jump', [200, 220, 460, 220], () => {
          setCurrentAction('walk');
          setFrameIndex(0);
          actionTimer = setTimeout(
            scheduleNextAction,
            Math.max(400, Math.round(900 / speedMultiplier))
          );
        });
      }
    };

    // Initial trigger
    actionTimer = setTimeout(
      scheduleNextAction,
      Math.max(200, Math.round(400 / speedMultiplier))
    );

    return () => {
      isCancelled = true;
      if (actionTimer) clearTimeout(actionTimer);
    };
  }, [speed, trackWidth, allowWalk, allowTail, allowJump, activeSprites]);

  // Current sprite image path
  const currentSpriteSrc =
    activeSprites[currentAction]?.[frameIndex] || activeSprites.walk[0];

  const opacityValue = Math.max(0.15, Math.min(1.0, (opacity ?? 100) / 100));

  // Dino faces left when walking left (-1), faces right when walking right (1)
  const isFacingLeft = direction === -1;

  return (
    <div
      className={`dino-stage ${isEditable ? 'editable' : ''}`}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '24px',
        width: `${trackWidth}px`,
        height: '155px',
        zIndex: isEditable ? 40 : 15,
        cursor: isEditable ? (dragging ? 'grabbing' : 'grab') : 'default',
        transform: `translate3d(${liveAnchor.x}px, ${liveAnchor.y}px, 0)`,
        pointerEvents: isEditable ? 'auto' : 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      title={
        isEditable
          ? '⚓ Dino-Laufbereich: Halte die linke Maustaste gedrückt, um den gesamten Bereich zu verschieben!'
          : 'Dino-Begleiter'
      }
    >
      {/* Visual Guide: Visible ONLY when Settings Window is open (wird beim Speichern unsichtbar!) */}
      {isEditable && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px dashed rgba(52, 211, 153, 0.7)',
            borderRadius: '16px',
            background: 'rgba(52, 211, 153, 0.08)',
            boxShadow: '0 0 24px rgba(52, 211, 153, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '7px 10px',
            pointerEvents: 'none',
          }}
        >
          {/* Top Info Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.67rem',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                background: 'rgba(14, 18, 28, 0.92)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(52, 211, 153, 0.45)',
              }}
            >
              ◀ Linke Grenze
            </span>

            <span
              style={{
                background: 'rgba(14, 18, 28, 0.95)',
                color: '#38bdf8',
                padding: '3px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(56, 189, 248, 0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <ArrowLeftRight size={11} color="#38bdf8" />
              <span>Dino-Laufbereich ({trackWidth}px)</span>
            </span>

            <span
              style={{
                background: 'rgba(14, 18, 28, 0.92)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(52, 211, 153, 0.45)',
              }}
            >
              Rechte Grenze ▶
            </span>
          </div>

          {/* Bottom Center Anchor Tip */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                background: 'rgba(14, 18, 28, 0.92)',
                color: '#fbbf24',
                fontSize: '0.63rem',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Anchor size={10} color="#fbbf24" />
              <span>Hier mit der Maus ziehen, um den Bereich zu verschieben</span>
            </span>
          </div>
        </div>
      )}

      {/* Animated Ankylosaurus Dino Actor */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          width: '160px',
          height: '142px',
          marginLeft: '-80px',
          transformOrigin: 'bottom center',
          transform: `translate3d(${walkX}px, 0, 0) scale(${scale / 100}) scaleX(${isFacingLeft ? -1 : 1})`,
          transition:
            currentAction === 'walk'
              ? 'transform 0.12s linear'
              : 'transform 0.22s ease-out',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          userSelect: 'none',
          opacity: opacityValue,
          filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45))',
        }}
      >
        <img
          src={currentSpriteSrc}
          alt={activeCompanion ? activeCompanion.name : 'Dino Begleiter'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/dino/walk_0.png';
          }}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'auto',
          }}
        />
      </div>
    </div>
  );
};
