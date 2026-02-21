import { useRef, useCallback, useState, useEffect } from 'react';

// ─── Mobile Detection ───
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(
      'ontouchstart' in window || window.innerWidth < 768
    );
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// ─── SwipeOverlay ───
// Transparent overlay that detects swipe gestures and calls onSwipe(direction)
type SwipeDir = 'up' | 'down' | 'left' | 'right';

interface SwipeOverlayProps {
  onSwipe: (dir: SwipeDir) => void;
  onTap?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeOverlay({ onSwipe, onTap, threshold = 30, className = '' }: SwipeOverlayProps) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!startRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < threshold && absDy < threshold) {
      onTap?.();
      startRef.current = null;
      return;
    }

    if (absDx > absDy) {
      onSwipe(dx > 0 ? 'right' : 'left');
    } else {
      onSwipe(dy > 0 ? 'down' : 'up');
    }
    startRef.current = null;
  }, [onSwipe, onTap, threshold]);

  return (
    <div
      className={`absolute inset-0 z-20 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    />
  );
}

// ─── VirtualJoystick ───
// Circular joystick that fires keydown/keyup events for directional input
interface VirtualJoystickProps {
  axes?: 'both' | 'horizontal' | 'vertical';
  size?: number;
  onDirection?: (dir: { x: number; y: number }) => void;
}

export function VirtualJoystick({ axes = 'both', size = 120, onDirection }: VirtualJoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const activeKeysRef = useRef<Set<string>>(new Set());
  const onDirectionRef = useRef(onDirection);
  onDirectionRef.current = onDirection;

  const dispatchKey = useCallback((key: string, type: 'keydown' | 'keyup') => {
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
  }, []);

  const updateKeys = useCallback((x: number, y: number) => {
    const newKeys = new Set<string>();
    const deadzone = 0.3;

    if (axes !== 'vertical') {
      if (x < -deadzone) newKeys.add('ArrowLeft');
      if (x > deadzone) newKeys.add('ArrowRight');
    }
    if (axes !== 'horizontal') {
      if (y < -deadzone) newKeys.add('ArrowUp');
      if (y > deadzone) newKeys.add('ArrowDown');
    }

    const prev = activeKeysRef.current;
    prev.forEach(k => { if (!newKeys.has(k)) dispatchKey(k, 'keyup'); });
    newKeys.forEach(k => { if (!prev.has(k)) dispatchKey(k, 'keydown'); });
    activeKeysRef.current = newKeys;

    onDirectionRef.current?.({ x, y });
  }, [axes, dispatchKey]);

  // Use native event listeners with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = baseRef.current;
    if (!el) return;

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const t = e.touches[0];
      const maxR = size / 2 - 15;

      let dx = t.clientX - cx;
      let dy = t.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }

      setKnobPos({ x: dx, y: dy });
      updateKeys(dx / maxR, dy / maxR);
    };

    const handleTouchEnd = () => {
      setKnobPos({ x: 0, y: 0 });
      activeKeysRef.current.forEach(k => dispatchKey(k, 'keyup'));
      activeKeysRef.current.clear();
      onDirectionRef.current?.({ x: 0, y: 0 });
    };

    el.addEventListener('touchstart', handleTouch, { passive: false });
    el.addEventListener('touchmove', handleTouch, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouch);
      el.removeEventListener('touchmove', handleTouch);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [size, updateKeys, dispatchKey]);

  return (
    <div
      ref={baseRef}
      className="relative select-none"
      style={{ width: size, height: size, touchAction: 'none' }}
    >
      <div
        className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
        style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          left: `calc(50% + ${knobPos.x}px - ${size * 0.2}px)`,
          top: `calc(50% + ${knobPos.y}px - ${size * 0.2}px)`,
          background: 'radial-gradient(circle, rgba(0,240,255,0.6) 0%, rgba(0,240,255,0.2) 100%)',
          boxShadow: '0 0 15px rgba(0,240,255,0.4)',
          transition: knobPos.x === 0 && knobPos.y === 0 ? 'all 0.15s ease-out' : 'none',
        }}
      />
    </div>
  );
}

// ─── ActionButton ───
// Large circular button for shoot/jump/action
interface ActionButtonProps {
  label: string;
  size?: number;
  color?: string;
  onPress: () => void;
  onRelease?: () => void;
}

export function ActionButton({ label, size = 70, color = '#ff00aa', onPress, onRelease }: ActionButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const onPressRef = useRef(onPress);
  const onReleaseRef = useRef(onRelease);
  onPressRef.current = onPress;
  onReleaseRef.current = onRelease;

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const handleStart = (e: TouchEvent) => { e.preventDefault(); onPressRef.current(); };
    const handleEnd = (e: TouchEvent) => { e.preventDefault(); onReleaseRef.current?.(); };
    const handleCancel = () => { onReleaseRef.current?.(); };
    el.addEventListener('touchstart', handleStart, { passive: false });
    el.addEventListener('touchend', handleEnd, { passive: false });
    el.addEventListener('touchcancel', handleCancel);
    return () => {
      el.removeEventListener('touchstart', handleStart);
      el.removeEventListener('touchend', handleEnd);
      el.removeEventListener('touchcancel', handleCancel);
    };
  }, []);

  return (
    <button
      ref={btnRef}
      className="rounded-full flex items-center justify-center font-bold select-none active:scale-90 transition-transform"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}80 0%, ${color}40 100%)`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 20px ${color}40`,
        color: '#fff',
        fontSize: size * 0.25,
        touchAction: 'none',
      }}
      onPointerDown={onPress}
      onPointerUp={() => onRelease?.()}
    >
      {label}
    </button>
  );
}

// ─── LandscapeWrapper ───
// Shows a "rotate your device" prompt when portrait is detected for landscape-only games
interface LandscapeWrapperProps {
  children: React.ReactNode;
}

export function LandscapeWrapper({ children }: LandscapeWrapperProps) {
  const [isPortrait, setIsPortrait] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const check = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (isMobile && isPortrait) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="text-6xl animate-pulse" style={{ animation: 'rotate-hint 2s ease-in-out infinite' }}>
          📱
        </div>
        <p className="text-cyan-400 text-lg font-bold">Rotate Your Device</p>
        <p className="text-gray-400 text-sm">This game is best played in landscape mode</p>
        <style>{`
          @keyframes rotate-hint {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(90deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
