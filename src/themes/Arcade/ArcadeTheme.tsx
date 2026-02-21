import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../../data/portfolio';
import { useStore } from '../../store/useStore';
import { useIsMobile } from '../../components/TouchControls';
import SnakeGame from '../../games/SnakeGame';
import DinoGame from '../../games/DinoGame';
import CodeTyper from '../../games/CodeTyper';
import MemoryMatch from '../../games/MemoryMatch';
import TechWordle from '../../games/TechWordle';
import FlappyBird from '../../games/FlappyBird';
import PongGame from '../../games/PongGame';
import SpaceInvaders from '../../games/SpaceInvaders';

type Screen = 'menu' | 'stats' | 'quests' | 'inventory' | 'achievements' | 'contact' | 'games' | 'snake' | 'dino' | 'typer' | 'memory' | 'wordle' | 'flappy' | 'pong' | 'invaders';

const GAME_SCREENS: Screen[] = ['snake', 'dino', 'typer', 'memory', 'wordle', 'flappy', 'pong', 'invaders'];

const GAMES_LIST: { id: Screen; name: string; desc: string; scoreKey: string; icon: string }[] = [
  { id: 'snake', name: 'SNAKE', desc: 'Catch the tech logos!', scoreKey: 'snake', icon: '🐍' },
  { id: 'dino', name: 'DINO JUMP', desc: 'Jump over obstacles!', scoreKey: 'dino', icon: '🦖' },
  { id: 'flappy', name: 'FLAPPY BIRD', desc: 'Flap through the pipes!', scoreKey: 'flappy', icon: '🐦' },
  { id: 'pong', name: 'PONG', desc: 'You vs AI — first to 5!', scoreKey: 'pong', icon: '🏓' },
  { id: 'invaders', name: 'SPACE INVADERS', desc: 'Defend from the bugs!', scoreKey: 'invaders', icon: '👾' },
  { id: 'wordle', name: 'WORDLE', desc: 'Guess the word!', scoreKey: 'wordle', icon: '📝' },
  { id: 'typer', name: 'CODE TYPER', desc: 'Type code snippets fast!', scoreKey: 'typer', icon: '⌨️' },
  { id: 'memory', name: 'MEMORY MATCH', desc: 'Match tech icon pairs!', scoreKey: 'memory', icon: '🧠' },
];

const NAV_ITEMS: { id: Screen; label: string; icon: string }[] = [
  { id: 'stats', label: 'Stats', icon: '⚔️' },
  { id: 'quests', label: 'Quests', icon: '📜' },
  { id: 'inventory', label: 'Items', icon: '🎒' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'achievements', label: 'Trophies', icon: '🏆' },
  { id: 'contact', label: 'Contact', icon: '💾' },
];

const NEON = {
  cyan: '#00f0ff',
  magenta: '#ff00aa',
  green: '#39ff14',
  bg: '#0a0a1a',
  surface: '#12122a',
  border: 'rgba(0,240,255,0.15)',
};

