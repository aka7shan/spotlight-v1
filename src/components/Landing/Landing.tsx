import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { ThemeType } from '../../store/useStore';
import { portfolioData, funFacts } from '../../data/portfolio';
import TypeWriter from '../TypeWriter';
import TrailCursor from '../TrailCursor';
import Header from '../Header';
import ResumePreview from '../ResumePreview';
import ExperienceCarousel from '../ExperienceCarousel';
import ProjectCardStack from '../ProjectCardStack';

const themeAvatars: { id: ThemeType; label: string; logo: string; color: string }[] = [
  { id: 'netflix', label: 'Netflix', logo: '/ThemeLogos/netflix.webp', color: '#2d2d2d' },
  { id: 'instagram', label: 'Instagram', logo: '/ThemeLogos/insta.webp', color: '#E1306C' },
  { id: 'terminal', label: 'Terminal', logo: '/ThemeLogos/terminal.webp', color: '#00ff00' },
  { id: 'gpt', label: 'ChatGPT', logo: '/ThemeLogos/chatgpt.webp', color: '#10a37f' },
];

/* ─── Games ─── */
const SnakeGame = lazy(() => import('../../games/SnakeGame'));
const DinoGame = lazy(() => import('../../games/DinoGame'));
const CodeTyper = lazy(() => import('../../games/CodeTyper'));
const MemoryMatch = lazy(() => import('../../games/MemoryMatch'));
const TechWordle = lazy(() => import('../../games/TechWordle'));
const FlappyBird = lazy(() => import('../../games/FlappyBird'));
const PongGame = lazy(() => import('../../games/PongGame'));
const SpaceInvaders = lazy(() => import('../../games/SpaceInvaders'));

type GameId = 'snake' | 'dino' | 'typer' | 'memory' | 'wordle' | 'flappy' | 'pong' | 'invaders';

const GAMES: { id: GameId; name: string; icon: string; desc: string; color: string }[] = [
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Catch the tech logos!', color: '#39ff14' },
  { id: 'dino', name: 'Dino Jump', icon: '🦖', desc: 'Jump over obstacles!', color: '#00f0ff' },
  { id: 'flappy', name: 'Flappy Bird', icon: '🐦', desc: 'Flap through pipes!', color: '#ffcc00' },
  { id: 'pong', name: 'Pong', icon: '🏓', desc: 'You vs AI!', color: '#ff00aa' },
  { id: 'invaders', name: 'Space Invaders', icon: '👾', desc: 'Defend from bugs!', color: '#9945ff' },
  { id: 'wordle', name: 'Tech Wordle', icon: '📝', desc: 'Guess the word!', color: '#34c759' },
  { id: 'typer', name: 'Code Typer', icon: '⌨️', desc: 'Type code fast!', color: '#007aff' },
  { id: 'memory', name: 'Memory Match', icon: '🧠', desc: 'Match tech pairs!', color: '#ff9500' },
];

