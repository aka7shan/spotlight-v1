import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { SwipeOverlay, useIsMobile } from '../components/TouchControls';

interface DinoGameProps {
  variant: 'arcade' | 'terminal';
  onExit: () => void;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
}

const GROUND_Y = 150;
const DINO_WIDTH = 30;
const DINO_HEIGHT = 35;
const GRAVITY = 0.8;
const JUMP_FORCE = -13;
const GAME_WIDTH = 300;

export default function DinoGame({ variant, onExit }: DinoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const setHighScore = useStore((s) => s.setHighScore);

  const gameState = useRef({
    dinoY: GROUND_Y - DINO_HEIGHT,
    dinoVelocity: 0,
    isJumping: false,
    isDucking: false,
    obstacles: [] as Obstacle[],
    speed: 4,
    score: 0,
    frameCount: 0,
    groundOffset: 0,
  });

  const animRef = useRef<number>(0);
  const isArcade = variant === 'arcade';
  const isMobile = useIsMobile();
  const duckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawnObstacle = useCallback(() => {
    const state = gameState.current;
    const type = Math.random() > 0.8 ? 'bird' : 'cactus';
    state.obstacles.push({
      x: GAME_WIDTH + 20,
      width: type === 'cactus' ? 15 + Math.random() * 10 : 20,
      height: type === 'cactus' ? 25 + Math.random() * 15 : 15,
      type,
    });
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      dinoY: GROUND_Y - DINO_HEIGHT,
      dinoVelocity: 0,
      isJumping: false,
      isDucking: false,
      obstacles: [],
      speed: 4,
      score: 0,
      frameCount: 0,
      groundOffset: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, []);

  // Handle keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }

      if (!gameStarted || gameOver) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          resetGame();
        }
        return;
      }

      const state = gameState.current;
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && !state.isJumping) {
        e.preventDefault();
        state.dinoVelocity = JUMP_FORCE;
        state.isJumping = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        state.isDucking = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        gameState.current.isDucking = false;
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, onExit, resetGame]);

  const handleTap = useCallback(() => {
    if (!gameStarted || gameOver) {
      resetGame();
      return;
    }
    const state = gameState.current;
    if (!state.isJumping) {
      state.dinoVelocity = JUMP_FORCE;
      state.isJumping = true;
    }
  }, [gameStarted, gameOver, resetGame]);

  const handleSwipeDown = useCallback(() => {
    const state = gameState.current;
    if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current);
    state.isDucking = true;
    duckTimeoutRef.current = setTimeout(() => {
      gameState.current.isDucking = false;
      duckTimeoutRef.current = null;
    }, 500);
  }, []);

  const handleSwipe = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (dir === 'down') handleSwipeDown();
  }, [handleSwipeDown]);

  useEffect(() => {
    return () => {
      if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current);
    };
  }, []);

  // Game loop with canvas
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const arcadeColors = {
      bg: '#0a0a1a',
      dark: '#00f0ff',
      mid: '#ff00aa',
      light: '#39ff14',
    };

    const termColors = {
      bg: '#000000',
      dark: '#00ff00',
      mid: '#00aa00',
      light: '#005500',
    };

    const colors = isArcade ? arcadeColors : termColors;

    const gameLoop = () => {
      const state = gameState.current;

      // Physics
      state.dinoVelocity += GRAVITY;
      state.dinoY += state.dinoVelocity;

      if (state.dinoY >= GROUND_Y - DINO_HEIGHT) {
        state.dinoY = GROUND_Y - DINO_HEIGHT;
        state.dinoVelocity = 0;
        state.isJumping = false;
      }

      // Move obstacles
      state.obstacles = state.obstacles.filter((o) => o.x > -30);
      state.obstacles.forEach((o) => {
        o.x -= state.speed;
      });

      // Spawn obstacles
      state.frameCount++;
      if (state.frameCount % Math.max(40, 80 - Math.floor(state.score / 5)) === 0) {
        spawnObstacle();
      }

      // Score
      if (state.frameCount % 5 === 0) {
        state.score++;
        setScore(state.score);
      }

      // Speed up
      state.speed = 4 + Math.floor(state.score / 50) * 0.5;
      state.groundOffset = (state.groundOffset + state.speed) % 20;

      // Collision
      const dinoBox = {
        x: 20,
        y: state.dinoY,
        w: state.isDucking ? DINO_WIDTH : DINO_WIDTH - 5,
        h: state.isDucking ? DINO_HEIGHT / 2 : DINO_HEIGHT,
      };
      if (state.isDucking) {
        dinoBox.y = GROUND_Y - DINO_HEIGHT / 2;
      }

      for (const obs of state.obstacles) {
        const obsY = obs.type === 'bird' ? GROUND_Y - 50 : GROUND_Y - obs.height;
        const obsBox = { x: obs.x, y: obsY, w: obs.width, h: obs.height };

        if (
          dinoBox.x < obsBox.x + obsBox.w &&
          dinoBox.x + dinoBox.w > obsBox.x &&
          dinoBox.y < obsBox.y + obsBox.h &&
          dinoBox.y + dinoBox.h > obsBox.y
        ) {
          setGameOver(true);
          setHighScore('dino', state.score);
          return;
        }
      }

      // Draw
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(canvas.width, GROUND_Y);
      ctx.stroke();

      // Ground texture
      ctx.lineWidth = 1;
      for (let i = -state.groundOffset; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, GROUND_Y + 5);
        ctx.lineTo(i + 8, GROUND_Y + 5);
        ctx.stroke();
      }

      // Dino
      ctx.fillStyle = colors.dark;
      const dinoDrawY = state.isDucking ? GROUND_Y - DINO_HEIGHT / 2 : state.dinoY;
      const dinoDrawH = state.isDucking ? DINO_HEIGHT / 2 : DINO_HEIGHT;

      // Body
      ctx.fillRect(20, dinoDrawY, DINO_WIDTH - 5, dinoDrawH);
      // Head
      ctx.fillRect(20 + DINO_WIDTH - 10, dinoDrawY - 5, 12, 12);
      // Eye
      ctx.fillStyle = colors.bg;
      ctx.fillRect(20 + DINO_WIDTH - 3, dinoDrawY - 2, 3, 3);
      // Legs
      ctx.fillStyle = colors.dark;
      if (state.frameCount % 10 < 5) {
        ctx.fillRect(25, dinoDrawY + dinoDrawH, 4, 8);
        ctx.fillRect(35, dinoDrawY + dinoDrawH, 4, 8);
      } else {
        ctx.fillRect(28, dinoDrawY + dinoDrawH, 4, 8);
        ctx.fillRect(38, dinoDrawY + dinoDrawH, 4, 8);
      }

      // Obstacles
      state.obstacles.forEach((obs) => {
        ctx.fillStyle = colors.dark;
        if (obs.type === 'cactus') {
          ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
          // Cactus arms
          ctx.fillRect(obs.x - 4, GROUND_Y - obs.height + 8, 4, 10);
          ctx.fillRect(obs.x + obs.width, GROUND_Y - obs.height + 12, 4, 8);
        } else {
          // Bird
          const birdY = GROUND_Y - 50;
          ctx.fillRect(obs.x, birdY, obs.width, 8);
          // Wings
          if (state.frameCount % 12 < 6) {
            ctx.fillRect(obs.x + 3, birdY - 6, 10, 6);
          } else {
            ctx.fillRect(obs.x + 3, birdY + 8, 10, 6);
          }
        }
      });

      // Score
      ctx.fillStyle = colors.dark;
      ctx.font = `bold 12px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`HI ${String(useStore.getState().highScores.dino || 0).padStart(5, '0')}  ${String(state.score).padStart(5, '0')}`, canvas.width - 10, 20);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver, isArcade, spawnObstacle, setHighScore]);

  return (
    <div
      className={isArcade ? 'p-3 flex flex-col h-full' : 'flex flex-col'}
      style={!isArcade ? { height: 'calc(100vh - 14rem)' } : undefined}
    >
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className={isArcade ? 'text-xs opacity-70' : 'text-green-400 text-xs'}>— DINO JUMP —</p>
        <button
          onClick={onExit}
          className={isArcade ? 'text-xs cursor-pointer underline' : 'text-green-600 text-xs cursor-pointer underline'}
        >
          BACK
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={180}
          className={`border ${isArcade ? 'border-cyan-800' : 'border-green-800'} block w-full h-full`}
          style={{ 
            backgroundColor: isArcade ? '#0a0a1a' : '#000',
            imageRendering: 'pixelated',
            objectFit: 'contain',
          }}
        />

        {isArcade && isMobile && (
          <SwipeOverlay onTap={handleTap} onSwipe={handleSwipe} />
        )}

        {!gameStarted && !gameOver && (
          <div
            className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${isArcade ? 'bg-[#0a0a1a]/90' : 'bg-black/80'}`}
            style={isArcade && isMobile ? { pointerEvents: 'none' } : undefined}
          >
            <p className={`font-bold ${isArcade ? 'text-xl text-cyan-400' : 'text-lg text-green-400'}`}>🦖 DINO JUMP</p>
            <p className={isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-600'}>Jump over obstacles!</p>
            <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-500'}`}>
              Press ENTER or SPACE to start
            </p>
          </div>
        )}

        {gameOver && (
          <div
            className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${
              isArcade ? 'bg-[#0a0a1a]/90' : 'bg-black/80'
            }`}
            style={isArcade && isMobile ? { pointerEvents: 'none' } : undefined}
          >
            <p className={`font-bold ${isArcade ? 'text-xl text-cyan-400' : 'text-lg text-red-400'}`}>GAME OVER</p>
            <p className={isArcade ? 'text-base text-cyan-400' : 'text-sm text-green-400'}>Score: {score}</p>
            <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-500'}`}>
              Press ENTER to retry • ESC to exit
            </p>
          </div>
        )}
      </div>

      <p className={`text-center mt-2 shrink-0 ${isArcade ? 'text-xs opacity-50' : 'text-green-700 text-xs'}`}>
        {isMobile && isArcade ? 'Tap to jump • Swipe down to duck' : 'SPACE/↑ to jump • ↓ to duck • ESC to exit'}
      </p>
    </div>
  );
}

