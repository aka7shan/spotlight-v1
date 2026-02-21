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

const GRID = 20;
const TECH_LOGOS = ['⚛️', '🐍', '☕', '🟢', '☁️', '🐳', '🍃', '🔷', '⚡', '🦀'];

export default function SnakeGame({ variant, onExit }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const setHighScore = useStore((s) => s.setHighScore);
  const isMobile = useIsMobile();
  const isArcade = variant === 'arcade';
  const animRef = useRef<number>(0);

  const state = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    dir: { x: 1, y: 0 } as Point,
    nextDir: { x: 1, y: 0 } as Point,
    food: { x: 15, y: 10 } as Point,
    foodEmoji: '⚛️',
    score: 0,
    speed: 150,
    lastTick: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    foodPulse: 0,
  });

  const spawnFood = useCallback((body: Point[]) => {
    const s = state.current;
    let pos: Point;
    do {
      pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (body.some((p) => p.x === pos.x && p.y === pos.y));
    s.food = pos;
    s.foodEmoji = TECH_LOGOS[Math.floor(Math.random() * TECH_LOGOS.length)];
    s.foodPulse = 0;
  }, []);

  const resetGame = useCallback(() => {
    const initial = [{ x: 10, y: 10 }];
    state.current = {
      snake: initial,
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 15, y: 10 },
      foodEmoji: TECH_LOGOS[Math.floor(Math.random() * TECH_LOGOS.length)],
      score: 0,
      speed: 150,
      lastTick: 0,
      particles: [],
      foodPulse: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    spawnFood(initial);
  }, [spawnFood]);

  const handleSwipe = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted || gameOver) return;
    const map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const newDir = map[dir];
    const cur = state.current.dir;
    if (newDir.x + cur.x !== 0 || newDir.y + cur.y !== 0) {
      state.current.nextDir = newDir;
    }
  }, [gameStarted, gameOver]);

  const handleTap = useCallback(() => {
    if (!gameStarted || gameOver) resetGame();
  }, [gameStarted, gameOver, resetGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }
      if (gameOver || !gameStarted) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }
      const cur = state.current.dir;
      const keyMap: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
      };
      const d = keyMap[e.key];
      if (d && (d.x + cur.x !== 0 || d.y + cur.y !== 0)) {
        state.current.nextDir = d;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, gameStarted, onExit, resetGame]);

  // Canvas sizing
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const sz = Math.floor(Math.min(rect.width, rect.height));
      canvas.width = sz;
      canvas.height = sz;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Main game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = isArcade
      ? { bg: '#0a0a1a', grid: '#0f1525', head: '#00f0ff', body: '#00a8b5', headGlow: 'rgba(0,240,255,0.3)', food: '#ff00aa', foodGlow: 'rgba(255,0,170,0.25)', text: '#00f0ff' }
      : { bg: '#000', grid: '#0a1a0a', head: '#4ade80', body: '#22c55e', headGlow: 'rgba(74,222,128,0.3)', food: '#fbbf24', foodGlow: 'rgba(251,191,36,0.2)', text: '#4ade80' };

    let lastTime = performance.now();
    state.current.lastTick = 0;

    const gameLoop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      const s = state.current;

      s.lastTick += dt;
      s.foodPulse += dt * 0.003;

      // Update particles
      s.particles = s.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 0.003;
        p.vy += 0.03;
        return p.life > 0;
      });

      // Game tick
      if (s.lastTick >= s.speed) {
        s.lastTick -= s.speed;
        s.dir = s.nextDir;

        const head = s.snake[0];
        const newHead = {
          x: (head.x + s.dir.x + GRID) % GRID,
          y: (head.y + s.dir.y + GRID) % GRID,
        };

        if (s.snake.some((p) => p.x === newHead.x && p.y === newHead.y)) {
          setGameOver(true);
          setHighScore('snake', s.score);
          return;
        }

        s.snake.unshift(newHead);

        if (newHead.x === s.food.x && newHead.y === s.food.y) {
          s.score += 10;
          setScore(s.score);
          if (s.score % 50 === 0) s.speed = Math.max(60, s.speed - 15);
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            s.particles.push({
              x: s.food.x, y: s.food.y,
              vx: Math.cos(angle) * 0.15, vy: Math.sin(angle) * 0.15,
              life: 1, color: colors.food,
            });
          }
          spawnFood(s.snake);
        } else {
          s.snake.pop();
        }
      }

      // ── DRAW ──
      const sz = canvas.width;
      const cell = sz / GRID;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, sz, sz);

      // Grid lines
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 0.5;
      for (let i = 1; i < GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, sz);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(sz, i * cell);
        ctx.stroke();
      }

      // Particles
      s.particles.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        const px = p.x * cell + cell / 2;
        const py = p.y * cell + cell / 2;
        ctx.beginPath();
        ctx.arc(px, py, cell * 0.2 * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Food glow + food
      const fx = s.food.x * cell + cell / 2;
      const fy = s.food.y * cell + cell / 2;
      const pulse = 1 + Math.sin(s.foodPulse) * 0.15;
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, cell * 1.5 * pulse);
      grad.addColorStop(0, colors.foodGlow);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(fx - cell * 2, fy - cell * 2, cell * 4, cell * 4);

      ctx.font = `${Math.floor(cell * 0.8)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.foodEmoji, fx, fy);

      // Snake body (draw tail to head so head overlaps)
      for (let i = s.snake.length - 1; i >= 0; i--) {
        const seg = s.snake[i];
        const sx = seg.x * cell;
        const sy = seg.y * cell;
        const inset = i === 0 ? 0.5 : 1;
        const radius = cell * 0.15;

        if (i === 0) {
          // Head glow
          const hx = sx + cell / 2;
          const hy = sy + cell / 2;
          const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, cell);
          hGrad.addColorStop(0, colors.headGlow);
          hGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = hGrad;
          ctx.fillRect(hx - cell, hy - cell, cell * 2, cell * 2);
        }

        const alpha = i === 0 ? 1 : 0.5 + 0.5 * (1 - i / s.snake.length);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i === 0 ? colors.head : colors.body;
        ctx.beginPath();
        ctx.roundRect(sx + inset, sy + inset, cell - inset * 2, cell - inset * 2, radius);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Eyes on head
      if (s.snake.length > 0) {
        const head = s.snake[0];
        const hx = head.x * cell;
        const hy = head.y * cell;
        ctx.fillStyle = colors.bg;
        const eyeSize = cell * 0.12;
        const eyeOffset = cell * 0.25;
        if (s.dir.x === 1) {
          ctx.fillRect(hx + cell - eyeOffset - eyeSize, hy + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(hx + cell - eyeOffset - eyeSize, hy + cell - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (s.dir.x === -1) {
          ctx.fillRect(hx + eyeOffset, hy + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(hx + eyeOffset, hy + cell - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (s.dir.y === -1) {
          ctx.fillRect(hx + eyeOffset, hy + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(hx + cell - eyeOffset - eyeSize, hy + eyeOffset, eyeSize, eyeSize);
        } else {
          ctx.fillRect(hx + eyeOffset, hy + cell - eyeOffset - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(hx + cell - eyeOffset - eyeSize, hy + cell - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
      }

      // HUD
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`SCORE: ${s.score}`, 6, 6);
      ctx.textAlign = 'right';
      ctx.fillText(`HI: ${useStore.getState().highScores.snake || 0}`, sz - 6, 6);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver, isArcade, spawnFood, setHighScore]);

  useEffect(() => {
    if (gameOver && score > 0) setHighScore('snake', score);
  }, [gameOver, score, setHighScore]);

  if (isArcade) {
    return (
      <div className="relative p-2 flex flex-col h-full">
        {isMobile && (
          <SwipeOverlay onSwipe={handleSwipe} onTap={handleTap} className="!fixed inset-0 !z-30" />
        )}
        <div className="flex items-center justify-between mb-1 relative z-40 pointer-events-auto">
          <p className="text-xs opacity-70">— SNAKE —</p>
          <button onClick={onExit} className="text-xs cursor-pointer underline">BACK</button>
        </div>

        <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="border border-[rgba(0,240,255,0.15)] rounded"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />

          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 z-10 text-[#00f0ff]">
              <p className="text-2xl font-bold">🐍 SNAKE</p>
              <p className="text-sm opacity-80">Catch the tech logos!</p>
              <p className="text-sm animate-pulse">{isMobile ? 'Tap to start' : 'Press ENTER to start'}</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-[#0a0a1a]/85 z-10 text-[#00f0ff]">
              <p className="text-2xl font-bold">GAME OVER</p>
              <p className="text-lg">Score: {score}</p>
              <p className="text-sm opacity-70">Best: {useStore.getState().highScores.snake || 0}</p>
              <p className="text-sm animate-pulse mt-2">{isMobile ? 'Tap to retry' : 'Press ENTER to retry'}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-center mt-1 opacity-40">
          {isMobile ? 'Swipe anywhere to move' : 'Arrow keys / WASD to move'} • ESC to exit
        </p>
      </div>
    );
  }

  // Terminal variant
  return (
    <div className="font-mono text-sm">
      <div className="flex justify-between text-green-400 mb-1">
        <span>🐍 SNAKE | Score: {score}</span>
        <span>High: {useStore.getState().highScores.snake || 0}</span>
      </div>
      <div ref={containerRef} className="flex items-center justify-center" style={{ height: 'min(100%, calc(100vh - 20rem))' }}>
        <canvas
          ref={canvasRef}
          className="border border-green-800 rounded"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />

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
      </div>
      <p className="text-green-700 text-xs mt-1">Arrow keys / WASD to move • ESC to exit</p>
    </div>
  );
}
