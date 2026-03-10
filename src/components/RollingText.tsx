import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface RollingTextProps {
  text: string;
  className?: string;
  duplicateCount?: number;
  rollDuration?: number;
  staggerDelay?: number;
  blurIntensity?: number;
  textColor?: string;
  pattern?: 'sequential' | 'alternating';
}

export default function RollingText({
  text,
  className = '',
  duplicateCount = 8,
  rollDuration = 2,
  staggerDelay = 0.1,
  blurIntensity = 8,
  textColor = '#FFFFFF',
  pattern = 'alternating',
}: RollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      {text.split('').map((char, index) => (
        <CharColumn
          key={`${char}-${index}`}
          character={char}
          duplicateCount={duplicateCount}
          rollDuration={rollDuration}
          delay={index * staggerDelay}
          blurIntensity={blurIntensity}
          isAnimating={isAnimating}
          textColor={textColor}
          rollFromBottom={pattern === 'alternating' && index % 2 === 1}
        />
      ))}
    </div>
  );
}

function CharColumn({
  character,
  duplicateCount,
  rollDuration,
  delay,
  blurIntensity,
  isAnimating,
  textColor,
  rollFromBottom,
}: {
  character: string;
  duplicateCount: number;
  rollDuration: number;
  delay: number;
  blurIntensity: number;
  isAnimating: boolean;
  textColor: string;
  rollFromBottom: boolean;
}) {
  if (character === ' ') {
    return <span style={{ width: '0.3em' }} />;
  }

  const duplicates = Array(duplicateCount).fill(character);
  const charHeight = 1; // in em units
  const totalScroll = charHeight * (duplicateCount - 1);

  const initialY = rollFromBottom ? `-${totalScroll}em` : '0em';
  const finalY = rollFromBottom ? '0em' : `-${totalScroll}em`;

  return (
    <div style={{ height: `${charHeight}em`, overflow: 'hidden', display: 'inline-flex' }}>
      <motion.div
        style={{ display: 'flex', flexDirection: 'column' }}
        initial={{ y: initialY }}
        animate={isAnimating ? { y: finalY } : { y: initialY }}
        transition={{
          duration: rollDuration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: 'tween',
        }}
      >
        {duplicates.map((char, i) => (
          <motion.span
            key={i}
            style={{
              color: textColor,
              height: `${charHeight}em`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
            initial={{ filter: 'blur(0px)' }}
            animate={
              isAnimating
                ? { filter: ['blur(0px)', `blur(${blurIntensity}px)`, `blur(${blurIntensity}px)`, 'blur(0px)'] }
                : { filter: 'blur(0px)' }
            }
            transition={{
              duration: rollDuration,
              delay,
              times: [0, 0.2, 0.8, 1],
              ease: 'easeOut',
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
