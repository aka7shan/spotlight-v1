import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { ThemeType } from '../../store/useStore';

interface ThemeOption {
  id: ThemeType;
  label: string;
  question: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  hidden?: boolean;
}

const themes: ThemeOption[] = [
  {
    id: 'netflix',
    label: 'Netflix',
    question: 'Are you a Binge Watcher?',
    icon: '🎬',
    color: '#e50914',
    gradient: 'from-red-900 to-red-600',
    description: 'Browse my portfolio like your favorite streaming platform',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    question: 'Are you a Scroller?',
    icon: '📱',
    color: '#E1306C',
    gradient: 'from-pink-600 via-purple-600 to-orange-500',
    description: 'Swipe through my career like your social feed',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    question: 'Are you a Developer?',
    icon: '💻',
    color: '#00ff00',
    gradient: 'from-green-900 to-green-600',
    description: 'Explore my portfolio through the command line',
  },
  {
    id: 'gpt',
    label: 'ChatGPT',
    question: 'Are you a Vibe Coder?',
    icon: '🤖',
    color: '#10a37f',
    gradient: 'from-emerald-900 to-teal-600',
    description: 'Chat with an AI version of me',
  },
  {
    id: 'gameboy',
    label: 'GameBoy',
    question: 'Are you a Gamer?',
    icon: '🎮',
    color: '#9bbc0f',
    gradient: 'from-lime-900 to-yellow-600',
    description: 'Play through my portfolio RPG style',
  },
];

const storyTheme: ThemeOption = {
  id: 'story',
  label: 'Story Mode',
  question: '🔓 The Journey',
  icon: '✈️',
  color: '#f59e0b',
  gradient: 'from-amber-900 via-orange-800 to-yellow-600',
  description: 'Scroll through my life story — school, college, career, animated!',
  hidden: true,
};

