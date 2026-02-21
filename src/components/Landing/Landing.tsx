import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { ThemeType } from '../../store/useStore';

/* ─────────────── Theme options ─────────────── */
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
    id: 'netflix', label: 'Netflix', question: 'Are you a Binge Watcher?',
    icon: '🎬', color: '#e50914', gradient: 'from-red-900 to-red-600',
    description: 'Browse my portfolio like your favorite streaming platform',
  },
  {
    id: 'instagram', label: 'Instagram', question: 'Are you a Scroller?',
    icon: '📱', color: '#E1306C', gradient: 'from-pink-600 via-purple-600 to-orange-500',
    description: 'Swipe through my career like your social feed',
  },
  {
    id: 'terminal', label: 'Terminal', question: 'Are you a Developer?',
    icon: '💻', color: '#00ff00', gradient: 'from-green-900 to-green-600',
    description: 'Explore my portfolio through the command line',
  },
  {
    id: 'gpt', label: 'ChatGPT', question: 'Are you a Vibe Coder?',
    icon: '🤖', color: '#10a37f', gradient: 'from-emerald-900 to-teal-600',
    description: 'Chat with an AI version of me',
  },
  {
    id: 'arcade', label: 'Arcade', question: 'Are you a Gamer?',
    icon: '🕹️', color: '#00f0ff', gradient: 'from-purple-900 to-cyan-600',
    description: 'Play through my portfolio in a neon arcade',
  },
];

const storyTheme: ThemeOption = {
  id: 'story', label: 'Story Mode', question: '🔓 The Journey',
  icon: '✈️', color: '#f59e0b', gradient: 'from-amber-900 via-orange-800 to-yellow-600',
  description: 'Scroll through my life story — school, college, career, animated!',
  hidden: true,
};

/* ================================================================
   LANDING — Scroll-driven cinematic intro → Theme Picker
   ================================================================ */
