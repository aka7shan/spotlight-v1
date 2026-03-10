import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TypeWriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  cursorColor?: string;
  loop?: boolean;
}

export default function TypeWriter({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  className = '',
  style,
  cursorColor = 'currentColor',
  loop = true,
}: TypeWriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting' | 'done'>('typing');

  const getVariableSpeed = useCallback(
    () => typingSpeed + Math.random() * 40 - 20,
    [typingSpeed],
  );

  useEffect(() => {
    const current = texts[textIndex] ?? '';
    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case 'typing':
        if (charIndex < current.length) {
          timer = setTimeout(() => {
            setDisplayed(current.slice(0, charIndex + 1));
            setCharIndex((i) => i + 1);
          }, getVariableSpeed());
        } else if (texts.length > 1 && (loop || textIndex < texts.length - 1)) {
          setPhase('pausing');
        } else {
          setPhase('done');
        }
        break;

      case 'pausing':
        timer = setTimeout(() => setPhase('deleting'), pauseDuration);
        break;

      case 'deleting':
        if (displayed.length > 0) {
          timer = setTimeout(() => {
            setDisplayed((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        } else {
          setTextIndex((i) => (i + 1) % texts.length);
          setCharIndex(0);
          setPhase('typing');
        }
        break;

      case 'done':
        break;
    }

    return () => clearTimeout(timer);
  }, [displayed, charIndex, phase, textIndex, texts, loop, typingSpeed, deletingSpeed, pauseDuration, getVariableSpeed]);

  return (
    <span className={className} style={style}>
      {displayed}
      <motion.span
        style={{ color: cursorColor, marginLeft: '2px', display: 'inline-block' }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        |
      </motion.span>
    </span>
  );
}
