import { useState, useEffect, useRef, useCallback } from 'react';

interface EyesProps {
  size?: number;
  eyeColor?: string;
  pupilColor?: string;
  className?: string;
}

export default function Eyes({
  size = 18,
  eyeColor = '#ffffff',
  pupilColor = '#0a0a0a',
  className = '',
}: EyesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const angle = Math.atan2(dy, dx);
    const maxDist = size * 0.18;
    const dist = Math.min(Math.hypot(dx, dy) * 0.02, maxDist);

    setPupilOffset({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    });
  }, [size]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const eyeW = size;
  const eyeH = size * 1.5;
  const pupilSize = size * 0.6;
  const gap = size * 0.4;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: 'inline-flex', gap: `${gap}px`, alignItems: 'center' }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            width: `${eyeW}px`,
            height: `${eyeH}px`,
            borderRadius: '50%',
            backgroundColor: eyeColor,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: `${pupilSize}px`,
              height: `${pupilSize}px`,
              borderRadius: '50%',
              backgroundColor: pupilColor,
              position: 'relative',
              transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
              transition: 'transform 0.08s ease-out',
            }}
          >
            <div
              style={{
                width: `${pupilSize * 0.25}px`,
                height: `${pupilSize * 0.25}px`,
                borderRadius: '50%',
                backgroundColor: eyeColor,
                position: 'absolute',
                top: `${pupilSize * 0.15}px`,
                right: `${pupilSize * 0.15}px`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
