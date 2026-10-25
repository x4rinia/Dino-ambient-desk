import React, { useEffect, useRef, useState } from 'react';
import { Anchor } from 'lucide-react';
import { WidgetOffset } from '../types';

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
  look: [
    '/dino/look_0.png',
    '/dino/look_1.png',
    '/dino/look_2.png',
    '/dino/look_3.png',
  ],
  tail: [
    '/dino/tail_0.png',
    '/dino/tail_1.png',
    '/dino/tail_2.png',
    '/dino/tail_3.png',
  ],
};

type DinoAction = 'walk' | 'jump' | 'look' | 'tail';

interface DinoCompanionProps {
  isEditable?: boolean;
  anchorOffset?: WidgetOffset;
  onAnchorChange?: (next: WidgetOffset) => void;
}

export const DinoCompanion: React.FC<DinoCompanionProps> = ({
  isEditable = false,
  anchorOffset = { x: 0, y: 0 },
  onAnchorChange,
}) => {
  const [currentAction, setCurrentAction] = useState<DinoAction>('walk');
  const [frameIndex, setFrameIndex] = useState(0);
  const [walkX, setWalkX] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [hour, setHour] = useState(() => new Date().getHours());

  // Dragging state for the Dino Anchor Point
  const [dragging, setDragging] = useState(false);
  const [liveAnchor, setLiveAnchor] = useState<WidgetOffset>(anchorOffset);
  const startDragRef = useRef<{
    mouseX: number;
    mouseY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  // Preload all 16 frames on mount for buttery smooth animation
  useEffect(() => {
    Object.values(DINO_SPRITES).forEach((list) => {
      list.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  useEffect(() => {
    if (!dragging) {
      setLiveAnchor(anchorOffset);
    }
  }, [anchorOffset, dragging]);

  useEffect(() => {
    const clockTimer = setInterval(() => setHour(new Date().getHours()), 30000);
    return () => clearInterval(clockTimer);
  }, []);

  const isNightMode = hour >= 23 || hour < 6;

  // Clamp anchor offset so the Dino stage (180x155) never leaves the viewport
  const clampAnchor = (raw: WidgetOffset): WidgetOffset => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 720;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1280;
    const minX = -Math.max(0, vw - 220);
    const maxX = 16;
    const minY = -Math.max(0, vh - 180);
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

  // State Scheduler: Switches between Walk, Jump (ab und zu springen & freuen), Look Forward (schaut nach vorn), Tail Wag (wedelt mit Keule)
  useEffect(() => {
    if (isNightMode) {
      setCurrentAction('look');
      setFrameIndex(2);
      return;
    }

    let isCancelled = false;
    let actionTimer: any = null;

    const playSequence = (
      action: DinoAction,
      frameDelays: number[],
      onComplete: () => void
    ) => {
      setCurrentAction(action);
      let idx = 0;
      setFrameIndex(idx);

      const nextTick = () => {
        if (isCancelled) return;
        idx++;
        if (idx < frameDelays.length) {
          setFrameIndex(idx);
          actionTimer = setTimeout(nextTick, frameDelays[idx]);
        } else {
          onComplete();
        }
      };

      actionTimer = setTimeout(nextTick, frameDelays[0]);
    };

    const scheduleNextAction = () => {
      if (isCancelled) return;

      // Random choice weighted: 40% walk stroll, 25% tail wag, 20% look forward, 15% jump & cheer
      const rand = Math.random();

      if (rand < 0.40) {
        // WALK: Walk stroll left or right for 3-5 seconds
        const nextWalkX = walkX <= 0 ? Math.floor(Math.random() * 25 + 25) : -Math.floor(Math.random() * 25 + 25);
        setFacingLeft(nextWalkX < walkX);
        setWalkX(nextWalkX);
        setCurrentAction('walk');

        let walkSteps = 0;
        const maxSteps = 12; // 12 * 140ms ~ 1.7s
        const walkInterval = setInterval(() => {
          if (isCancelled) {
            clearInterval(walkInterval);
            return;
          }
          walkSteps++;
          setFrameIndex((prev) => (prev + 1) % 4);
          if (walkSteps >= maxSteps) {
            clearInterval(walkInterval);
            actionTimer = setTimeout(scheduleNextAction, 1200);
          }
        }, 140);
      } else if (rand < 0.65) {
        // TAIL WAG: Wedelt mit der Keule (loops 3 times)
        const sequence = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
        const delays = sequence.map(() => 120);
        setCurrentAction('tail');
        let i = 0;
        setFrameIndex(sequence[0]);
        const tick = () => {
          if (isCancelled) return;
          i++;
          if (i < sequence.length) {
            setFrameIndex(sequence[i]);
            actionTimer = setTimeout(tick, delays[i]);
          } else {
            actionTimer = setTimeout(scheduleNextAction, 1500);
          }
        };
        actionTimer = setTimeout(tick, delays[0]);
      } else if (rand < 0.85) {
        // LOOK FORWARD: Schaut nach vorn zu dir (pauses and smiles with big eyes)
        playSequence(
          'look',
          [180, 200, 2200, 200], // frame 2 lingers for 2.2 seconds looking forward
          () => {
            actionTimer = setTimeout(scheduleNextAction, 1000);
          }
        );
      } else {
        // JUMP & REJOICE: Springt fröhlich hoch, jubelt mit offenen Armen und freut sich!
        playSequence(
          'jump',
          [220, 240, 480, 240], // frame 0 crouch -> frame 1 leap -> frame 2 apex cheer (480ms) -> frame 3 landing
          () => {
            actionTimer = setTimeout(scheduleNextAction, 1400);
          }
        );
      }
    };

    // Initial action
    actionTimer = setTimeout(scheduleNextAction, 600);

    return () => {
      isCancelled = true;
      if (actionTimer) clearTimeout(actionTimer);
    };
  }, [walkX, isNightMode]);

  // Current sprite image path
  const currentSpriteSrc =
    DINO_SPRITES[currentAction]?.[frameIndex] || DINO_SPRITES.walk[0];

  return (
    <div
      className={`dino-stage ${isEditable ? 'editable' : ''}`}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '24px',
        width: '180px',
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
          ? '⚓ Dino-Ankerpunkt: Halte die linke Maustaste gedrückt, um den Dino zu verschieben!'
          : 'Dino-Begleiter'
      }
    >
      {/* Anchor Point Handle (Visible ONLY when Settings is open) */}
      {isEditable && (
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(14, 18, 28, 0.94)',
            border: '1px solid #34d399',
            color: '#34d399',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '0.66rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            pointerEvents: 'none',
          }}
        >
          <Anchor size={11} />
          <span>⚓ Dino-Ankerpunkt (bleibt im Bild)</span>
        </div>
      )}

      {/* Animated Ankylosaurus Dino Actor */}
      <div
        style={{
          width: '170px',
          height: '148px',
          transform: `translate3d(${walkX}px, 0, 0) scaleX(${facingLeft ? -1 : 1})`,
          transition: currentAction === 'walk' ? 'transform 0.14s ease-out' : 'transform 0.25s ease-out',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          userSelect: 'none',
          filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45))',
        }}
      >
        <img
          src={currentSpriteSrc}
          alt="Ankylosaurus Dino"
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
