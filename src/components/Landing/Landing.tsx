import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { ThemeType } from '../../store/useStore';

/* homepage.png lives in public/ — served as-is by Vite at /homepage.png
   For best perf: convert to WebP (saves ~60-70% size) and add to public/ */

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

/* ─────────────── Floating blobs ─────────────── */
const blobs = [
  { size: 320, x: '8%',  y: '15%', color: 'rgba(102,126,234,0.06)', dur: 22 },
  { size: 220, x: '78%', y: '55%', color: 'rgba(118,75,162,0.05)',  dur: 26 },
  { size: 180, x: '55%', y: '8%',  color: 'rgba(240,147,251,0.04)', dur: 19 },
  { size: 120, x: '18%', y: '72%', color: 'rgba(102,126,234,0.05)', dur: 24 },
  { size: 260, x: '68%', y: '78%', color: 'rgba(118,75,162,0.04)',  dur: 30 },
];

/* ================================================================
   LANDING PAGE — <AS /> Intro → Full-screen Hero → Theme Picker
   ================================================================ */
export default function Landing() {
  const setTheme = useStore((s) => s.setTheme);

  const [showIntro, setShowIntro] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [storyUnlocked, setStoryUnlocked] = useState(false);
  const [showCheatBanner, setShowCheatBanner] = useState(false);

  /* ── Story Mode persistence ── */
  useEffect(() => {
    if (localStorage.getItem('story-unlocked') === 'true') setStoryUnlocked(true);
  }, []);

  /* ── <AS /> intro animation (2.5s then auto-dismiss) ── */
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  /* ── Mouse tracking for spotlight ── */
  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

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
      } else {
        pos = 0;
      }
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
    <div className="min-h-screen bg-black relative overflow-x-hidden">

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

      {/* ═══════════════════════════════════════
           Intro — <AS /> splash screen
         ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showIntro && (
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
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
           Main Landing — Hero image + theme cards
         ═══════════════════════════════════════ */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{ pointerEvents: showIntro ? 'none' : 'auto' }}
      >
        {/* Spotlight cursor */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.03), transparent 40%)`,
          }}
        />

        {/* Floating blobs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {blobs.map((b, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: b.size, height: b.size,
                left: b.x, top: b.y,
                background: b.color,
                filter: 'blur(80px)',
              }}
              animate={{
                x: [0, 30, -25, 0],
                y: [0, -25, 35, 0],
                scale: [1, 1.1, 0.95, 1],
              }}
              transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* ══════════ HERO SECTION ══════════ */}
        <section className="relative h-screen overflow-hidden">
          {/* Background illustration — optimised loading */}
          <div className="absolute inset-0 z-0">
            <img
              src="/homepage.png"
              alt="Akarshan Sharma"
              className="w-full h-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          {/* Gradient overlay — dark at bottom for text, subtle at top to preserve image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-black/30 z-[2]" />

          {/* Name + CTA — pinned to bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-16 pb-28 md:pb-32">
            <motion.h1
              className="text-white font-black leading-[0.85] tracking-tight mb-4"
              style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Akarshan
              <br />
              <span className="text-white/90">Sharma</span>
            </motion.h1>

            <motion.p
              className="text-white/40 text-lg md:text-xl tracking-wide mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Software Engineer
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <p className="text-white/60 text-xl md:text-2xl font-light">
                How do you browse the internet?
              </p>
              <p className="text-white/30 text-sm mt-2">Choose your experience ↓</p>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
                <motion.div
                  className="w-1 h-1 rounded-full bg-white/40"
                  animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════ THEME CARDS ══════════ */}
        <section className="relative z-20 px-4 md:px-8 pt-24 pb-32 bg-[#0a0a0a]">
          {/* Section heading */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/25 text-xs tracking-[0.4em] uppercase mb-3">Choose your experience</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Pick your vibe</h2>
            <div
              className="h-px w-16 mx-auto mt-5"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
            />
          </motion.div>

          {/* Cards grid — 3 columns on desktop for better card proportions */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
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
          </motion.div>

          {/* Footer hint */}
          <motion.p
            className="text-xs text-white/20 mt-20 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {storyUnlocked
              ? '🎉 You unlocked Story Mode! There are more easter eggs to find...'
              : '💡 Tip: There are hidden easter eggs. Try ↑↑↓↓←→←→BA'}
          </motion.p>
        </section>
      </motion.div>
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
      className={`group relative rounded-2xl overflow-hidden cursor-pointer text-left ${
        theme.hidden ? 'ring-1 ring-amber-500/40' : ''
      }`}
      style={{
        background: `linear-gradient(165deg, ${theme.color}08 0%, rgba(255,255,255,0.02) 50%, ${theme.color}05 100%)`,
        border: `1px solid ${isHovered ? theme.color + '40' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isHovered
          ? `0 20px 50px -12px ${theme.color}25, 0 0 0 1px ${theme.color}20`
          : '0 4px 20px -4px rgba(0,0,0,0.3)',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? -6 : 0}px)`,
        transition: 'transform 0.2s ease-out, border-color 0.3s, box-shadow 0.3s',
      }}
      variants={cardVariants}
      whileTap={{ scale: 0.97 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHover}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {/* SECRET badge */}
      {theme.hidden && (
        <div className="absolute top-3 right-3 z-20 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
          🔓 SECRET
        </div>
      )}

      {/* ── Mini theme preview ── */}
      <div className="relative m-3 mb-0 rounded-xl overflow-hidden" style={{ height: '130px' }}>
        <ThemePreview id={theme.id} color={theme.color} />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* ── Card body ── */}
      <div className="relative z-10 p-5 pt-4">
        {/* Theme label + icon */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{theme.icon}</span>
          <span
            className="text-xs font-semibold tracking-wider uppercase transition-colors duration-300"
            style={{ color: isHovered ? theme.color : 'rgba(255,255,255,0.35)' }}
          >
            {theme.label}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-lg font-bold text-white mb-1.5 leading-tight">
          {theme.question}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/30 group-hover:text-white/50 transition-colors leading-relaxed mb-4">
          {theme.description}
        </p>

        {/* CTA */}
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
          style={{ color: theme.color }}
        >
          Enter {theme.label}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════
   Mini CSS Theme Previews
   Each renders a tiny visual mockup of the theme
   ═══════════════════════════════════════════════ */
function ThemePreview({ id, color }: { id: string; color: string }) {
  switch (id) {
    /* ── Netflix: dark bg, red accent, thumbnail rows ── */
    case 'netflix':
      return (
        <div className="w-full h-full bg-[#141414] p-3 flex flex-col">
          {/* Nav bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-3 bg-red-600 rounded-sm font-black text-[6px] text-white flex items-center justify-center">N</div>
            <div className="flex gap-1.5">
              {['Home', 'Skills', 'Work'].map((t) => (
                <span key={t} className="text-[6px] text-white/40">{t}</span>
              ))}
            </div>
          </div>
          {/* Hero banner */}
          <div className="w-full h-10 bg-gradient-to-r from-red-900/60 to-red-900/20 rounded mb-2 flex items-end p-1.5">
            <div className="w-12 h-1 bg-white/60 rounded-full" />
          </div>
          {/* Thumbnail rows */}
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

    /* ── Instagram: feed layout with avatar + grid ── */
    case 'instagram':
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-3 flex flex-col">
          {/* Profile header */}
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
          {/* Photo grid */}
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

    /* ── Terminal: dark bg, green text, blinking cursor ── */
    case 'terminal':
      return (
        <div className="w-full h-full bg-[#0c0c0c] p-2.5 flex flex-col font-mono">
          {/* Window chrome */}
          <div className="flex items-center gap-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]" />
            <span className="text-[6px] text-white/20 ml-2">akarshan@portfolio ~</span>
          </div>
          {/* Terminal lines */}
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

    /* ── GPT: chat interface with bubbles ── */
    case 'gpt':
      return (
        <div className="w-full h-full bg-[#0d1117] p-3 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[5px] text-white font-bold">AI</div>
            <span className="text-[7px] text-white/50">ChatGPT · Akarshan Mode</span>
          </div>
          {/* Chat bubbles */}
          <div className="bg-white/[0.04] rounded-lg px-2 py-1.5 max-w-[80%] self-end">
            <p className="text-[6px] text-white/60">Tell me about your experience</p>
          </div>
          <div className="bg-emerald-900/20 rounded-lg px-2 py-1.5 max-w-[85%] self-start border border-emerald-500/10">
            <p className="text-[6px] text-emerald-300/70">I'm a Software Engineer at Amdocs with 3+ years of experience in React, Python & AWS...</p>
          </div>
          <div className="bg-white/[0.04] rounded-lg px-2 py-1.5 max-w-[70%] self-end">
            <p className="text-[6px] text-white/60">What are your top skills?</p>
          </div>
          {/* Typing indicator */}
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

    /* ── Arcade: neon cyberpunk screen ── */
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

    /* ── Story: timeline journey ── */
    case 'story':
      return (
        <div className="w-full h-full bg-gradient-to-b from-amber-950/30 to-[#0a0a0a] p-3 flex items-center justify-center">
          <div className="flex flex-col items-center gap-0 relative">
            {/* Timeline */}
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
