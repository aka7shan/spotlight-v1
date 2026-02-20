import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../../data/portfolio';
import { useStore } from '../../store/useStore';
import SnakeGame from '../../games/SnakeGame';
import DinoGame from '../../games/DinoGame';
import CodeTyper from '../../games/CodeTyper';
import MemoryMatch from '../../games/MemoryMatch';
import TechWordle from '../../games/TechWordle';
import FlappyBird from '../../games/FlappyBird';
import PongGame from '../../games/PongGame';
import SpaceInvaders from '../../games/SpaceInvaders';

type Screen = 'menu' | 'stats' | 'quests' | 'inventory' | 'achievements' | 'contact' | 'games' | 'snake' | 'dino' | 'typer' | 'memory' | 'wordle' | 'flappy' | 'pong' | 'invaders';

interface MenuItem {
  id: Screen;
  label: string;
  icon: string;
}

const GAME_SCREENS: Screen[] = ['snake', 'dino', 'typer', 'memory', 'wordle', 'flappy', 'pong', 'invaders'];

// Games list used for both rendering and keyboard/D-pad navigation
const GAMES_LIST: { id: Screen; name: string; desc: string; scoreKey: string }[] = [
  { id: 'snake', name: '🐍 SNAKE', desc: 'Catch the tech logos!', scoreKey: 'snake' },
  { id: 'dino', name: '🦖 DINO JUMP', desc: 'Jump over obstacles!', scoreKey: 'dino' },
  { id: 'flappy', name: '🐦 FLAPPY BIRD', desc: 'Flap through the pipes!', scoreKey: 'flappy' },
  { id: 'pong', name: '🏓 PONG', desc: 'You vs AI — first to 5!', scoreKey: 'pong' },
  { id: 'invaders', name: '👾 SPACE INVADERS', desc: 'Defend from the bugs!', scoreKey: 'invaders' },
  { id: 'wordle', name: '📝 WORDLE', desc: 'Guess the word!', scoreKey: 'wordle' },
  { id: 'typer', name: '⌨️ CODE TYPER', desc: 'Type code snippets fast!', scoreKey: 'typer' },
  { id: 'memory', name: '🧠 MEMORY MATCH', desc: 'Match tech icon pairs!', scoreKey: 'memory' },
];

// Simulate keyboard events so games can react to D-pad / A / B
// IMPORTANT: games like Pong & Space Invaders track held keys via keydown/keyup sets,
// so we must dispatch BOTH keydown (on press) and keyup (on release).
function simulateKeyDown(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}
function simulateKeyUp(key: string) {
  window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
}