/* ── Scroll-driven word reveal (inspired by Framer Text Scroll) ── */
function ScrollWord({ word, index, total, progress }: { word: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  return <motion.span style={{ opacity, display: 'inline' }}>{word} </motion.span>;
}

const aboutText =
  "I'm fascinated by how systems scale — how a simple API becomes a distributed service handling millions of requests. I build backend services, design clean architecture, and create things that look as good as they work. Always learning, always shipping.";
const aboutWords = aboutText.split(/\s+/);

/* ================================================================
   LANDING — Full Portfolio Homepage
   ================================================================ */
export default function Landing() {
  const navigate = useNavigate();

  const [showIntro, setShowIntro] = useState(true);
  const [hoveredTheme, setHoveredTheme] = useState<number | null>(null);
  const [showResume, setShowResume] = useState(false);
  const [activeFunFact, setActiveFunFact] = useState(0);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  /* Cursor-reveal + scroll-reveal state for Act 2 */
  const [leftMouse, setLeftMouse] = useState({ x: 0, y: 0 });
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightMouse, setRightMouse] = useState({ x: 0, y: 0 });
  const [rightHovered, setRightHovered] = useState(false);
  const [scrollReveal, setScrollReveal] = useState(40);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const rightBlockRef = useRef<HTMLDivElement>(null);
  const circleMask = "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOUQ5RDkiLz4KPC9zdmc+Cg==\")";

  const highScores = useStore((s) => s.highScores);
  const colorMode = useStore((s) => s.colorMode);
  const light = colorMode === 'light';

  /* Sticky "Pick Your Vibe" bubble — visible during Act 1, hover-only after scroll */
  const [inAct1, setInAct1] = useState(true);
  const [vibeHovered, setVibeHovered] = useState(false);

  /* Page-level scroll indicator — visible until near footer */
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  /* ── Scroll-driven cinematic ── */
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start start', 'end end'],
    layoutEffect: false,
  });

  /* Act 1: Hero (0.00 - 0.18) */
  const heroBgOpacity = useTransform(scrollYProgress, [0, 0.06, 0.15], [1, 1, 0]);
  const heroNameOpacity = useTransform(scrollYProgress, [0, 0.04, 0.14], [1, 1, 0]);
  const heroNameY = useTransform(scrollYProgress, [0.04, 0.16], [0, -60]);

  /* Avatar — full size through Acts 1-2 */
  const avatarScale = useTransform(scrollYProgress, [0, 0.42], [1, 1]);
  const avatarY = useTransform(scrollYProgress, [0, 0.42], [0, 0]);
  const avatarOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 1]);

  /* Entire Acts 1-2 view: starts shrinking right after text is revealed */
  const viewScale = useTransform(scrollYProgress, [0.35, 0.43], [1, 0.65]);
  const viewRadius = useTransform(scrollYProgress, [0.35, 0.43], [0, 24]);
  const viewOpacity = useTransform(scrollYProgress, [0.41, 0.45], [1, 0]);

  /* Act 2: Both texts appear simultaneously */
  const act2Opacity = useTransform(scrollYProgress, [0.14, 0.20, 0.34, 0.38], [0, 1, 1, 0]);

  /* Scroll-driven reveal: circle expands from dot at 0.24 → fully revealed by 0.33 */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v < 0.24) setScrollReveal(40);
    else if (v > 0.33) setScrollReveal(1200);
    else setScrollReveal(40 + ((v - 0.24) / 0.09) * 1160);

    setInAct1(v < 0.06);
  });

  /* Page-level scroll: hide scroll indicator near footer */
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollIndicator(docHeight > 0 && scrollTop / docHeight < 0.95);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Act 3 curtain: starts sliding up WHILE view is shrinking (overlap) */
  const act3TileY = useTransform(scrollYProgress, [0.37, 0.45], ['100%', '0%']);
  const act3TileVisible = useTransform(scrollYProgress, (v) => v >= 0.36 ? 'visible' : 'hidden');

  /* Tile text: word-by-word reveal driven by scroll (0.46 → 0.82) */
  const tileTextProgress = useTransform(scrollYProgress, [0.46, 0.82], [0, 1]);

  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);


  /* ── Intro auto-dismiss ── */
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  /* ── Fun facts rotation ── */
  useEffect(() => {
    const timer = setInterval(() => setActiveFunFact((i) => (i + 1) % funFacts.length), 4000);
    return () => clearInterval(timer);
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


  return (
    <div className={`landing-root min-h-screen relative ${light ? 'light' : ''}`} style={{ overflowX: 'clip', backgroundColor: 'var(--lr-bg)' }}>

      {/* ═══ Header ═══ */}
      <Header onResumeClick={() => setShowResume(true)} visible={!showIntro} />
      <ResumePreview isOpen={showResume} onClose={() => setShowResume(false)} />

      {/* ═══ Scroll Progress Bar ═══ */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] z-[90]"
        style={{
          width: progressWidth,
          background: 'linear-gradient(90deg, #e50914, #ff00aa, #00f0ff)',
          opacity: showIntro ? 0 : 1,
        }}
      />

      {/* ═══ CHEAT ACTIVATED banner ═══ */}

      {/* ═══ Intro Splash ═══ */}
      <AnimatePresence>
        {showIntro && (
          <motion.div key="intro" className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--lr-bg)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <motion.div className="text-center">
              <motion.h1 className="text-5xl md:text-7xl font-black mb-4" style={{ color: `rgba(var(--lr-t), 1)` }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
                {'<AS />'.split('').map((char, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                    className="inline-block" style={{ color: i < 1 || i > 3 ? '#e50914' : `rgba(var(--lr-t), 1)` }}>{char}</motion.span>
                ))}
              </motion.h1>
              <motion.div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto" initial={{ width: 0 }} animate={{ width: 200 }} transition={{ delay: 1, duration: 0.8 }} />
              <motion.p className="text-gray-500 mt-4 text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Loading experience...</motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="relative transition-opacity duration-[800ms]"
        style={{ opacity: showIntro ? 0 : 1, pointerEvents: showIntro ? 'none' : 'auto', transitionDelay: showIntro ? '0ms' : '300ms' }}>

        {/* ── TrailCursor (replaces liquid blobs) ── */}
        <TrailCursor text="AKARSHAN" color={light ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'} />

        {/* ══════════════════════════════════════════
            CINEMATIC STORYTELLING (4 Acts)
           ══════════════════════════════════════════ */}
        <div ref={scrollContainerRef} className="relative h-[300vh] md:h-[400vh]">
          {/* Invisible anchor so header "About" link scrolls to tile area */}
          <div id="about" className="absolute top-[40%] left-0" />
          <div className="sticky top-0 h-screen w-full overflow-hidden">

            {/* ═══ Acts 1-2 wrapper — shrinks into a box as Act 3 tile arrives ═══ */}
            <motion.div className="absolute inset-0 z-[0] overflow-hidden" style={{ scale: viewScale, borderRadius: viewRadius, opacity: viewOpacity }}>

            {/* Theme-aware bg that persists after hero image fades */}
            <div className="absolute inset-0 z-[0]" style={{ backgroundColor: 'var(--lr-bg)' }} />

            {/* Layer 1: Hero background image */}
            <motion.div className="absolute inset-0 z-[1]" style={{ opacity: heroBgOpacity }}>
              <img src="/homepage.webp" alt="Akarshan Sharma" className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} decoding="async" fetchPriority="high" />
            </motion.div>

            {/* Vignette — dark: full edges + bottom; light: bottom-only fade */}
            <motion.div className="absolute inset-0 z-[6] pointer-events-none" style={{ opacity: heroBgOpacity }}>
              {!light && (
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, rgba(5,5,5,0.55) 100%)' }} />
              )}
              <div className="absolute inset-0" style={{ background: light
                ? 'linear-gradient(to top, #f5f5f5 0%, #f5f5f5 10%, rgba(245,245,245,0.85) 25%, rgba(245,245,245,0.15) 40%, transparent 50%)'
                : 'linear-gradient(to top, #050505, rgba(5,5,5,0.5), transparent)'
              }} />
            </motion.div>

            {/* Cutout avatar — persists across all acts */}
            <motion.div className="absolute inset-0 z-[5] pointer-events-none" style={{ scale: avatarScale, y: avatarY, opacity: avatarOpacity }}>
              <img src="/1000103078.webp" alt="Akarshan" className="w-full h-full object-cover select-none md:object-[center_30%] object-[center_40%]" draggable={false} decoding="async" fetchPriority="high" />
            </motion.div>

            {/* ── ACT 1: Hero name + TypeWriter ── */}
            <motion.div className="absolute top-16 left-0 right-0 md:top-auto md:bottom-0 z-[10] px-6 md:px-16 pb-0 md:pb-20" style={{ opacity: heroNameOpacity, y: heroNameY }}>
              <h1 className="font-black leading-[0.85] tracking-tight mb-3" style={{ fontSize: 'clamp(3rem, 10vw, 10rem)', color: light ? '#111' : '#fff' }}>
                Akarshan<br /><span style={{ color: light ? '#222' : 'rgba(255,255,255,0.9)' }}>Sharma</span>
              </h1>
              <TypeWriter
                texts={['Software Engineer', 'Full Stack Developer', 'Cloud Architect', 'React Enthusiast']}
                className="text-lg md:text-xl tracking-wide"
                style={{ color: light ? '#555' : 'rgba(255,255,255,0.4)' }}
                cursorColor={light ? '#555' : 'rgba(255,255,255,0.4)'}
              />
            </motion.div>

            {/* ── ACT 2: Both texts + cursor/scroll reveal ── */}
            <motion.div
              className="absolute inset-0 z-[10] flex flex-col md:flex-row items-end md:items-center justify-between px-6 md:px-16 pt-20 md:pt-0 pb-16 md:pb-0"
              style={{ opacity: act2Opacity, pointerEvents: 'auto' }}
            >
              {/* LEFT block — primary: "Hi, I'm Akarshan" / reveal: "3+ Years..." */}
              <div
                ref={leftBlockRef}
                className="relative overflow-hidden rounded-2xl md:max-w-[30%] max-w-full mb-4 md:mb-0 cursor-default"
                style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setLeftMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
                }}
                onMouseEnter={() => setLeftHovered(true)}
                onMouseLeave={() => setLeftHovered(false)}
              >
                <p className="text-xs tracking-[0.4em] uppercase mb-3 font-mono" style={{ color: `rgba(var(--lr-t), 0.3)` }}>// hello world</p>
                <h2 className="font-black leading-tight" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', color: `rgba(var(--lr-t), 1)` }}>
                  Hi, I'm <span className="text-red-500">Akarshan</span>.
                </h2>

                {(() => {
                  const lSize = Math.max(leftHovered ? 400 : 40, scrollReveal);
                  const lPos = leftMouse;
                  return (
                    <motion.div
                      className="absolute inset-0 rounded-2xl flex items-center justify-center p-6"
                      style={{
                        backgroundColor: '#e50914',
                        maskImage: circleMask, maskRepeat: 'no-repeat',
                        WebkitMaskImage: circleMask, WebkitMaskRepeat: 'no-repeat',
                      }}
                      animate={{
                        WebkitMaskPosition: `${lPos.x - lSize / 2}px ${lPos.y - lSize / 2}px`,
                        WebkitMaskSize: `${lSize}px`,
                        maskPosition: `${lPos.x - lSize / 2}px ${lPos.y - lSize / 2}px`,
                        maskSize: `${lSize}px`,
                      }}
                      transition={{ type: 'tween', ease: leftHovered ? 'backOut' : 'easeOut', duration: leftHovered ? 0.4 : 0.15 }}
                    >
                      <p className="font-black text-white leading-tight text-center" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)' }}>
                        3+ Years Building<br />Production Systems
                      </p>
                    </motion.div>
                  );
                })()}
              </div>

              {/* RIGHT block — primary: "It doesn't matter..." / reveal: "I build systems..." */}
              <div
                ref={rightBlockRef}
                className="relative overflow-hidden rounded-2xl md:max-w-[30%] max-w-full cursor-default"
                style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setRightMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
                }}
                onMouseEnter={() => setRightHovered(true)}
                onMouseLeave={() => setRightHovered(false)}
              >
                <p className="font-black leading-[1.1] md:text-right" style={{ fontSize: 'clamp(1.5rem, 3.8vw, 2.8rem)', color: '#d4a017' }}>
                  It doesn't matter where you start. What matters is how far you build from there.
                </p>

                {(() => {
                  const rSize = Math.max(rightHovered ? 400 : 40, scrollReveal);
                  const rPos = rightMouse;
                  return (
                    <motion.div
                      className="absolute inset-0 rounded-2xl flex items-center justify-center p-6"
                      style={{
                        backgroundColor: '#d4a017',
                        maskImage: circleMask, maskRepeat: 'no-repeat',
                        WebkitMaskImage: circleMask, WebkitMaskRepeat: 'no-repeat',
                      }}
                      animate={{
                        WebkitMaskPosition: `${rPos.x - rSize / 2}px ${rPos.y - rSize / 2}px`,
                        WebkitMaskSize: `${rSize}px`,
                        maskPosition: `${rPos.x - rSize / 2}px ${rPos.y - rSize / 2}px`,
                        maskSize: `${rSize}px`,
                      }}
                      transition={{ type: 'tween', ease: rightHovered ? 'backOut' : 'easeOut', duration: rightHovered ? 0.4 : 0.15 }}
                    >
                      <p className="font-black leading-tight text-center" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.5rem)', color: '#111' }}>
                        I build systems that scale reliably and survive production.
                      </p>
                    </motion.div>
                  );
                })()}
              </div>
            </motion.div>

            {/* Close Acts 1-2 wrapper */}
            </motion.div>

            {/* ═══ Act 3-4 curtain — slides up from below ═══ */}
            <motion.div
              className="absolute inset-0 z-[30] rounded-t-3xl overflow-hidden pointer-events-none"
              style={{
                y: act3TileY,
                visibility: act3TileVisible,
                boxShadow: light
                  ? '0 -8px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
                  : '0 -8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              <div className="absolute inset-0" style={{ backgroundColor: light ? '#A47DAB' : '#D4AF37' }} />

              {/* Character — pushed left on desktop, top-centered on mobile */}
              <img
                src="/backless2nd.webp"
                alt=""
                className="act3-char absolute left-1/2 -translate-x-1/2 md:left-[-12%] md:translate-x-0 h-[28%] md:h-full object-contain pointer-events-none"
                style={{ top: '0' }}
                decoding="async"
              />
              <style>{`
                @media (min-width: 768px) {
                  .act3-char { top: auto !important; bottom: 0 !important; }
                }
              `}</style>

              {/* About Me — scroll-driven word reveal */}
              <div className="absolute inset-0 flex items-start md:items-center justify-center md:justify-center px-6 md:pl-[40%] md:pr-10 pt-[30vh] md:pt-0 pointer-events-none overflow-y-auto">
                <div className="max-w-xl w-full">
                  <p className="text-xs md:text-sm tracking-[0.4em] uppercase mb-3" style={{ color: light ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }}>About Me</p>
                  <h2 className="text-2xl md:text-5xl font-black mb-4 md:mb-6" style={{ color: light ? '#111' : '#fff' }}>
                    What kind of developer<span className="text-red-500">?</span>
                  </h2>

                  <div className="relative mb-4 md:mb-6">
                    {/* Ghost layer — full text at low opacity */}
                    <p className="text-sm md:text-xl leading-relaxed" style={{ color: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
                      {aboutText}
                    </p>
                    {/* Animated layer — words reveal on scroll */}
                    <p className="text-sm md:text-xl leading-relaxed absolute inset-0" style={{ color: light ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.65)' }}>
                      {aboutWords.map((word, i) => (
                        <ScrollWord key={i} word={word} index={i} total={aboutWords.length} progress={tileTextProgress} />
                      ))}
                    </p>
                  </div>

                  {/* Keyword pills */}
                  <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                    {['Backend Engineering', 'Distributed Systems', 'Clean Architecture', 'Full-Stack', 'Cloud'].map((kw) => (
                      <span key={kw} className="px-3 py-1 md:px-3.5 md:py-1.5 text-[10px] md:text-xs font-medium rounded-full" style={{ color: light ? '#000' : '#fff', border: light ? '1.5px solid #000' : '1.5px solid #fff', background: light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)' }}>
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Fun Facts card */}
                  <div className="rounded-xl p-3 md:p-4 pointer-events-auto" style={{ background: light ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)', border: light ? '1.5px solid #000' : '1.5px solid #fff' }}>
                    <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-semibold" style={{ color: light ? '#000' : '#fff' }}>Fun Fact</p>
                    <AnimatePresence mode="wait">
                      <motion.p key={activeFunFact} className="text-xs md:text-sm leading-relaxed" style={{ color: light ? '#000' : '#fff' }}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        "{funFacts[activeFunFact]}"
                      </motion.p>
                    </AnimatePresence>
                    <div className="flex gap-1 mt-3">
                      {funFacts.map((_, i) => (
                        <div key={i} className="h-0.5 rounded-full transition-all duration-300"
                          style={{ width: i === activeFunFact ? '16px' : '4px', background: i === activeFunFact ? (light ? '#000' : '#fff') : (light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)') }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ══════════════════════════════════════════
            SKILLS — continuous with the tile above
           ══════════════════════════════════════════ */}
        <section id="skills" className="relative z-20 pt-6 pb-10 md:pt-8 md:pb-16 px-6 scroll-mt-16" style={{ backgroundColor: light ? '#A47DAB' : '#D4AF37' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: light ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)' }}>Tech Stack</p>
              <h2 className="text-3xl md:text-5xl font-black" style={{ color: light ? '#000' : '#fff' }}>Skills</h2>
            </motion.div>

            <div className="space-y-4">
              {portfolioData.skills.map((category, catIdx) => (
                <motion.div key={category.category}
                  initial={{ opacity: 0, x: catIdx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: catIdx * 0.05 }}>
                  <p className="text-sm md:text-base tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: light ? '#000' : '#fff' }}>{category.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <motion.span key={skill}
                        className="px-3.5 py-1.5 text-xs rounded-full transition-all cursor-default"
                        style={{ color: light ? '#000' : '#fff', border: light ? '1.5px solid #000' : '1.5px solid #fff' }}
                        whileHover={{ scale: 1.05, y: -2 }}>
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            EXPERIENCE — Scroll-Driven Carousel
           ══════════════════════════════════════════ */}
        <div id="experience" />
        <ExperienceCarousel />

        {/* ══════════════════════════════════════════
            PROJECTS — CardStack
           ══════════════════════════════════════════ */}
        <ProjectCardStack />

        {/* ══════════════════════════════════════════
            EDUCATION + CERTIFICATIONS
           ══════════════════════════════════════════ */}
        <section id="education" className="relative z-20 py-20 md:py-32 px-6" style={{ backgroundColor: 'var(--lr-bg)' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: `rgba(var(--lr-t), 0.2)` }}>Background</p>
              <h2 className="text-3xl md:text-5xl font-black" style={{ color: `rgba(var(--lr-t), 1)` }}>Education</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {portfolioData.education.map((edu, i) => (
                <motion.div key={i} className="rounded-2xl p-6"
                  style={{ background: light ? '#A47DAB' : '#D4AF37', border: '1.5px solid #000' }}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <p className="text-xs tracking-wider uppercase mb-2" style={{ color: 'rgba(0,0,0,0.4)' }}>{edu.duration}</p>
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#000' }}>{edu.institution}</h3>
                  <p className="text-sm mb-2" style={{ color: 'rgba(0,0,0,0.65)' }}>{edu.degree}</p>
                  <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>{edu.gpa}{edu.location ? ` · ${edu.location}` : ''}</p>
                </motion.div>
              ))}

              <motion.div className="rounded-2xl p-6"
                style={{ background: light ? '#A47DAB' : '#D4AF37', border: '1.5px solid #000' }}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <p className="text-xs tracking-wider uppercase mb-4" style={{ color: 'rgba(0,0,0,0.4)' }}>Certifications</p>
                <div className="space-y-3">
                  {portfolioData.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-0.5" style={{ color: 'rgba(0,0,0,0.3)' }}>✦</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#000' }}>{cert.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>{cert.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            THEME PICKER
           ══════════════════════════════════════════ */}
        <section id="themes" className="relative z-20 py-20 md:py-32 px-6" style={{ backgroundColor: 'var(--lr-bg)' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: `rgba(var(--lr-t), 0.2)` }}>Different Perspectives</p>
              <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ color: `rgba(var(--lr-t), 1)` }}>
                Want a different <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">vibe</span>?
              </h2>
              <p className="text-sm md:text-base" style={{ color: `rgba(var(--lr-t), 0.3)` }}>
                See all of this in a completely different style.
              </p>
            </motion.div>

            {/* Avatar Group — overlapping circles */}
            <div className="flex flex-col md:flex-row items-center justify-center">
              {themeAvatars.map((theme, i) => (
                <motion.div
                  key={theme.id}
                  className="relative cursor-pointer"
                  style={{
                    zIndex: hoveredTheme === i ? 20 : themeAvatars.length - i,
                    marginTop: i === 0 ? 0 : '-20px',
                    marginLeft: 0,
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                  whileHover={{ scale: 1.2, y: -10, zIndex: 20 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHoveredTheme(i)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  onClick={() => navigate(`/${theme.id}`)}
                >
                  <div
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center p-3 md:p-4"
                    style={{
                      background: theme.color,
                      border: `4px solid ${light ? '#fff' : '#1a1a1a'}`,
                      boxShadow: hoveredTheme === i
                        ? `0 12px 35px ${theme.color}60`
                        : `0 4px 15px rgba(0,0,0,${light ? '0.15' : '0.5'})`,
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <img src={theme.logo} alt={theme.label} className="w-full h-full object-contain drop-shadow-lg" />
                  </div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredTheme === i && (
                      <motion.div
                        className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none"
                        style={{ background: theme.color, color: '#fff' }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                      >
                        {theme.label}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${theme.color}` }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Desktop: horizontal overlap */}
            <style>{`
              @media (min-width: 768px) {
                #themes > div > div > div.relative {
                  margin-top: 0 !important;
                  margin-left: -24px !important;
                }
                #themes > div > div > div.relative:first-child {
                  margin-left: 0 !important;
                }
              }
            `}</style>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ARCADE — ALL GAMES
           ══════════════════════════════════════════ */}
        <section id="games" className="relative z-20 py-20 md:py-32 px-6" style={{ backgroundColor: 'var(--lr-bg)' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-[#00f0ff]/40 text-xs tracking-[0.4em] uppercase mb-3 font-mono">// break time</p>
              <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ color: `rgba(var(--lr-t), 1)` }}>
                Scroll fatigue<span className="text-[#00f0ff]">?</span>
              </h2>
              <p className="text-sm md:text-base" style={{ color: `rgba(var(--lr-t), 0.3)` }}>
                Take a break. Play some games. I built these too.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {GAMES.map((game, i) => (
                <motion.button
                  key={game.id}
                  className="relative rounded-xl p-5 md:p-6 text-center cursor-pointer group overflow-hidden"
                  style={{ background: 'var(--lr-game-card)', border: `1px solid ${game.color}20` }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.04, borderColor: `${game.color}50`, boxShadow: `0 0 30px ${game.color}15, inset 0 0 20px ${game.color}08` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveGame(game.id)}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${game.color}08 0%, transparent 70%)` }} />
                  <span className="relative text-3xl md:text-4xl block mb-3">{game.icon}</span>
                  <p className="relative text-xs md:text-sm font-bold tracking-wider font-mono mb-1" style={{ color: game.color }}>{game.name.toUpperCase()}</p>
                  <p className="relative text-[10px] md:text-xs" style={{ color: `rgba(var(--lr-t), 0.25)` }}>{game.desc}</p>
                  {highScores[game.id] > 0 && (
                    <p className="relative text-[9px] mt-2 font-mono" style={{ color: `rgba(var(--lr-t), 0.15)` }}>HI: {highScores[game.id]}</p>
                  )}
                </motion.button>
              ))}
            </div>

            <p className="text-center text-xs mt-8 font-mono tracking-wider" style={{ color: `rgba(var(--lr-t), 0.1)` }}>
              PRESS ESC IN-GAME TO EXIT
            </p>
          </div>
        </section>

        {/* Game overlay */}
        <AnimatePresence>
          {activeGame && (
            <motion.div
              className="fixed inset-0 z-[100] flex flex-col"
              style={{ background: '#0a0a1a' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
                <button onClick={() => setActiveGame(null)} className="text-sm font-mono text-[#00f0ff] hover:opacity-80 transition-opacity cursor-pointer">
                  ← Back
                </button>
                <p className="text-sm font-mono font-bold text-white/50 tracking-widest">
                  {GAMES.find(g => g.id === activeGame)?.name.toUpperCase()}
                </p>
                <div className="w-14" />
              </div>
              <div className="flex-1 min-h-0">
                <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" /></div>}>
                  {activeGame === 'snake' && <SnakeGame variant="arcade" onExit={() => setActiveGame(null)} />}
                  {activeGame === 'dino' && <DinoGame variant="arcade" onExit={() => setActiveGame(null)} />}
                  {activeGame === 'flappy' && <FlappyBird variant="arcade" onExit={() => setActiveGame(null)} />}
                  {activeGame === 'pong' && <PongGame variant="arcade" onExit={() => setActiveGame(null)} />}
                  {activeGame === 'invaders' && <SpaceInvaders variant="arcade" onExit={() => setActiveGame(null)} />}
                  {activeGame === 'wordle' && <TechWordle variant="arcade" onExit={() => setActiveGame(null)} />}
                  {activeGame === 'typer' && <CodeTyper variant="arcade" onExit={() => setActiveGame(null)} />}
                  {activeGame === 'memory' && <MemoryMatch variant="arcade" onExit={() => setActiveGame(null)} />}
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════
            CONTACT + FOOTER
           ══════════════════════════════════════════ */}
        <section className="relative z-20 py-16 md:py-24 px-6" style={{ backgroundColor: 'var(--lr-bg)' }}>
          <motion.div className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
            <p className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: `rgba(var(--lr-t), 0.2)` }}>Let's Connect</p>
            <h2 className="font-black mb-4 leading-tight" style={{ color: `rgba(var(--lr-t), 1)`, fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>
              Got a project in mind?
            </h2>
            <p className="text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed" style={{ color: `rgba(var(--lr-t), 0.4)` }}>
              I'm always open to discussing new opportunities, collaborations, or just a friendly chat about tech.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <motion.a href={`mailto:${portfolioData.email}`}
                className="group flex items-center gap-3 px-6 py-3.5 font-bold rounded-xl text-sm tracking-wide transition-colors"
                style={{ background: 'var(--lr-btn-bg)', color: 'var(--lr-btn-text)' }}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <span className="text-lg">📧</span> Say Hello <span className="group-hover:translate-x-1 transition-transform">→</span>
              </motion.a>
              <motion.a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm tracking-wide hover:border-blue-400/40 hover:text-blue-400 transition-colors"
                style={{ color: `rgba(var(--lr-t), 0.7)`, border: `1px solid rgba(var(--lr-b), 0.15)` }}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <span className="text-lg">💼</span> LinkedIn
              </motion.a>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs" style={{ color: `rgba(var(--lr-t), 0.2)` }}>
              <a href={`mailto:${portfolioData.email}`} className="hover:opacity-150 transition-opacity">{portfolioData.email}</a>
              <span className="w-1 h-1 rounded-full" style={{ background: `rgba(var(--lr-t), 0.1)` }} />
              <a href={`https://${portfolioData.leetcode}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-150 transition-opacity">LeetCode</a>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ═══ Fixed Scroll Indicator — visible until near footer ═══ */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: `rgba(var(--lr-t), 0.3)` }}>Scroll to explore</p>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="w-5 h-8 rounded-full flex justify-center pt-1.5" style={{ border: `1px solid rgba(var(--lr-b), 0.15)` }}>
                <motion.div className="w-1 h-1 rounded-full" style={{ backgroundColor: `rgba(var(--lr-t), 0.3)` }} animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Sticky "Pick Your Vibe" button — bottom-right corner ═══ */}
      <div
        className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3"
        onMouseEnter={() => setVibeHovered(true)}
        onMouseLeave={() => setVibeHovered(false)}
      >
        <AnimatePresence>
          {(inAct1 || vibeHovered) && (
            <motion.div
              className="rounded-xl px-4 py-3 max-w-[220px] text-sm leading-snug shadow-lg cursor-pointer"
              style={{
                background: light ? '#fff' : '#1a1a1a',
                color: light ? '#111' : '#eee',
                border: light ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
              }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Wanna see something cool? Try this entire portfolio in <strong>different themes</strong>!
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45" style={{ background: light ? '#fff' : '#1a1a1a', borderRight: light ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)', borderBottom: light ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="w-12 h-12 flex items-center justify-center cursor-pointer"
          style={{ background: 'transparent', border: 'none' }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <img src="/ThemeLogos/story.webp" alt="Pick Your Vibe" className="w-12 h-12 object-contain drop-shadow-lg" />
        </motion.button>
      </div>
    </div>
  );
}

/* ═══ Confetti ═══ */
function createConfetti() {
  const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de', '#fff'];
  for (let i = 0; i < 150; i++) {
    const c = document.createElement('div');
    const size = Math.random() * 10 + 5;
    const isCircle = Math.random() > 0.5;
    c.style.cssText = `position:fixed;width:${size}px;height:${isCircle ? size : size * 2.5}px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}vw;top:-20px;z-index:9999;border-radius:${isCircle ? '50%' : '2px'};pointer-events:none;animation:confetti-fall ${2 + Math.random() * 3}s ease-in forwards;animation-delay:${Math.random() * 0.5}s;opacity:0;`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }
  if (!document.querySelector('#confetti-style')) {
    const s = document.createElement('style');
    s.id = 'confetti-style';
    s.textContent = `@keyframes confetti-fall{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1;}25%{opacity:1;}100%{transform:translateY(100vh) rotate(${360 + Math.random() * 720}deg) scale(0.5);opacity:0;}}`;
    document.head.appendChild(s);
  }
}
