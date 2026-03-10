import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  char: string;
}

interface TrailCursorProps {
  text?: string;
  maxTrail?: number;
  className?: string;
  color?: string;
  throttleMs?: number;
}

let trailId = 0;

export default function TrailCursor({
  text = 'AKARSHAN',
  maxTrail = 20,
  className = '',
  color = 'rgba(255, 255, 255, 0.6)',
  throttleMs = 60,
}: TrailCursorProps) {
  const [points, setPoints] = useState<TrailPoint[]>([]);
  const charIndexRef = useRef(0);
  const lastTimeRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < throttleMs) return;
      lastTimeRef.current = now;

      const char = text[charIndexRef.current % text.length];
      charIndexRef.current++;

      const point: TrailPoint = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
        char,
      };

      setPoints((prev) => [...prev.slice(-(maxTrail - 1)), point]);
    },
    [text, maxTrail, throttleMs],
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleRemove = useCallback((id: number) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none z-[50] ${className}`}>
      <AnimatePresence>
        {points.map((point) => (
          <motion.span
            key={point.id}
            className="absolute font-black select-none"
            style={{
              left: point.x,
              top: point.y,
              color,
              fontSize: 'clamp(14px, 2vw, 22px)',
              transform: 'translate(-50%, -50%)',
              textShadow: `0 0 10px ${color}`,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0.3, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onAnimationComplete={() => handleRemove(point.id)}
          >
            {point.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
