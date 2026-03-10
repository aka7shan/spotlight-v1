import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const SnakeGame = lazy(() => import('../games/SnakeGame'));
const DinoGame = lazy(() => import('../games/DinoGame'));
const CodeTyper = lazy(() => import('../games/CodeTyper'));
const MemoryMatch = lazy(() => import('../games/MemoryMatch'));
const TechWordle = lazy(() => import('../games/TechWordle'));
const FlappyBird = lazy(() => import('../games/FlappyBird'));
const PongGame = lazy(() => import('../games/PongGame'));
const SpaceInvaders = lazy(() => import('../games/SpaceInvaders'));

type GameId = 'snake' | 'dino' | 'typer' | 'memory' | 'wordle' | 'flappy' | 'pong' | 'invaders' | null;

const GAMES = [
  { id: 'snake' as const, name: 'Snake', icon: '🐍', desc: 'Catch the tech logos!', color: '#39ff14' },
  { id: 'dino' as const, name: 'Dino Jump', icon: '🦖', desc: 'Jump over obstacles!', color: '#00f0ff' },
  { id: 'flappy' as const, name: 'Flappy Bird', icon: '🐦', desc: 'Flap through pipes!', color: '#ffcc00' },
  { id: 'pong' as const, name: 'Pong', icon: '🏓', desc: 'You vs AI!', color: '#ff00aa' },
  { id: 'invaders' as const, name: 'Space Invaders', icon: '👾', desc: 'Defend from bugs!', color: '#9945ff' },
  { id: 'wordle' as const, name: 'Tech Wordle', icon: '📝', desc: 'Guess the word!', color: '#34c759' },
  { id: 'typer' as const, name: 'Code Typer', icon: '⌨️', desc: 'Type code fast!', color: '#007aff' },
  { id: 'memory' as const, name: 'Memory Match', icon: '🧠', desc: 'Match tech pairs!', color: '#ff9500' },
];

const NEON = '#00f0ff';

function GameLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-6 h-6 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );
}

export default function GamesPage() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<GameId>(null);
  const highScores = useStore((s) => s.highScores);

  const renderGame = () => {
    const props = { variant: 'arcade' as const, onExit: () => setActiveGame(null) };
    switch (activeGame) {
      case 'snake': return <SnakeGame {...props} />;
      case 'dino': return <DinoGame {...props} />;
      case 'flappy': return <FlappyBird {...props} />;
      case 'pong': return <PongGame {...props} />;
      case 'invaders': return <SpaceInvaders {...props} />;
      case 'wordle': return <TechWordle {...props} />;
      case 'typer': return <CodeTyper {...props} />;
      case 'memory': return <MemoryMatch {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0a1a' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 md:px-8 py-4 border-b"
        style={{ borderColor: 'rgba(0,240,255,0.08)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-sm font-mono hover:opacity-80 transition-opacity"
          style={{ color: NEON }}
        >
          ← Home
        </button>
        <h1
          className="text-lg md:text-xl font-black tracking-[0.2em] font-mono"
          style={{ color: NEON, textShadow: `0 0 20px rgba(0,240,255,0.25)` }}
        >
          ARCADE
        </h1>
        <div className="w-16" />
      </div>

      {activeGame ? (
        <div className="h-[calc(100vh-57px)]">
          <Suspense fallback={<GameLoader />}>
            {renderGame()}
          </Suspense>
        </div>
      ) : (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <p className="text-center text-white/30 text-sm mb-8 font-mono">
            SELECT A GAME TO PLAY
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {GAMES.map((game, i) => (
              <motion.button
                key={game.id}
                className="group relative rounded-xl p-5 md:p-6 text-center cursor-pointer"
                style={{
                  background: '#12122a',
                  border: `1px solid ${game.color}20`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{
                  scale: 1.04,
                  borderColor: `${game.color}50`,
                  boxShadow: `0 0 30px ${game.color}15, inset 0 0 20px ${game.color}08`,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveGame(game.id)}
              >
                <span className="text-3xl md:text-4xl block mb-3">{game.icon}</span>
                <p
                  className="text-xs md:text-sm font-bold tracking-wider font-mono mb-1"
                  style={{ color: game.color }}
                >
                  {game.name.toUpperCase()}
                </p>
                <p className="text-white/25 text-[10px] md:text-xs">{game.desc}</p>
                {highScores[game.id] > 0 && (
                  <p className="text-white/15 text-[9px] mt-2 font-mono">
                    HI: {highScores[game.id]}
                  </p>
                )}
              </motion.button>
            ))}
          </div>

          <p className="text-center text-white/10 text-xs mt-10 font-mono">
            PRESS ESC IN-GAME TO EXIT
          </p>
        </div>
      )}
    </div>
  );
}
