import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { SwipeOverlay, useIsMobile } from '../components/TouchControls';

interface Point {
  x: number;
  y: number;
}

interface SnakeGameProps {
  variant: 'arcade' | 'terminal';
  onExit: () => void;
}

const GRID_SIZE = 20;
const TECH_LOGOS = ['⚛️', '🐍', '☕', '🟢', '☁️', '🐳', '🍃', '🔷', '⚡', '🦀'];

export default function SnakeGame({ variant, onExit }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [foodEmoji, setFoodEmoji] = useState('⚛️');
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(150);
  const dirRef = useRef(direction);
  const setHighScore = useStore((s) => s.setHighScore);
  const isMobile = useIsMobile();

  const spawnFood = useCallback((snakeBody: Point[]) => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some((s) => s.x === newFood.x && s.y === newFood.y));
    setFood(newFood);
    setFoodEmoji(TECH_LOGOS[Math.floor(Math.random() * TECH_LOGOS.length)]);
  }, []);

  const resetGame = useCallback(() => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setDirection({ x: 1, y: 0 });
    dirRef.current = { x: 1, y: 0 };
    setGameOver(false);
    setScore(0);
    setSpeed(150);
    setGameStarted(true);
    spawnFood(initial);
  }, [spawnFood]);

  const handleSwipe = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted || gameOver) return;
    const dirMap = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const newDir = dirMap[dir];
    const current = dirRef.current;
    if (dir === 'up' || dir === 'down') {
      if (current.y === 0) { dirRef.current = newDir; setDirection(newDir); }
    } else {
      if (current.x === 0) { dirRef.current = newDir; setDirection(newDir); }
    }
  }, [gameStarted, gameOver]);

  const handleTap = useCallback(() => {
    if (!gameStarted || gameOver) resetGame();
  }, [gameStarted, gameOver, resetGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }

      if (gameOver) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      if (!gameStarted) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      const dir = dirRef.current;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (dir.y === 0) { dirRef.current = { x: 0, y: -1 }; setDirection({ x: 0, y: -1 }); }
          break;
        case 'ArrowDown': case 's': case 'S':
          if (dir.y === 0) { dirRef.current = { x: 0, y: 1 }; setDirection({ x: 0, y: 1 }); }
          break;
        case 'ArrowLeft': case 'a': case 'A':
          if (dir.x === 0) { dirRef.current = { x: -1, y: 0 }; setDirection({ x: -1, y: 0 }); }
          break;
        case 'ArrowRight': case 'd': case 'D':
          if (dir.x === 0) { dirRef.current = { x: 1, y: 0 }; setDirection({ x: 1, y: 0 }); }
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, gameStarted, onExit, resetGame]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const dir = dirRef.current;
        const newHead = {
          x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE,
        };

        // Self collision
        if (prev.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          setHighScore('snake', score);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore % 50 === 0) setSpeed((s) => Math.max(60, s - 15));
          spawnFood(newSnake);
          return newSnake; // Don't remove tail = grow
        }

        newSnake.pop(); // Remove tail
        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, food, score, speed, spawnFood, setHighScore]);

  // Save score on game over
  useEffect(() => {
    if (gameOver && score > 0) {
      setHighScore('snake', score);
    }
  }, [gameOver, score, setHighScore]);

  const isArcade = variant === 'arcade';

  // ── Arcade Variant ──
  if (isArcade) {
    const CELL = 'calc(100% / 20)';
    return (
      <div className="relative p-3 flex flex-col h-full">
        {/* Fullscreen swipe overlay for mobile — covers entire game area */}
        {isMobile && (
          <SwipeOverlay onSwipe={handleSwipe} onTap={handleTap} className="!fixed inset-0 !z-30" />
        )}

        <div className="flex items-center justify-between mb-2 relative z-40 pointer-events-auto">
          <p className="text-xs opacity-70">— SNAKE —</p>
          <button onClick={onExit} className="text-xs cursor-pointer underline">BACK</button>
        </div>

        <div className="flex justify-between text-xs mb-2">
          <span>SCORE: {score}</span>
          <span>HI: {useStore.getState().highScores.snake || 0}</span>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div
            className="border border-[rgba(0,240,255,0.2)] relative w-full bg-[#0a0a1a]"
            style={{ aspectRatio: '1', maxHeight: '100%' }}
          >
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 z-10 text-[#00f0ff]">
                <p className="text-xl font-bold">🐍 SNAKE</p>
                <p className="text-sm">Catch the tech logos!</p>
                <p className="text-sm animate-pulse">{isMobile ? 'Tap to start' : 'Press ENTER to start'}</p>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-[#0a0a1a]/90 z-10 text-[#00f0ff]">
                <p className="text-xl font-bold">GAME OVER</p>
                <p className="text-base">Score: {score}</p>
                <p className="text-sm animate-pulse">{isMobile ? 'Tap to retry' : 'Press ENTER to retry'}</p>
              </div>
            )}

            {gameStarted && (
              <>
                {snake.map((segment, i) => (
                  <div
                    key={i}
                    className="absolute rounded-sm"
                    style={{
                      left: `${(segment.x / GRID_SIZE) * 100}%`,
                      top: `${(segment.y / GRID_SIZE) * 100}%`,
                      width: CELL,
                      height: CELL,
                      backgroundColor: i === 0 ? '#00f0ff' : '#00c0cc',
                    }}
                  />
                ))}

                <div
                  className="absolute flex items-center justify-center bg-[#ff00aa]"
                  style={{
                    left: `${(food.x / GRID_SIZE) * 100}%`,
                    top: `${(food.y / GRID_SIZE) * 100}%`,
                    width: CELL,
                    height: CELL,
                    fontSize: '16px',
                  }}
                >
                  {foodEmoji}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-center mt-2 opacity-50">
          {isMobile ? 'Swipe anywhere to move • Tap to start' : 'Arrow keys / WASD to move'} • ESC to exit
        </p>
      </div>
    );
  }

  // ── Terminal Variant ──
  const CELL_T = `calc(100% / ${GRID_SIZE})`;
  return (
    <div className="font-mono text-sm">
      <div className="flex justify-between text-green-400 mb-1">
        <span>🐍 SNAKE | Score: {score}</span>
        <span>High: {useStore.getState().highScores.snake || 0}</span>
      </div>

      <div className="flex items-center justify-center">
        <div className="border border-green-800 relative bg-black/50" style={{ width: 'min(100%, calc(100vh - 20rem))', aspectRatio: '1' }}>
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 z-10">
              <p className="text-green-400 text-lg">🐍 SNAKE</p>
              <p className="text-green-600 text-xs mt-2">Catch the tech logos!</p>
              <p className="text-green-500 text-xs mt-4 animate-pulse">Press ENTER to start</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black/90 z-10">
              <p className="text-red-400 text-lg">GAME OVER</p>
              <p className="text-green-400 text-sm mt-2">Score: {score}</p>
              <p className="text-green-500 text-xs mt-4 animate-pulse">Press ENTER to retry • ESC to exit</p>
            </div>
          )}

          {gameStarted && !gameOver && (
            <>
              {/* Snake segments */}
              {snake.map((segment, i) => (
                <div
                  key={i}
                  className="absolute rounded-sm"
                  style={{
                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                    width: CELL_T,
                    height: CELL_T,
                    backgroundColor: i === 0 ? '#4ade80' : '#22c55e',
                    border: '1px solid rgba(0,0,0,0.3)',
                  }}
                />
              ))}
              {/* Food */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: `${(food.x / GRID_SIZE) * 100}%`,
                  top: `${(food.y / GRID_SIZE) * 100}%`,
                  width: CELL_T,
                  height: CELL_T,
                  fontSize: '16px',
                }}
              >
                {foodEmoji}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-green-700 text-xs mt-1">Arrow keys / WASD to move • ESC to exit</p>
    </div>
  );
}