export default function Landing() {
  const setTheme = useStore((s) => s.setTheme);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [storyUnlocked, setStoryUnlocked] = useState(false);
  const [showCheatBanner, setShowCheatBanner] = useState(false);

  // Check if already unlocked from previous visit
  useEffect(() => {
    const unlocked = localStorage.getItem('story-unlocked');
    if (unlocked === 'true') setStoryUnlocked(true);
  }, []);

  // Konami code easter egg — triggers confetti + banner + unlocks Story Mode
  useEffect(() => {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === konami[pos]) {
        pos++;
        if (pos === konami.length) {
          // Unlock achievements
          useStore.getState().findEasterEgg('konami');
          useStore.getState().unlockAchievement('konami');

          // Show CHEAT ACTIVATED banner
          setShowCheatBanner(true);

          // Fire confetti
          createConfetti();

          // Unlock Story Mode after banner
          setTimeout(() => {
            setStoryUnlocked(true);
            localStorage.setItem('story-unlocked', 'true');
          }, 1500);

          // Hide banner
          setTimeout(() => {
            setShowCheatBanner(false);
          }, 3000);

          pos = 0;
        }
      } else {
        pos = 0;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // "hire me" easter egg
  useEffect(() => {
    let typed = '';
    const handler = (e: KeyboardEvent) => {
      typed += e.key.toLowerCase();
      if (typed.includes('hire me')) {
        useStore.getState().findEasterEgg('hire_me');
        useStore.getState().unlockAchievement('hire_me');
        typed = '';
        createConfetti();
      }
      if (typed.length > 20) typed = typed.slice(-20);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Intro animation
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const allThemes = storyUnlocked ? [...themes, storyTheme] : themes;

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* CHEAT ACTIVATED Full-screen Banner */}
      <AnimatePresence>
        {showCheatBanner && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Flash background */}
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Glowing border pulse */}
            <motion.div
              className="absolute inset-0 border-4 border-amber-500"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245,158,11,0.5), inset 0 0 20px rgba(245,158,11,0.2)',
                  '0 0 60px rgba(245,158,11,0.8), inset 0 0 60px rgba(245,158,11,0.4)',
                  '0 0 20px rgba(245,158,11,0.5), inset 0 0 20px rgba(245,158,11,0.2)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Main text */}
            <motion.div
              className="relative z-10 text-center"
              initial={{ scale: 0.3, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <motion.p
                className="text-amber-500 text-sm tracking-[0.5em] font-mono mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ↑↑↓↓←→←→BA
              </motion.p>
              <h1 className="text-5xl md:text-8xl font-black text-white mb-4"
                style={{
                  textShadow: '0 0 40px rgba(245,158,11,0.8), 0 0 80px rgba(245,158,11,0.4)',
                }}
              >
                CHEAT ACTIVATED
              </h1>
              <motion.div
                className="flex items-center justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-4xl">✈️</span>
                <p className="text-xl md:text-2xl text-amber-400 font-semibold">
                  STORY MODE UNLOCKED
                </p>
                <span className="text-4xl">✈️</span>
              </motion.div>
              <motion.p
                className="text-gray-400 text-sm mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Scroll through the journey of Akarshan Sharma
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div className="text-center">
              <motion.h1
                className="text-5xl md:text-7xl font-black text-white mb-4"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {'<AS />'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="inline-block"
                    style={{ color: i < 1 || i > 3 ? '#e50914' : 'white' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.div
                className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
              <motion.p
                className="text-gray-400 mt-4 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Loading experience...
              </motion.p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3">
            Akarshan Sharma
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-6">
            Software Engineer
          </p>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8" />
          <motion.p
            className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2 }}
          >
            How do you browse the internet?
          </motion.p>
          <motion.p
            className="text-sm text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
          >
            Choose your experience 👇
          </motion.p>
        </motion.div>

        {/* Theme Cards */}
        <motion.div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl w-full px-4 ${
            storyUnlocked ? 'xl:grid-cols-6' : 'xl:grid-cols-5'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4, duration: 0.6 }}
        >
          {allThemes.map((theme, index) => (
            <motion.button
              key={theme.id}
              className={`group relative rounded-2xl overflow-hidden border bg-white/5 backdrop-blur-sm cursor-pointer ${
                theme.hidden
                  ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'border-white/10'
              }`}
              style={{ minHeight: '220px' }}
              initial={theme.hidden ? { opacity: 0, scale: 0.5, rotateY: 180 } : { opacity: 0, y: 30 }}
              animate={theme.hidden ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 1, y: 0 }}
              transition={theme.hidden
                ? { type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }
                : { delay: 3.5 + index * 0.15, duration: 0.5 }
              }
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredTheme(theme.id)}
              onMouseLeave={() => setHoveredTheme(null)}
              onClick={() => setTheme(theme.id)}
            >
              {/* Gradient overlay on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
              />

              {/* Glow effect */}
              <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${theme.color}33, transparent, ${theme.color}33)`,
                }}
              />

              {/* Secret badge for Story */}
              {theme.hidden && (
                <div className="absolute top-2 right-2 z-20 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  🔓 SECRET
                </div>
              )}

              <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center text-center">
                <motion.span
                  className="text-5xl mb-4 block"
                  animate={hoveredTheme === theme.id ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {theme.icon}
                </motion.span>

                <h3
                  className="text-lg font-bold text-white mb-1 group-hover:text-opacity-100"
                  style={{ color: hoveredTheme === theme.id ? theme.color : 'white' }}
                >
                  {theme.question}
                </h3>

                <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors mt-2">
                  {theme.description}
                </p>

                <motion.div
                  className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: theme.color + '22', color: theme.color, border: `1px solid ${theme.color}44` }}
                >
                  Enter {theme.label} →
                </motion.div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer hint */}
        <motion.p
          className="text-xs text-gray-600 mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
        >
          {storyUnlocked
            ? '🎉 You unlocked Story Mode! There are more easter eggs to find...'
            : '💡 Tip: There are hidden easter eggs scattered throughout. Try ↑↑↓↓←→←→BA'
          }
        </motion.p>
      </motion.div>
    </div>
  );
}

// Confetti effect
function createConfetti() {
  const colors = ['#e50914', '#00ff00', '#10a37f', '#E1306C', '#9bbc0f', '#f59e0b', '#fff', '#8b5cf6'];
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    const size = Math.random() * 10 + 5;
    const isCircle = Math.random() > 0.5;
    confetti.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${isCircle ? size : size * 2.5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -20px;
      z-index: 9999;
      border-radius: ${isCircle ? '50%' : '2px'};
      pointer-events: none;
      animation: confetti-fall ${2 + Math.random() * 3}s ease-in forwards;
      animation-delay: ${Math.random() * 0.5}s;
      opacity: 0;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 6000);
  }

  if (!document.querySelector('#confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        25% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(${360 + Math.random() * 720}deg) scale(0.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