// ── D-Pad Component (extracted outside to prevent remounts) ──
// Supports both press (onPointerDown) and release (onPointerUp/Leave/Cancel)
// so games that track held-key sets (Pong, Space Invaders) work correctly.
type Dir = 'up' | 'down' | 'left' | 'right';
function DPad({ size = 'normal', onPress, onRelease }: { size?: 'normal' | 'large'; onPress: (dir: Dir) => void; onRelease: (dir: Dir) => void }) {
  const btnSize = size === 'large' ? 'w-14 h-14' : 'w-9 h-9';
  const padSize = size === 'large' ? 'w-36 h-36' : 'w-28 h-28';
  const centerSize = size === 'large' ? 'w-14 h-14' : 'w-9 h-9';

  const mkHandlers = (dir: Dir) => ({
    onPointerDown: () => onPress(dir),
    onPointerUp: () => onRelease(dir),
    onPointerLeave: () => onRelease(dir),
    onPointerCancel: () => onRelease(dir),
  });

  return (
    <div className={`relative ${padSize}`}>
      <button {...mkHandlers('up')} className={`absolute top-0 left-1/2 -translate-x-1/2 ${btnSize} bg-[#2a2a2a] rounded-sm cursor-pointer active:bg-[#1a1a1a] flex items-center justify-center text-gray-400 text-xs select-none`}>▲</button>
      <button {...mkHandlers('down')} className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${btnSize} bg-[#2a2a2a] rounded-sm cursor-pointer active:bg-[#1a1a1a] flex items-center justify-center text-gray-400 text-xs select-none`}>▼</button>
      <button {...mkHandlers('left')} className={`absolute left-0 top-1/2 -translate-y-1/2 ${btnSize} bg-[#2a2a2a] rounded-sm cursor-pointer active:bg-[#1a1a1a] flex items-center justify-center text-gray-400 text-xs select-none`}>◀</button>
      <button {...mkHandlers('right')} className={`absolute right-0 top-1/2 -translate-y-1/2 ${btnSize} bg-[#2a2a2a] rounded-sm cursor-pointer active:bg-[#1a1a1a] flex items-center justify-center text-gray-400 text-xs select-none`}>▶</button>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${centerSize} bg-[#2a2a2a] rounded-sm`} />
    </div>
  );
}

// ── AB Buttons Component (extracted outside to prevent remounts) ──
// A button = action (Space/Enter in-game), B button = back (Escape)
function ABButtons({ size = 'normal', onPressA, onReleaseA, onPressB, onReleaseB }: {
  size?: 'normal' | 'large';
  onPressA: () => void; onReleaseA: () => void;
  onPressB: () => void; onReleaseB: () => void;
}) {
  const btnSize = size === 'large' ? 'w-[72px] h-[72px] text-lg' : 'w-14 h-14 text-sm';

  return (
    <div className="flex gap-3 -rotate-12">
      <div>
        <button onPointerDown={onPressB} onPointerUp={onReleaseB} onPointerLeave={onReleaseB} onPointerCancel={onReleaseB} className={`${btnSize} rounded-full bg-[#9b1b30] shadow-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center text-[#c8c8c8] font-bold select-none`}>B</button>
      </div>
      <div className="-mt-4">
        <button onPointerDown={onPressA} onPointerUp={onReleaseA} onPointerLeave={onReleaseA} onPointerCancel={onReleaseA} className={`${btnSize} rounded-full bg-[#9b1b30] shadow-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center text-[#c8c8c8] font-bold select-none`}>A</button>
      </div>
    </div>
  );
}

export default function GameBoyTheme() {
  const setTheme = useStore((s) => s.setTheme);
  const visitSection = useStore((s) => s.visitSection);
  const achievements = useStore((s) => s.achievements);
  const xp = useStore((s) => s.xp);
  const level = useStore((s) => s.level);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<'gameboy' | 'psp'>('psp');
  const [isMobile, setIsMobile] = useState(false);

  const isInGame = GAME_SCREENS.includes(currentScreen);
  const isPSP = displayMode === 'psp';

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const menuItems: MenuItem[] = [
    { id: 'stats', label: 'CHARACTER STATS', icon: '⚔️' },
    { id: 'quests', label: 'QUEST LOG', icon: '📜' },
    { id: 'inventory', label: 'INVENTORY', icon: '🎒' },
    { id: 'games', label: 'MINI GAMES', icon: '🎮' },
    { id: 'achievements', label: 'ACHIEVEMENTS', icon: '🏆' },
    { id: 'contact', label: 'SAVE & CONTACT', icon: '💾' },
  ];

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

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    setSelectedIndex(0); // Reset selection when entering any sub-screen
    if (screen === 'stats') visitSection('skills');
    if (screen === 'quests') visitSection('experience');
    if (screen === 'inventory') visitSection('projects');
    if (screen === 'contact') visitSection('contact');
  }, [visitSection]);

  // Auto-scroll selected menu/game item into view when navigating with keyboard/D-pad
  useEffect(() => {
    if (currentScreen === 'menu' || currentScreen === 'games') {
      const el = document.querySelector(`[data-gb-idx="${selectedIndex}"]`);
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, currentScreen]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (currentScreen === 'menu') {
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((p) => Math.max(0, p - 1)); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((p) => Math.min(menuItems.length - 1, p + 1)); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(menuItems[selectedIndex].id); }
        else if (e.key === 'Escape' || e.key === 'Backspace') { setTheme('landing'); }
      } else if (currentScreen === 'games') {
        // Arrow navigation on the games list
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((p) => Math.max(0, p - 1)); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((p) => Math.min(GAMES_LIST.length - 1, p + 1)); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrentScreen(GAMES_LIST[selectedIndex].id); }
        else if (e.key === 'Escape' || e.key === 'Backspace') { setSelectedIndex(0); setCurrentScreen('menu'); }
      } else if (!isInGame) {
        // Any other non-game sub-screen (stats, quests, etc.)
        if (e.key === 'Escape' || e.key === 'Backspace') { setSelectedIndex(0); setCurrentScreen('menu'); }
      }
      // When isInGame, let game components handle all keys
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentScreen, selectedIndex, menuItems, navigate, isInGame, setTheme]);

  // ── D-Pad handlers (press + release) ──
  // Press: menu/games-list navigation uses single taps; in-game dispatches keydown
  const handleDPadPress = useCallback((direction: Dir) => {
    const keyMap: Record<Dir, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
    if (currentScreen === 'menu') {
      if (direction === 'up') setSelectedIndex((p) => Math.max(0, p - 1));
      if (direction === 'down') setSelectedIndex((p) => Math.min(menuItems.length - 1, p + 1));
    } else if (currentScreen === 'games') {
      if (direction === 'up') setSelectedIndex((p) => Math.max(0, p - 1));
      if (direction === 'down') setSelectedIndex((p) => Math.min(GAMES_LIST.length - 1, p + 1));
    } else {
      // In-game or other screens: dispatch keydown (game loop reads held keys)
      simulateKeyDown(keyMap[direction]);
    }
  }, [currentScreen, menuItems.length]);

  // Release: always dispatch keyup so held-key sets clear properly
  const handleDPadRelease = useCallback((direction: Dir) => {
    const keyMap: Record<Dir, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
    simulateKeyUp(keyMap[direction]);
  }, []);

  // ── A button handlers (press + release) ──
  // A = action: menu confirm, game-list launch, or Space key in-game
  const handleAPress = useCallback(() => {
    if (currentScreen === 'menu') {
      navigate(menuItems[selectedIndex].id);
    } else if (currentScreen === 'games') {
      setCurrentScreen(GAMES_LIST[selectedIndex].id);
    } else if (isInGame) {
      // Space works for: start/restart, shoot (Space Invaders), jump (Dino), flap (Flappy)
      simulateKeyDown(' ');
    }
  }, [currentScreen, menuItems, selectedIndex, navigate, isInGame]);

  const handleARelease = useCallback(() => {
    simulateKeyUp(' ');
    simulateKeyUp('Enter');
  }, []);

  // ── B button handlers (press + release) ──
  const handleBPress = useCallback(() => {
    if (currentScreen === 'menu') {
      setTheme('landing');
    } else if (isInGame) {
      simulateKeyDown('Escape');
    } else {
      setSelectedIndex(0);
      setCurrentScreen('menu');
    }
  }, [currentScreen, isInGame, setTheme]);

  const handleBRelease = useCallback(() => {
    simulateKeyUp('Escape');
  }, []);

  const renderScreen = () => {
    const maxH = isPSP ? 'max-h-[calc(80vh-130px)]' : 'max-h-[calc(75vh-180px)]';
    // Responsive text sizes: PSP (large screen) vs GameBoy (compact)
    const lg = isPSP && !isMobile;
    const sz = {
      heading: lg ? 'text-lg' : 'text-sm',
      title: lg ? 'text-base' : 'text-xs',
      body: lg ? 'text-sm' : 'text-xs',
      small: lg ? 'text-xs' : 'text-[10px]',
      menu: lg ? 'text-lg' : 'text-base',
      back: lg ? 'text-sm' : 'text-xs',
      hint: lg ? 'text-xs' : 'text-[10px]',
      bar: lg ? 'h-3' : 'h-2',
      pad: lg ? 'p-5' : 'p-3',
      padInner: lg ? 'p-4' : 'p-2',
      gap: lg ? 'space-y-3' : 'space-y-2',
      menuPy: lg ? 'py-3' : 'py-2',
    };

    switch (currentScreen) {
      case 'menu':
        return (
          <div className={`${sz.pad} flex flex-col h-full`}>
            <div className="text-center mb-4">
              <p className={`${sz.title} opacity-70`}>— MAIN MENU —</p>
            </div>
            <div className={`${sz.gap} flex-1`}>
              {menuItems.map((item, i) => (
                <button
                  key={item.id}
                  data-gb-idx={i}
                  className={`w-full text-left px-4 ${sz.menuPy} rounded ${sz.menu} font-mono cursor-pointer transition-all ${
                    selectedIndex === i ? 'bg-[#306230] text-[#9bbc0f]' : 'text-[#306230] hover:bg-[#306230]/30'
                  }`}
                  onClick={() => { setSelectedIndex(i); navigate(item.id); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  {selectedIndex === i ? '▶ ' : '  '}{item.icon} {item.label}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className={`${sz.hint} opacity-50`}>▲▼ to select • A to confirm • B to exit</p>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className={`${sz.pad} overflow-y-auto ${maxH}`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`${sz.title} opacity-70`}>— CHARACTER STATS —</p>
              <button onClick={() => setCurrentScreen('menu')} className={`${sz.back} cursor-pointer underline`}>BACK</button>
            </div>
            <div className={`border border-[#306230] rounded ${sz.padInner} mb-4`}>
              <p className={`${sz.heading} font-bold`}>{portfolioData.name}</p>
              <p className={sz.body}>{portfolioData.title}</p>
              <p className={`${sz.body} mt-1`}>LV: {level}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={sz.small}>XP:</span>
                <div className={`flex-1 ${sz.bar} bg-[#0f380f] rounded-full overflow-hidden`}>
                  <div className="h-full bg-[#9bbc0f] rounded-full transition-all" style={{ width: `${Math.min((xp / 500) * 100, 100)}%` }} />
                </div>
                <span className={sz.small}>{xp}/500</span>
              </div>
            </div>
            <p className={`${sz.body} mb-3 opacity-70`}>SKILL TREE:</p>
            <div className="space-y-2">
              {skillStats.map((skill) => (
                <div key={skill.name} className="flex items-center gap-2">
                  <span className={`${sz.body} ${lg ? 'w-28' : 'w-20'} shrink-0`}>{skill.emoji} {skill.name}</span>
                  <div className={`flex-1 ${sz.bar} bg-[#0f380f] rounded-full overflow-hidden`}>
                    <motion.div className="h-full bg-[#9bbc0f] rounded-full" initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
                  </div>
                  <span className={`${sz.small} w-8 text-right`}>{skill.level}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'quests':
        return (
          <div className={`${sz.pad} overflow-y-auto ${maxH}`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`${sz.title} opacity-70`}>— QUEST LOG —</p>
              <button onClick={() => setCurrentScreen('menu')} className={`${sz.back} cursor-pointer underline`}>BACK</button>
            </div>
            {portfolioData.experience.map((exp, i) => (
              <div key={i} className={`border border-[#306230] rounded ${sz.padInner} mb-3`}>
                <div className="flex items-center justify-between">
                  <p className={`${sz.heading} font-bold`}>{exp.company}</p>
                  <span className={`${sz.small} bg-[#306230] px-2 py-0.5 rounded`}>{i === 0 ? '🟢 ACTIVE' : '✅ DONE'}</span>
                </div>
                <p className={`${sz.body} opacity-70`}>{exp.role}</p>
                <p className={`${sz.small} opacity-50`}>{exp.duration}</p>
                <div className="mt-2 space-y-1.5">
                  {exp.bullets.slice(0, 3).map((b, j) => (
                    <p key={j} className={`${sz.small} leading-relaxed`}>▸ {lg ? b : (b.length > 80 ? b.substring(0, 80) + '...' : b)}</p>
                  ))}
                  {exp.bullets.length > 3 && <p className={`${sz.small} opacity-50`}>+{exp.bullets.length - 3} more objectives...</p>}
                </div>
              </div>
            ))}
            <div className={`border border-[#306230] rounded ${sz.padInner} mb-3`}>
              <div className="flex items-center justify-between">
                <p className={`${sz.heading} font-bold`}>🎓 Origin Story</p>
                <span className={`${sz.small} bg-[#306230] px-2 py-0.5 rounded`}>✅ DONE</span>
              </div>
              <p className={sz.body}>{portfolioData.education[0].institution}</p>
              <p className={`${sz.small} opacity-70`}>{portfolioData.education[0].degree}</p>
              <p className={`${sz.small} opacity-50`}>{portfolioData.education[0].gpa} • {portfolioData.education[0].duration}</p>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className={`${sz.pad} overflow-y-auto ${maxH}`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`${sz.title} opacity-70`}>— INVENTORY —</p>
              <button onClick={() => setCurrentScreen('menu')} className={`${sz.back} cursor-pointer underline`}>BACK</button>
            </div>
            <p className={`${sz.body} mb-3`}>Projects & Tools:</p>
            {portfolioData.projects.map((proj, i) => (
              <div key={i} className={`border border-[#306230] rounded ${sz.padInner} mb-3`}>
                <p className={`${sz.heading} font-bold`}>🗡️ {proj.name}</p>
                <p className={`${sz.small} opacity-70`}>Tech: {proj.techStack}</p>
                <div className="mt-2 space-y-1.5">
                  {proj.bullets.map((b, j) => (
                    <p key={j} className={`${sz.small} leading-relaxed`}>▸ {lg ? b : (b.length > 80 ? b.substring(0, 80) + '...' : b)}</p>
                  ))}
                </div>
              </div>
            ))}
            <p className={`${sz.body} mb-3 mt-4`}>Certifications:</p>
            {portfolioData.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <span className="text-lg">📜</span>
                <div>
                  <p className={`${sz.body} font-bold`}>{cert.name}</p>
                  <p className={`${sz.small} opacity-70`}>{cert.issuer}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'achievements':
        return (
          <div className={`${sz.pad} overflow-y-auto ${maxH}`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`${sz.title} opacity-70`}>— ACHIEVEMENTS —</p>
              <button onClick={() => setCurrentScreen('menu')} className={`${sz.back} cursor-pointer underline`}>BACK</button>
            </div>
            <div className={sz.gap}>
              {achievements.map((ach) => (
                <div key={ach.id} className={`flex items-center gap-3 ${sz.padInner} rounded border ${ach.unlocked ? 'border-[#9bbc0f] bg-[#306230]/30' : 'border-[#306230]/30 opacity-40'}`}>
                  <span className={lg ? 'text-2xl' : 'text-lg'}>{ach.unlocked ? ach.icon : '🔒'}</span>
                  <div>
                    <p className={`${sz.body} font-bold`}>{ach.name}</p>
                    <p className={`${sz.small} opacity-70`}>{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className={`${sz.hint} opacity-50`}>{achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked</p>
            </div>
          </div>
        );

      case 'games':
        return (
          <div className={`${sz.pad} overflow-y-auto ${maxH}`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`${sz.title} opacity-70`}>— MINI GAMES —</p>
              <button onClick={() => { setSelectedIndex(0); setCurrentScreen('menu'); }} className={`${sz.back} cursor-pointer underline`}>BACK</button>
            </div>
            <div className={sz.gap}>
              {GAMES_LIST.map((game, i) => {
                const hi = useStore.getState().highScores[game.scoreKey];
                return (
                  <button
                    key={game.id}
                    data-gb-idx={i}
                    onClick={() => setCurrentScreen(game.id)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full text-left px-4 ${sz.menuPy} rounded border transition-all cursor-pointer ${
                      selectedIndex === i
                        ? 'border-[#9bbc0f] bg-[#306230] text-[#9bbc0f]'
                        : 'border-[#306230] hover:bg-[#306230]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`${sz.body} font-bold`}>{selectedIndex === i ? '▶ ' : '  '}{game.name}</p>
                      {hi ? <span className={sz.small}>HI: {hi}</span> : null}
                    </div>
                    <p className={`${sz.small} opacity-70`}>{game.desc}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className={`${sz.hint} opacity-50`}>▲▼ to select • A to play • B to go back</p>
            </div>
          </div>
        );

      case 'snake':
        return <SnakeGame variant="gameboy" onExit={() => setCurrentScreen('games')} />;
      case 'dino':
        return <DinoGame variant="gameboy" onExit={() => setCurrentScreen('games')} />;
      case 'typer':
        return <CodeTyper variant="gameboy" onExit={() => setCurrentScreen('games')} />;
      case 'memory':
        return <MemoryMatch variant="gameboy" onExit={() => setCurrentScreen('games')} />;
      case 'wordle':
        return <TechWordle variant="gameboy" onExit={() => setCurrentScreen('games')} />;
      case 'flappy':
        return <FlappyBird variant="gameboy" onExit={() => setCurrentScreen('games')} />;
      case 'pong':
        return <PongGame variant="gameboy" onExit={() => setCurrentScreen('games')} />;
      case 'invaders':
        return <SpaceInvaders variant="gameboy" onExit={() => setCurrentScreen('games')} />;

      case 'contact':
        return (
          <div className={`${sz.pad} overflow-y-auto ${maxH}`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`${sz.title} opacity-70`}>— SAVE & CONTACT —</p>
              <button onClick={() => setCurrentScreen('menu')} className={`${sz.back} cursor-pointer underline`}>BACK</button>
            </div>
            <div className={`border border-[#306230] rounded ${sz.padInner} text-center mb-4`}>
              <p className={lg ? 'text-3xl mb-3' : 'text-lg mb-2'}>💾</p>
              <p className={`${sz.heading} font-bold`}>GAME SAVED!</p>
              <p className={`${sz.small} opacity-70 mt-1`}>Progress auto-saved to browser</p>
            </div>
            <p className={`${sz.body} mb-3`}>Connect with the player:</p>
            <div className={sz.gap}>
              {[
                { icon: '📧', label: 'EMAIL', value: portfolioData.email, href: `mailto:${portfolioData.email}` },
                { icon: '📱', label: 'PHONE', value: portfolioData.phone },
                { icon: '🔗', label: 'LINKEDIN', value: portfolioData.linkedin, href: `https://${portfolioData.linkedin}` },
                { icon: '💻', label: 'LEETCODE', value: portfolioData.leetcode, href: `https://${portfolioData.leetcode}` },
              ].map((item) => (
                <a key={item.label} href={item.href || '#'} target="_blank" rel="noopener noreferrer" className={`block border border-[#306230] rounded ${sz.padInner} hover:bg-[#306230]/30 transition-colors no-underline text-[#9bbc0f]`}>
                  <p className={sz.body}>{item.icon} {item.label}</p>
                  <p className={`${sz.small} opacity-70`}>{item.value}</p>
                </a>
              ))}
            </div>
          </div>
        );
    }
  };

  // Screen content (shared between both shells)
  const screenContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className="bg-[#306230] text-[#9bbc0f] px-4 py-2 flex items-center justify-between shrink-0">
        <span className={`font-bold ${isPSP && !isMobile ? 'text-base' : 'text-xs'}`}>{isPSP && !isMobile ? 'PORTFOLIO RPG — PSP MODE' : 'PORTFOLIO RPG'}</span>
        <span className={`${isPSP && !isMobile ? 'text-base' : 'text-xs'}`}>❤️ {Math.min(xp, 500)}/500</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <div className="h-screen bg-[#1a1a2e] flex items-center justify-center p-4 overflow-hidden">
      {/* Back button */}
      <button onClick={() => setTheme('landing')} className="fixed top-4 left-4 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm z-10">← Back</button>

      {/* Mode toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={() => setDisplayMode((m) => m === 'gameboy' ? 'psp' : 'gameboy')}
          className="fixed top-4 right-4 bg-[#0f380f] text-[#9bbc0f] border border-[#9bbc0f]/30 px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer hover:bg-[#306230] transition-colors z-10"
        >
          {isPSP ? '🎮 GameBoy' : '📺 Widescreen'}
        </button>
      )}

      {/* ── PSP / WIDESCREEN SHELL ── */}
      {isPSP && !isMobile ? (
        <div className="relative w-[92vw] max-w-[1500px]">
          <div className="bg-[#1a1a1a] rounded-[30px] p-8 shadow-2xl flex items-center gap-8 h-[84vh] max-h-[calc(100vh-4rem)]">
            {/* Left controls */}
            <div className="shrink-0 flex flex-col items-center gap-4">
              <DPad size="large" onPress={handleDPadPress} onRelease={handleDPadRelease} />
              <div className="flex gap-4 mt-2">
                <button onClick={() => setCurrentScreen('menu')} className="bg-[#333] w-12 h-3.5 rounded-full cursor-pointer active:bg-[#555]" title="SELECT" />
                <button onClick={() => setCurrentScreen('menu')} className="bg-[#333] w-12 h-3.5 rounded-full cursor-pointer active:bg-[#555]" title="START" />
              </div>
              <div className="flex gap-6">
                <span className="text-[9px] text-[#555] tracking-wider">SEL</span>
                <span className="text-[9px] text-[#555] tracking-wider">STA</span>
              </div>
            </div>

            {/* Screen */}
            <div className="flex-1 bg-[#4a4a6a] rounded-lg p-3 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] text-gray-400 tracking-wider">POWER</span>
              </div>
              <div
                className="bg-[#9bbc0f] rounded-sm overflow-hidden relative flex-1 flex flex-col"
                style={{ fontFamily: '"JetBrains Mono", "Press Start 2P", monospace', color: '#306230', imageRendering: 'pixelated' }}
              >
                {screenContent}
              </div>
            </div>

            {/* Right controls */}
            <div className="shrink-0 flex flex-col items-center gap-4">
              <ABButtons size="large" onPressA={handleAPress} onReleaseA={handleARelease} onPressB={handleBPress} onReleaseB={handleBRelease} />
              <div className="mt-6 text-center">
                <p className="text-xs text-[#555]">A = Enter</p>
                <p className="text-xs text-[#555]">B = Back</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── GAMEBOY SHELL ── */
        <div className="bg-[#c8c8c8] rounded-[20px] rounded-b-[40px] p-5 shadow-2xl w-[92vw] max-w-[540px] md:max-w-[640px] max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
          {/* Speaker grille */}
          <div className="flex items-center gap-1 mb-2 ml-2 shrink-0">
            <div className="w-8 h-0.5 bg-[#888] rounded" />
            <div className="w-8 h-0.5 bg-[#888] rounded" />
          </div>

          {/* Screen bezel */}
          <div className="bg-[#4a4a6a] rounded-lg p-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-1 shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-gray-400 tracking-wider">POWER</span>
            </div>

            {/* Screen */}
            <div
              className="bg-[#9bbc0f] rounded-sm overflow-hidden relative flex flex-col flex-1 min-h-0"
              style={{ fontFamily: '"JetBrains Mono", "Press Start 2P", monospace', color: '#306230', imageRendering: 'pixelated' }}
            >
              {screenContent}
            </div>

            <div className="text-center mt-1 shrink-0">
              <span className="text-[8px] text-gray-400 italic tracking-widest">DOT MATRIX WITH STEREO SOUND</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-5 flex items-start justify-between px-4 shrink-0">
            <DPad onPress={handleDPadPress} onRelease={handleDPadRelease} />
            <ABButtons onPressA={handleAPress} onReleaseA={handleARelease} onPressB={handleBPress} onReleaseB={handleBRelease} />
          </div>

          {/* Select / Start */}
          <div className="flex justify-center gap-8 mt-5 shrink-0">
            <button onClick={() => setCurrentScreen('menu')} className="bg-[#888] w-14 h-3.5 rounded-full cursor-pointer active:bg-[#666]" title="SELECT" />
            <button onClick={() => setCurrentScreen('menu')} className="bg-[#888] w-14 h-3.5 rounded-full cursor-pointer active:bg-[#666]" title="START" />
          </div>
          <div className="flex justify-center gap-12 mt-1 shrink-0">
            <span className="text-[9px] text-[#666] tracking-wider">SELECT</span>
            <span className="text-[9px] text-[#666] tracking-wider">START</span>
          </div>
        </div>
      )}

      {/* XP bar */}
      <motion.div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#0f380f] border border-[#9bbc0f]/30 rounded-full px-4 py-2 flex items-center gap-3 text-[#9bbc0f] text-xs font-mono z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>{level}</span>
        <div className="w-24 h-1.5 bg-[#306230] rounded-full overflow-hidden">
          <div className="h-full bg-[#9bbc0f] rounded-full transition-all" style={{ width: `${Math.min((xp / 500) * 100, 100)}%` }} />
        </div>
        <span>{xp} XP</span>
      </motion.div>
    </div>
  );
}