export default function ArcadeTheme() {
  const routerNavigate = useNavigate();
  const visitSection = useStore((s) => s.visitSection);
  const achievements = useStore((s) => s.achievements);
  const xp = useStore((s) => s.xp);
  const level = useStore((s) => s.level);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const isMobile = useIsMobile();
  const isInGame = GAME_SCREENS.includes(currentScreen);

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    if (screen === 'stats') visitSection('skills');
    if (screen === 'quests') visitSection('experience');
    if (screen === 'inventory') visitSection('projects');
    if (screen === 'contact') visitSection('contact');
  }, [visitSection]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isInGame) setCurrentScreen('games');
        else if (currentScreen !== 'menu') setCurrentScreen('menu');
        else routerNavigate('/');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentScreen, isInGame, routerNavigate]);

  const skillStats = [
    { name: 'Java', level: 90, emoji: '☕' },
    { name: 'React', level: 92, emoji: '⚛️' },
    { name: 'Python', level: 85, emoji: '🐍' },
    { name: 'Node.js', level: 88, emoji: '🟢' },
    { name: 'AWS', level: 80, emoji: '☁️' },
    { name: 'TypeScript', level: 87, emoji: '🔷' },
    { name: 'MongoDB', level: 85, emoji: '🍃' },
    { name: 'Docker', level: 72, emoji: '🐳' },
    { name: 'C++', level: 78, emoji: '⚡' },
    { name: 'SQL', level: 82, emoji: '🗄️' },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 gap-6">
            <motion.h1
              className="text-3xl md:text-5xl font-black text-center tracking-wider"
              style={{ color: NEON.cyan, textShadow: `0 0 30px ${NEON.cyan}60, 0 0 60px ${NEON.cyan}20` }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              ARCADE QUEST
            </motion.h1>
            <motion.p
              className="text-gray-400 text-sm md:text-base text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {portfolioData.name} — {portfolioData.title}
            </motion.p>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-lg mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className="group relative rounded-xl p-4 md:p-5 cursor-pointer transition-all hover:scale-105 active:scale-95 text-center"
                  style={{
                    background: NEON.surface,
                    border: `1px solid ${NEON.border}`,
                  }}
                >
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ boxShadow: `inset 0 0 30px ${NEON.cyan}15, 0 0 20px ${NEON.cyan}10` }} />
                  <span className="text-2xl md:text-3xl block mb-2">{item.icon}</span>
                  <span className="text-xs md:text-sm font-semibold tracking-wider"
                    style={{ color: NEON.cyan }}>{item.label.toUpperCase()}</span>
                </button>
              ))}
            </motion.div>
            <p className="text-gray-600 text-xs mt-4">ESC to exit</p>
          </div>
        );

      case 'stats':
        return (
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <ScreenHeader title="CHARACTER STATS" onBack={() => setCurrentScreen('menu')} />
            <div className="rounded-xl p-4 mb-4" style={{ background: NEON.surface, border: `1px solid ${NEON.border}` }}>
              <p className="text-lg font-bold" style={{ color: NEON.cyan }}>{portfolioData.name}</p>
              <p className="text-gray-400 text-sm">{portfolioData.title}</p>
              <p className="text-gray-500 text-xs mt-1">LV: {level}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">XP:</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${NEON.cyan}15` }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((xp / 500) * 100, 100)}%`, background: NEON.cyan }} />
                </div>
                <span className="text-xs" style={{ color: NEON.cyan }}>{xp}/500</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3 tracking-wider">SKILL TREE</p>
            <div className="space-y-3">
              {skillStats.map((skill) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="text-sm w-24 md:w-28 shrink-0 text-gray-300">{skill.emoji} {skill.name}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${NEON.cyan}15` }}>
                    <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${NEON.cyan}, ${NEON.green})` }}
                      initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: NEON.green }}>{skill.level}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'quests':
        return (
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <ScreenHeader title="QUEST LOG" onBack={() => setCurrentScreen('menu')} />
            {portfolioData.experience.map((exp, i) => (
              <div key={i} className="rounded-xl p-4 mb-3" style={{ background: NEON.surface, border: `1px solid ${NEON.border}` }}>
                <div className="flex items-center justify-between">
                  <p className="font-bold" style={{ color: NEON.cyan }}>{exp.company}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: i === 0 ? `${NEON.green}20` : `${NEON.cyan}15`,
                    color: i === 0 ? NEON.green : NEON.cyan,
                    border: `1px solid ${i === 0 ? NEON.green : NEON.cyan}30`,
                  }}>
                    {i === 0 ? '🟢 ACTIVE' : '✅ DONE'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{exp.role}</p>
                <p className="text-gray-600 text-xs">{exp.duration}</p>
                <div className="mt-2 space-y-1">
                  {exp.bullets.slice(0, isMobile ? 2 : 3).map((b, j) => (
                    <p key={j} className="text-xs text-gray-400 leading-relaxed">▸ {b.length > 100 ? b.substring(0, 100) + '...' : b}</p>
                  ))}
                  {exp.bullets.length > 3 && <p className="text-xs text-gray-600">+{exp.bullets.length - 3} more...</p>}
                </div>
              </div>
            ))}
            <div className="rounded-xl p-4 mb-3" style={{ background: NEON.surface, border: `1px solid ${NEON.border}` }}>
              <div className="flex items-center justify-between">
                <p className="font-bold" style={{ color: NEON.cyan }}>🎓 Origin Story</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${NEON.cyan}15`, color: NEON.cyan }}>✅ DONE</span>
              </div>
              <p className="text-gray-400 text-sm">{portfolioData.education[0].institution}</p>
              <p className="text-gray-500 text-xs">{portfolioData.education[0].degree}</p>
              <p className="text-gray-600 text-xs">{portfolioData.education[0].gpa} • {portfolioData.education[0].duration}</p>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <ScreenHeader title="INVENTORY" onBack={() => setCurrentScreen('menu')} />
            <p className="text-xs text-gray-500 mb-3 tracking-wider">PROJECTS & TOOLS</p>
            {portfolioData.projects.map((proj, i) => (
              <div key={i} className="rounded-xl p-4 mb-3" style={{ background: NEON.surface, border: `1px solid ${NEON.border}` }}>
                <p className="font-bold" style={{ color: NEON.magenta }}>🗡️ {proj.name}</p>
                <p className="text-xs text-gray-500 mt-1">Tech: {proj.techStack}</p>
                <div className="mt-2 space-y-1">
                  {proj.bullets.map((b, j) => (
                    <p key={j} className="text-xs text-gray-400 leading-relaxed">▸ {b.length > 100 ? b.substring(0, 100) + '...' : b}</p>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500 mb-3 mt-4 tracking-wider">CERTIFICATIONS</p>
            {portfolioData.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-3 mb-3 px-2">
                <span className="text-lg">📜</span>
                <div>
                  <p className="text-sm font-bold text-gray-300">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'achievements':
        return (
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <ScreenHeader title="ACHIEVEMENTS" onBack={() => setCurrentScreen('menu')} />
            <div className="space-y-2">
              {achievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: ach.unlocked ? `${NEON.green}08` : NEON.surface,
                    border: `1px solid ${ach.unlocked ? NEON.green + '30' : NEON.border}`,
                    opacity: ach.unlocked ? 1 : 0.4,
                  }}>
                  <span className="text-xl">{ach.unlocked ? ach.icon : '🔒'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{ach.name}</p>
                    <p className="text-xs text-gray-500">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">{achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked</p>
            </div>
          </div>
        );

      case 'games':
        return (
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <ScreenHeader title="MINI GAMES" onBack={() => setCurrentScreen('menu')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GAMES_LIST.map((game) => {
                const hi = useStore.getState().highScores[game.scoreKey];
                return (
                  <button
                    key={game.id}
                    onClick={() => setCurrentScreen(game.id)}
                    className="group rounded-xl p-4 text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: NEON.surface, border: `1px solid ${NEON.border}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{game.icon}</span>
                        <p className="text-sm font-bold" style={{ color: NEON.cyan }}>{game.name}</p>
                      </div>
                      {hi ? <span className="text-xs" style={{ color: NEON.green }}>HI: {hi}</span> : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{game.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'snake':
        return <SnakeGame variant="arcade" onExit={() => setCurrentScreen('games')} />;
      case 'dino':
        return <DinoGame variant="arcade" onExit={() => setCurrentScreen('games')} />;
      case 'typer':
        return <CodeTyper variant="arcade" onExit={() => setCurrentScreen('games')} />;
      case 'memory':
        return <MemoryMatch variant="arcade" onExit={() => setCurrentScreen('games')} />;
      case 'wordle':
        return <TechWordle variant="arcade" onExit={() => setCurrentScreen('games')} />;
      case 'flappy':
        return <FlappyBird variant="arcade" onExit={() => setCurrentScreen('games')} />;
      case 'pong':
        return <PongGame variant="arcade" onExit={() => setCurrentScreen('games')} />;
      case 'invaders':
        return <SpaceInvaders variant="arcade" onExit={() => setCurrentScreen('games')} />;

      case 'contact':
        return (
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <ScreenHeader title="SAVE & CONTACT" onBack={() => setCurrentScreen('menu')} />
            <div className="rounded-xl p-4 text-center mb-4" style={{ background: NEON.surface, border: `1px solid ${NEON.border}` }}>
              <p className="text-3xl mb-2">💾</p>
              <p className="text-lg font-bold" style={{ color: NEON.green, textShadow: `0 0 10px ${NEON.green}40` }}>GAME SAVED!</p>
              <p className="text-xs text-gray-500 mt-1">Progress auto-saved to browser</p>
            </div>
            <p className="text-xs text-gray-500 mb-3 tracking-wider">CONNECT</p>
            <div className="space-y-2">
              {[
                { icon: '📧', label: 'EMAIL', value: portfolioData.email, href: `mailto:${portfolioData.email}` },
                { icon: '📱', label: 'PHONE', value: portfolioData.phone },
                { icon: '🔗', label: 'LINKEDIN', value: portfolioData.linkedin, href: `https://${portfolioData.linkedin}` },
                { icon: '💻', label: 'LEETCODE', value: portfolioData.leetcode, href: `https://${portfolioData.leetcode}` },
              ].map((item) => (
                <a key={item.label} href={item.href || '#'} target="_blank" rel="noopener noreferrer"
                  className="block rounded-xl p-3 no-underline transition-all hover:scale-[1.02]"
                  style={{ background: NEON.surface, border: `1px solid ${NEON.border}`, color: NEON.cyan }}>
                  <p className="text-sm">{item.icon} {item.label}</p>
                  <p className="text-xs text-gray-500">{item.value}</p>
                </a>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: NEON.bg, color: '#e0e0e0' }}>
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Top bar */}
      <div className="relative z-10 shrink-0 px-4 py-3 flex items-center justify-between"
        style={{ background: `${NEON.surface}ee`, borderBottom: `1px solid ${NEON.border}` }}>
        <button onClick={() => routerNavigate('/')} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer text-sm">
          ← Back
        </button>
        <span className="text-xs font-bold tracking-[0.3em]" style={{ color: NEON.cyan, textShadow: `0 0 10px ${NEON.cyan}40` }}>
          ARCADE
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: NEON.green }}>{level}</span>
          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: `${NEON.cyan}15` }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((xp / 500) * 100, 100)}%`, background: NEON.cyan }} />
          </div>
          <span className="text-gray-500">{xp} XP</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — hidden when in-game */}
      {!isInGame && currentScreen !== 'menu' && (
        <div className="relative z-10 shrink-0 px-2 py-2 flex items-center justify-around"
          style={{ background: `${NEON.surface}ee`, borderTop: `1px solid ${NEON.border}` }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg cursor-pointer transition-all"
              style={{
                color: currentScreen === item.id ? NEON.cyan : '#555',
                textShadow: currentScreen === item.id ? `0 0 8px ${NEON.cyan}40` : 'none',
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-semibold tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared Screen Header ───
function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs tracking-[0.2em]" style={{ color: `${NEON.cyan}80` }}>— {title} —</p>
      <button onClick={onBack} className="text-xs cursor-pointer underline" style={{ color: NEON.cyan }}>BACK</button>
    </div>
  );
}