export default function Landing() {
  const setTheme = useStore((s) => s.setTheme);

  const [showIntro, setShowIntro] = useState(true);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [storyUnlocked, setStoryUnlocked] = useState(false);
  const [showCheatBanner, setShowCheatBanner] = useState(false);

  /* ── Scroll-driven animation refs ── */
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start start', 'end end'],
  });

  /* ═══ Scene Transforms ═══
     Container = 700vh (desktop) / 400vh (mobile), sticky viewport = 100vh
     scrollYProgress 0 → 1
     Scene 1 (Hero):             0.00 – 0.20
     Scene 2 (Avatar center):    0.20 – 0.32
     Scene 3 (Portfolio):        0.34 – 0.50
     Scene 4 (Tired text):       0.52 – 0.58 (fades in, never out)
     Scene 5a (Char left):       0.58 – 0.72
     Scene 5b (Know text):       0.72 – 0.78 (fades in, never out)
     Scene 5c (Cards from right): 0.82 – 0.92 (final, homepage ends)
  */

  const heroBgOpacity = useTransform(scrollYProgress, [0, 0.08, 0.20], [1, 1, 0]);
  const heroNameOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15], [1, 1, 0]);
  const heroNameY = useTransform(scrollYProgress, [0.05, 0.18], [0, -80]);

  const avatarScale = useTransform(scrollYProgress, [0, 0.20, 0.32, 0.58, 0.70], [1, 1, 0.78, 0.78, 0.78]);
  const avatarY = useTransform(scrollYProgress, [0.20, 0.32], [0, 80]);
  const avatarX = useTransform(scrollYProgress, [0.58, 0.72], ['0%', '-30%']);
  const avatarGlowOpacity = useTransform(scrollYProgress, [0.24, 0.32, 0.90, 1.0], [0, 0.4, 0.4, 0]);

  const titleOpacity = useTransform(scrollYProgress, [0.34, 0.40, 0.48, 0.52], [0, 1, 1, 0]);

  // Persistent name near character — appears after hero name fades, never fades out
  const persistentNameOpacity = useTransform(scrollYProgress, [0.22, 0.30], [0, 1]);

  const tiredOpacity = useTransform(scrollYProgress, [0.52, 0.58], [0, 1]);
  const knowTextOpacity = useTransform(scrollYProgress, [0.72, 0.78], [0, 1]);
  const cardsOpacity = useTransform(scrollYProgress, [0.82, 0.90], [0, 1]);
  const cardsSlideX = useTransform(scrollYProgress, [0.82, 0.92], ['100%', '0%']);

  const blobOpacity = useTransform(scrollYProgress, [0.06, 0.18, 0.90, 1.0], [0, 1, 1, 0]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.03, 0.92, 1.0], [1, 0.6, 0.3, 0]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  /* ── Story Mode persistence ── */
  useEffect(() => {
    if (localStorage.getItem('story-unlocked') === 'true') setStoryUnlocked(true);
  }, []);

  /* ── Intro auto-dismiss ── */
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  /* ── Liquid blob cursor springs ── */
  const cursorX = useMotionValue(-500);
  const cursorY = useMotionValue(-500);
  const blob1X = useSpring(cursorX, { damping: 20, stiffness: 70, mass: 1.2 });
  const blob1Y = useSpring(cursorY, { damping: 20, stiffness: 70, mass: 1.2 });
  const blob2X = useSpring(cursorX, { damping: 30, stiffness: 50, mass: 1.5 });
  const blob2Y = useSpring(cursorY, { damping: 30, stiffness: 50, mass: 1.5 });
  const blob3X = useSpring(cursorX, { damping: 40, stiffness: 35, mass: 2 });
  const blob3Y = useSpring(cursorY, { damping: 40, stiffness: 35, mass: 2 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [cursorX, cursorY]);

  /* ── Konami code ── */
  useEffect(() => {
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;
    const h = (e: KeyboardEvent) => {
      if (e.key === seq[pos]) {
        pos++;
        if (pos === seq.length) {
          useStore.getState().findEasterEgg('konami');
          useStore.getState().unlockAchievement('konami');
          setShowCheatBanner(true);
          createConfetti();
          setTimeout(() => { setStoryUnlocked(true); localStorage.setItem('story-unlocked', 'true'); }, 1500);
          setTimeout(() => setShowCheatBanner(false), 3000);
          pos = 0;
        }
      } else { pos = 0; }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ── "hire me" easter egg ── */
  useEffect(() => {
    let typed = '';
    const h = (e: KeyboardEvent) => {
      typed += e.key.toLowerCase();
      if (typed.includes('hire me')) {
        useStore.getState().findEasterEgg('hire_me');
        useStore.getState().unlockAchievement('hire_me');
        typed = '';
        createConfetti();
      }
      if (typed.length > 20) typed = typed.slice(-20);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const allThemes = storyUnlocked ? [...themes, storyTheme] : themes;

  return (
    <div className="min-h-screen bg-[#050505] relative" style={{ overflowX: 'clip' }}>

      {/* ═══════ Scroll Progress Bar ═══════ */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] z-[90]"
        style={{
          width: progressWidth,
          background: 'linear-gradient(90deg, #e50914, #ff00aa, #00f0ff)',
          opacity: showIntro ? 0 : 1,
        }}
      />

      {/* ═══════ CHEAT ACTIVATED banner ═══════ */}
      <AnimatePresence>
        {showCheatBanner && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div className="absolute inset-0 bg-white"
              initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />
            <motion.div className="absolute inset-0 border-4 border-amber-500"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245,158,11,0.5), inset 0 0 20px rgba(245,158,11,0.2)',
                  '0 0 60px rgba(245,158,11,0.8), inset 0 0 60px rgba(245,158,11,0.4)',
                  '0 0 20px rgba(245,158,11,0.5), inset 0 0 20px rgba(245,158,11,0.2)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div className="relative z-10 text-center"
              initial={{ scale: 0.3, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
              <motion.p className="text-amber-500 text-sm tracking-[0.5em] font-mono mb-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                ↑↑↓↓←→←→BA
              </motion.p>
              <h1 className="text-5xl md:text-8xl font-black text-white mb-4"
                style={{ textShadow: '0 0 40px rgba(245,158,11,0.8), 0 0 80px rgba(245,158,11,0.4)' }}>
                CHEAT ACTIVATED
              </h1>
              <motion.div className="flex items-center justify-center gap-3"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <span className="text-4xl">✈️</span>
                <p className="text-xl md:text-2xl text-amber-400 font-semibold">STORY MODE UNLOCKED</p>
                <span className="text-4xl">✈️</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Intro — <AS /> splash ═══════ */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]"
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
                className="text-gray-500 mt-4 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Loading experience...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
           MAIN CONTENT — Scroll-Driven Cinematic Hero
         ═══════════════════════════════════════════════ */}
      <div
        className="transition-opacity duration-[800ms]"
        style={{
          opacity: showIntro ? 0 : 1,
          pointerEvents: showIntro ? 'none' : 'auto',
          transitionDelay: showIntro ? '0ms' : '300ms',
        }}
      >

        {/* ═══ Scroll Container ═══ */}
        <div ref={scrollContainerRef} className="relative h-[400vh] md:h-[700vh]">
          <div className="sticky top-0 h-screen w-full overflow-hidden">

            {/* ═══ Layer 1: Full background — fades on scroll ═══ */}
            <motion.div
              className="absolute inset-0 z-[1]"
              style={{ opacity: heroBgOpacity }}
            >
              <img
                src="/homepage.png"
                alt="Akarshan Sharma"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 30%' }}
                fetchPriority="high"
                decoding="async"
              />
            </motion.div>

            {/* ═══ Layer 2: Avatar glow ═══ */}
            <motion.div
              className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none"
              style={{ opacity: avatarGlowOpacity }}
            >
              <div
                className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 40%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
            </motion.div>

            {/* ═══ Layer 3: PORTFOLIO title ═══ */}
            <motion.div
              className="absolute inset-0 z-[3] pointer-events-none"
              style={{ opacity: titleOpacity }}
            >
              <div
                className="absolute inset-x-0 top-[18%] flex items-center justify-center select-none"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 10rem)' }}
              >
                {([
                  { char: 'P', rotate: -10, y: 6, size: 1.05 },
                  { char: 'O', rotate: 5, y: -4, size: 0.94 },
                  { char: 'R', rotate: -3, y: 5, size: 1.02 },
                  { char: 'T', rotate: 7, y: -7, size: 1.1 },
                  { char: 'F', rotate: -6, y: 3, size: 0.96 },
                  { char: 'O', rotate: 8, y: -4, size: 1.0 },
                  { char: 'L', rotate: -4, y: 6, size: 1.06 },
                  { char: 'I', rotate: 3, y: -2, size: 0.9 },
                  { char: 'O', rotate: -8, y: 4, size: 1.0 },
                ] as const).map((l, i) => (
                  <span
                    key={i}
                    className="inline-block font-black text-white leading-none"
                    style={{
                      transform: `rotate(${l.rotate}deg) translateY(${l.y}px)`,
                      fontSize: `${l.size}em`,
                    }}
                  >
                    {l.char}
                  </span>
                ))}
                <span
                  className="font-black text-white select-none ml-1"
                  style={{
                    fontSize: '0.3em',
                    transform: 'rotate(5deg) translateY(-1em)',
                    display: 'inline-block',
                  }}
                >
                  '25
                </span>
              </div>
            </motion.div>

            {/* ═══ Liquid cursor blobs ═══ */}
            <motion.div
              className="absolute inset-0 z-[4] pointer-events-none overflow-hidden"
              style={{ opacity: blobOpacity }}
            >
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 400, height: 400,
                  left: -200, top: -200,
                  x: blob1X, y: blob1Y,
                  background: 'radial-gradient(circle, rgba(255,0,136,0.22) 0%, rgba(255,0,136,0.05) 40%, transparent 70%)',
                  filter: 'blur(50px)',
                }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 350, height: 350,
                  left: -175, top: -175,
                  x: blob2X, y: blob2Y,
                  background: 'radial-gradient(circle, rgba(0,200,255,0.20) 0%, rgba(0,200,255,0.04) 40%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 300, height: 300,
                  left: -150, top: -150,
                  x: blob3X, y: blob3Y,
                  background: 'radial-gradient(circle, rgba(140,0,255,0.18) 0%, rgba(140,0,255,0.04) 40%, transparent 70%)',
                  filter: 'blur(45px)',
                }}
              />
            </motion.div>

            {/* ═══ Layer 5: Cutout avatar — always visible ═══ */}
            <motion.div
              className="absolute inset-0 z-[5] pointer-events-none"
              style={{ scale: avatarScale, y: avatarY, x: avatarX }}
            >
              <img
                src="/1000103078.png"
                alt="Akarshan"
                className="w-full h-full object-cover select-none"
                style={{ objectPosition: 'center 30%' }}
                draggable={false}
              />
            </motion.div>

            {/* ═══ Vignette — matches original dark edges ═══ */}
            <motion.div
              className="absolute inset-0 z-[6] pointer-events-none"
              style={{ opacity: heroBgOpacity }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, rgba(5,5,5,0.55) 100%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
            </motion.div>

            {/* ═══ Hero name text (Scene 1 — fades up on scroll) ═══ */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-[10] px-6 md:px-16 pb-16 md:pb-20"
              style={{ opacity: heroNameOpacity, y: heroNameY }}
            >
              <h1
                className="text-white font-black leading-[0.85] tracking-tight mb-3"
                style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}
              >
                Akarshan
                <br />
                <span className="text-white/90">Sharma</span>
              </h1>
              <p className="text-white/40 text-lg md:text-xl tracking-wide">
                Software Engineer
              </p>
            </motion.div>

            {/* ═══ Persistent name — near the character, bottom-right area ═══ */}
            <motion.div
              className="absolute z-[10] pointer-events-none"
              style={{
                opacity: persistentNameOpacity,
                right: '8%',
                bottom: '12%',
              }}
            >
              <div className="text-right">
                <p
                  className="text-white/50 font-bold tracking-[0.3em] uppercase"
                  style={{ fontSize: 'clamp(0.65rem, 1.4vw, 0.95rem)' }}
                >
                  Akarshan Sharma
                </p>
                <p className="text-white/25 text-[10px] tracking-[0.2em] mt-1">
                  SOFTWARE ENGINEER
                </p>
              </div>
            </motion.div>

            {/* ═══ Scene 4: "Tired of boring portfolios?" — top-left, never fades out ═══ */}
            <motion.div
              className="absolute z-[10] pointer-events-none hidden md:block"
              style={{
                opacity: tiredOpacity,
                left: '5%',
                top: '10%',
              }}
            >
              <div className="max-w-[400px] md:max-w-[500px]">
                <h2 className="font-black leading-[1.05]" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
                  <span className="text-white">Tired </span>
                  <span className="text-white/30 font-light" style={{ fontSize: '0.55em' }}>of</span><br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">boring</span>{' '}
                  <span className="text-white italic">portfolios</span>
                  <span className="text-pink-500">?</span>
                </h2>
              </div>
            </motion.div>

            {/* ═══ Scene 5a: "Know about me..." — center area, never fades out ═══ */}
            <motion.div
              className="absolute z-[10] pointer-events-none hidden md:block"
              style={{
                opacity: knowTextOpacity,
                left: '30%',
                top: '25%',
                width: '22%',
              }}
            >
              <div>
                <p className="text-white/15 text-[10px] tracking-[0.4em] uppercase mb-3">Choose your experience</p>
                <h2 className="font-black leading-[1.1]" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)' }}>
                  <span className="text-white/50 font-light italic" style={{ fontSize: '0.7em' }}>know about</span><br />
                  <span className="text-white">me </span>
                  <span className="text-white/30 font-light" style={{ fontSize: '0.6em' }}>in the</span><br />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">style</span>{' '}
                  <span className="text-white/30 font-light" style={{ fontSize: '0.6em' }}>of your</span><br />
                  <span className="text-white">liking.</span>
                </h2>
              </div>
            </motion.div>

            {/* ═══ Scene 5b: Theme cards — slide from RIGHT (desktop only) ═══ */}
            <motion.div
              className="absolute z-[12] pointer-events-auto overflow-hidden hidden md:block"
              style={{
                opacity: cardsOpacity,
                x: cardsSlideX,
                top: '3%',
                right: '0',
                width: '46%',
                height: '94%',
                paddingRight: '2rem',
                paddingLeft: '1rem',
                paddingTop: '1rem',
                paddingBottom: '1rem',
              }}
            >
              <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full">
                {allThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isHovered={hoveredTheme === theme.id}
                    onHover={() => setHoveredTheme(theme.id)}
                    onLeave={() => setHoveredTheme(null)}
                    onClick={() => setTheme(theme.id)}
                  />
                ))}
              </div>
            </motion.div>

            {/* ─── Scroll indicator ─── */}
            <motion.div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20] flex flex-col items-center gap-2"
              style={{ opacity: scrollIndicatorOpacity }}
            >
              <p className="text-white/30 text-xs tracking-[0.2em] uppercase">Scroll to explore</p>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5">
                  <motion.div
                    className="w-1 h-1 rounded-full bg-white/30"
                    animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* ═══ Mobile: "Pick your vibe" + single-column cards (normal scroll) ═══ */}
        <section className="md:hidden relative z-20 px-5 pt-12 pb-20 bg-[#050505]">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-black leading-[1.05] text-3xl mb-4">
              <span className="text-white">Tired </span>
              <span className="text-white/30 font-light text-lg">of</span><br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">boring</span>{' '}
              <span className="text-white italic">portfolios</span>
              <span className="text-pink-500">?</span>
            </h2>
          </motion.div>

          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/25 text-xs tracking-[0.4em] uppercase mb-3">Choose your experience</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Pick your vibe</h2>
            <div
              className="h-px w-16 mx-auto mt-5"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
            />
          </motion.div>

          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {allThemes.map((theme) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4 }}
              >
                <ThemeCard
                  theme={theme}
                  isHovered={hoveredTheme === theme.id}
                  onHover={() => setHoveredTheme(theme.id)}
                  onLeave={() => setHoveredTheme(null)}
                  onClick={() => setTheme(theme.id)}
                />
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-xs text-white/20 mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {storyUnlocked
              ? 'You unlocked Story Mode! There are more easter eggs to find...'
              : 'Tip: There are hidden easter eggs. Try the Konami code!'}
          </motion.p>
        </section>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   3D Tilt Theme Card — with Mini CSS Preview
   ═══════════════════════════════════════════════ */
