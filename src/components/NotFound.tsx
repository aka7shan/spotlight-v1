import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

function useGlitchText(text: string, active: boolean) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setDisplay(
        text
          .split('')
          .map((ch) =>
            Math.random() < 0.3 && frame % 3 === 0
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : ch,
          )
          .join(''),
      );
      if (frame > 20) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [text, active]);

  return display;
}

export default function NotFound() {
  const navigate = useNavigate();
  const [glitch, setGlitch] = useState(true);
  const title = useGlitchText('404', glitch);
  const subtitle = useGlitchText('PAGE_NOT_FOUND', glitch);

  useEffect(() => {
    const t = setTimeout(() => setGlitch(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }}
      />

      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Terminal-style error */}
        <div className="font-mono mb-8">
          <div className="flex items-center gap-1.5 mb-4 justify-center">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="text-white/20 text-xs ml-2">akarshan@portfolio ~</span>
          </div>

          <p className="text-green-400 text-sm mb-2">
            <span className="text-green-500">❯</span> navigate {window.location.pathname}
          </p>
          <p className="text-red-400 text-sm mb-6">
            bash: {window.location.pathname}: No such route or directory
          </p>
        </div>

        <motion.h1
          className="text-8xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 leading-none mb-4"
          animate={glitch ? { x: [0, -2, 3, -1, 0] } : {}}
          transition={{ duration: 0.1, repeat: glitch ? Infinity : 0 }}
        >
          {title}
        </motion.h1>

        <p className="text-white/30 font-mono text-sm tracking-[0.3em] mb-10">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <motion.button
            className="px-6 py-3 bg-white text-black font-bold rounded-lg text-sm tracking-wide"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </motion.button>
          <motion.button
            className="px-6 py-3 border border-white/15 text-white/60 rounded-lg text-sm tracking-wide hover:border-white/30 hover:text-white/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/terminal')}
          >
            Open Terminal
          </motion.button>
        </div>

        <p className="text-white/10 text-xs mt-12 font-mono">
          exit code: 404 &middot; elapsed: {(Math.random() * 100).toFixed(0)}ms
        </p>
      </motion.div>
    </div>
  );
}