function ThemeCard({
  theme, isHovered, onHover, onLeave, onClick,
}: {
  theme: ThemeOption;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: yRatio * -10, y: xRatio * 10 });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
    onLeave();
  };

  const cardVariants = {
    hidden: theme.hidden
      ? { opacity: 0, scale: 0.5, rotateY: 180 }
      : { opacity: 0, y: 50 },
    visible: theme.hidden
      ? { opacity: 1, scale: 1, rotateY: 0, transition: { type: 'spring', stiffness: 150, damping: 15 } }
      : { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  };

  return (
    <motion.button
      ref={cardRef}
      className={`group relative rounded-xl overflow-hidden cursor-pointer text-left h-full flex flex-col ${
        theme.hidden ? 'ring-1 ring-amber-500/40' : ''
      }`}
      style={{
        background: `linear-gradient(165deg, ${theme.color}12 0%, rgba(10,10,10,0.95) 50%, ${theme.color}08 100%)`,
        border: `1px solid ${isHovered ? theme.color + '40' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isHovered
          ? `0 16px 40px -8px ${theme.color}25, 0 0 0 1px ${theme.color}20`
          : '0 2px 12px -2px rgba(0,0,0,0.4)',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? -4 : 0}px)`,
        transition: 'transform 0.2s ease-out, border-color 0.3s, box-shadow 0.3s',
      }}
      variants={cardVariants}
      whileTap={{ scale: 0.97 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHover}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {theme.hidden && (
        <div className="absolute top-2 right-2 z-20 bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/30">
          SECRET
        </div>
      )}

      <div className="relative m-2 mb-0 rounded-lg overflow-hidden flex-1 min-h-[60px] md:min-h-0">
        <ThemePreview id={theme.id} color={theme.color} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="relative z-10 p-3 pt-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">{theme.icon}</span>
          <span
            className="text-[10px] font-semibold tracking-wider uppercase transition-colors duration-300"
            style={{ color: isHovered ? theme.color : 'rgba(255,255,255,0.35)' }}
          >
            {theme.label}
          </span>
        </div>

        <h3 className="text-sm font-bold text-white mb-1 leading-tight">
          {theme.question}
        </h3>

        <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors leading-snug line-clamp-2">
          {theme.description}
        </p>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════
   Mini CSS Theme Previews
   ═══════════════════════════════════════════════ */
function ThemePreview({ id, color }: { id: string; color: string }) {
  switch (id) {
    case 'netflix':
      return (
        <div className="w-full h-full bg-[#141414] p-3 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-3 bg-red-600 rounded-sm font-black text-[6px] text-white flex items-center justify-center">N</div>
            <div className="flex gap-1.5">
              {['Home', 'Skills', 'Work'].map((t) => (
                <span key={t} className="text-[6px] text-white/40">{t}</span>
              ))}
            </div>
          </div>
          <div className="w-full h-10 bg-gradient-to-r from-red-900/60 to-red-900/20 rounded mb-2 flex items-end p-1.5">
            <div className="w-12 h-1 bg-white/60 rounded-full" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="text-[5px] text-white/30 pl-0.5">Trending Now</div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 h-7 rounded-sm" style={{ background: `hsl(${350 + i * 8}, 60%, ${18 + i * 3}%)` }} />
              ))}
            </div>
            <div className="text-[5px] text-white/30 pl-0.5">Top Picks</div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 h-7 rounded-sm" style={{ background: `hsl(${340 + i * 12}, 50%, ${15 + i * 2}%)` }} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'instagram':
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-3 flex flex-col">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
              <div className="w-full h-full rounded-full border-2 border-[#1a1a2e] flex items-center justify-center text-[6px] text-white">AS</div>
            </div>
            <div className="flex-1">
              <div className="text-[7px] text-white/80 font-semibold">akarshan.dev</div>
              <div className="text-[5px] text-white/30">Software Engineer</div>
            </div>
            <div className="px-2 py-0.5 bg-blue-500 rounded text-[5px] text-white">Follow</div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-0.5 rounded overflow-hidden">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square" style={{
                background: [
                  'linear-gradient(135deg, #667eea, #764ba2)',
                  'linear-gradient(135deg, #f093fb, #f5576c)',
                  'linear-gradient(135deg, #4facfe, #00f2fe)',
                  'linear-gradient(135deg, #43e97b, #38f9d7)',
                  'linear-gradient(135deg, #fa709a, #fee140)',
                  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
                  'linear-gradient(135deg, #fccb90, #d57eeb)',
                  'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
                  'linear-gradient(135deg, #f5576c, #ff9a9e)',
                ][i],
              }} />
            ))}
          </div>
        </div>
      );

    case 'terminal':
      return (
        <div className="w-full h-full bg-[#0c0c0c] p-2.5 flex flex-col font-mono">
          <div className="flex items-center gap-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]" />
            <span className="text-[6px] text-white/20 ml-2">akarshan@portfolio ~</span>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 text-[7px] leading-relaxed">
            <p><span className="text-green-400">❯</span> <span className="text-white/60">whoami</span></p>
            <p className="text-green-300/80">akarshan sharma</p>
            <p><span className="text-green-400">❯</span> <span className="text-white/60">cat skills.json</span></p>
            <p className="text-yellow-300/60">{'{'} "react", "node", "aws" {'}'}</p>
            <p><span className="text-green-400">❯</span> <span className="text-white/60">ls projects/</span></p>
            <p className="text-blue-300/60">spotlight/ estimator/ billing/</p>
            <p className="flex items-center">
              <span className="text-green-400">❯</span>
              <span className="w-1.5 h-3 bg-green-400 ml-1 animate-blink" />
            </p>
          </div>
        </div>
      );

    case 'gpt':
      return (
        <div className="w-full h-full bg-[#0d1117] p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[5px] text-white font-bold">AI</div>
            <span className="text-[7px] text-white/50">ChatGPT · Akarshan Mode</span>
          </div>
          <div className="bg-white/[0.04] rounded-lg px-2 py-1.5 max-w-[80%] self-end">
            <p className="text-[6px] text-white/60">Tell me about your experience</p>
          </div>
          <div className="bg-emerald-900/20 rounded-lg px-2 py-1.5 max-w-[85%] self-start border border-emerald-500/10">
            <p className="text-[6px] text-emerald-300/70">I'm a Software Engineer at Amdocs with 3+ years of experience in React, Python & AWS...</p>
          </div>
          <div className="bg-white/[0.04] rounded-lg px-2 py-1.5 max-w-[70%] self-end">
            <p className="text-[6px] text-white/60">What are your top skills?</p>
          </div>
          <div className="flex gap-0.5 px-2 self-start">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-emerald-400/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      );

    case 'arcade':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: '#0a0a1a' }}>
          <div className="text-[8px] font-bold text-center mb-2 tracking-[0.2em]" style={{ fontFamily: 'monospace', color: '#00f0ff', textShadow: '0 0 8px #00f0ff80' }}>
            ARCADE QUEST
          </div>
          <div className="w-[80%] flex flex-col gap-1">
            {['▸ STATS', '  QUESTS', '  GAMES', '  CONTACT'].map((item, i) => (
              <div
                key={i}
                className="text-[7px] text-center rounded px-2 py-0.5"
                style={{
                  fontFamily: 'monospace',
                  color: i === 0 ? '#0a0a1a' : '#00f0ff',
                  background: i === 0 ? '#00f0ff' : 'transparent',
                  border: i === 0 ? 'none' : '1px solid #00f0ff30',
                  textShadow: i !== 0 ? '0 0 4px #00f0ff40' : 'none',
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="text-[5px] mt-2" style={{ color: '#ff00aa80', fontFamily: 'monospace' }}>
            INSERT COIN TO PLAY
          </div>
        </div>
      );

    case 'story':
      return (
        <div className="w-full h-full bg-gradient-to-b from-amber-950/30 to-[#0a0a0a] p-3 flex items-center justify-center">
          <div className="flex flex-col items-center gap-0 relative">
            <div className="absolute top-1 bottom-1 w-px bg-amber-500/30" />
            {[
              { emoji: '🏫', label: 'School', year: '2017' },
              { emoji: '🎓', label: 'Thapar', year: '2019' },
              { emoji: '💼', label: 'Dresma', year: '2023' },
              { emoji: '🚀', label: 'Amdocs', year: '2023' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 relative z-10 my-1">
                <span className="text-[6px] text-amber-400/50 w-6 text-right">{item.year}</span>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <span className="text-[6px]">{item.emoji}</span>
                </div>
                <span className="text-[7px] text-white/50">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="w-full h-full" style={{ background: `${color}15` }} />;
  }
}

/* ═══════════════════════════════════════════════
   Confetti
   ═══════════════════════════════════════════════ */
function createConfetti() {
  const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de', '#fff'];
  for (let i = 0; i < 150; i++) {
    const c = document.createElement('div');
    const size = Math.random() * 10 + 5;
    const isCircle = Math.random() > 0.5;
    c.style.cssText = `
      position: fixed; width: ${size}px; height: ${isCircle ? size : size * 2.5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw; top: -20px; z-index: 9999;
      border-radius: ${isCircle ? '50%' : '2px'}; pointer-events: none;
      animation: confetti-fall ${2 + Math.random() * 3}s ease-in forwards;
      animation-delay: ${Math.random() * 0.5}s; opacity: 0;
    `;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }
  if (!document.querySelector('#confetti-style')) {
    const s = document.createElement('style');
    s.id = 'confetti-style';
    s.textContent = `
      @keyframes confetti-fall {
        0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        25%  { opacity: 1; }
        100% { transform: translateY(100vh) rotate(${360 + Math.random() * 720}deg) scale(0.5); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }
}
