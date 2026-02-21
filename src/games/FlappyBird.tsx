import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useIsMobile } from '../components/TouchControls';

interface FlappyBirdProps {
  variant: 'arcade' | 'terminal';
  onExit: () => void;
}

interface Pipe {
  x: number;
  gapY: number;
  scored: boolean;
}

const GAME_W = 300;
const GAME_H = 180;
const BIRD_SIZE = 15;
const PIPE_WIDTH = 30;
const GAP_SIZE = 55;
const GRAVITY = 0.45;
const FLAP_FORCE = -5.5;
const PIPE_SPEED = 2.2;

export default function FlappyBird({ variant, onExit }: FlappyBirdProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const setHighScore = useStore((s) => s.setHighScore);
  const animRef = useRef<number>(0);

  const isArcade = variant === 'arcade';
  const isMobile = useIsMobile();

  const gameState = useRef({
    birdY: GAME_H / 2,
    birdVel: 0,
    pipes: [] as Pipe[],
    score: 0,
    frameCount: 0,
  });

  const flap = useCallback(() => {
    if (!gameStarted || gameOver) return;
    gameState.current.birdVel = FLAP_FORCE;
  }, [gameStarted, gameOver]);

  const resetGame = useCallback(() => {
    gameState.current = {
      birdY: GAME_H / 2,
      birdVel: 0,
      pipes: [],
      score: 0,
      frameCount: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, []);

  const handleCanvasTap = useCallback(() => {
    if (!gameStarted || gameOver) {
      resetGame();
    } else {
      flap();
    }
  }, [gameStarted, gameOver, resetGame, flap]);

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

      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        flap();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, gameOver, onExit, resetGame, flap]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = isArcade
      ? { bg: '#0a0a1a', bird: '#00f0ff', pipe: '#ff00aa', text: '#00f0ff', ground: '#39ff14' }
      : { bg: '#000000', bird: '#00ff00', pipe: '#00aa00', text: '#00ff00', ground: '#005500' };

    const gameLoop = () => {
      const s = gameState.current;

      // Physics
      s.birdVel += GRAVITY;
      s.birdY += s.birdVel;

      // Spawn pipes
      s.frameCount++;
      if (s.frameCount % 90 === 0) {
        const gapY = 30 + Math.random() * (GAME_H - GAP_SIZE - 60);
        s.pipes.push({ x: GAME_W + 10, gapY, scored: false });
      }

      // Move pipes
      s.pipes = s.pipes.filter((p) => p.x > -PIPE_WIDTH - 10);
      s.pipes.forEach((p) => {
        p.x -= PIPE_SPEED;

        // Score
        if (!p.scored && p.x + PIPE_WIDTH < 30) {
          p.scored = true;
          s.score++;
          setScore(s.score);
        }
      });

      // Collision
      const birdX = 30;
      const birdTop = s.birdY;
      const birdBottom = s.birdY + BIRD_SIZE;
      const birdRight = birdX + BIRD_SIZE;

      // Floor/ceiling
      if (birdBottom > GAME_H - 10 || birdTop < 0) {
        setGameOver(true);
        setHighScore('flappy', s.score);
        return;
      }

      // Pipes
      for (const p of s.pipes) {
        if (birdRight > p.x && birdX < p.x + PIPE_WIDTH) {
          if (birdTop < p.gapY || birdBottom > p.gapY + GAP_SIZE) {
            setGameOver(true);
            setHighScore('flappy', s.score);
            return;
          }
        }
      }

      // Draw
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // Ground
      ctx.fillStyle = colors.ground;
      ctx.fillRect(0, GAME_H - 10, GAME_W, 10);

      // Pipes
      ctx.fillStyle = colors.pipe;
      s.pipes.forEach((p) => {
        // Top pipe
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gapY);
        // Bottom pipe
        ctx.fillRect(p.x, p.gapY + GAP_SIZE, PIPE_WIDTH, GAME_H - p.gapY - GAP_SIZE);
        // Pipe caps
        ctx.fillRect(p.x - 3, p.gapY - 6, PIPE_WIDTH + 6, 6);
        ctx.fillRect(p.x - 3, p.gapY + GAP_SIZE, PIPE_WIDTH + 6, 6);
      });

      // Bird
      ctx.fillStyle = colors.bird;
      ctx.fillRect(birdX, s.birdY, BIRD_SIZE, BIRD_SIZE);
      // Eye
      ctx.fillStyle = colors.bg;
      ctx.fillRect(birdX + BIRD_SIZE - 5, s.birdY + 3, 3, 3);
      // Wing
      ctx.fillStyle = colors.bird;
      if (s.frameCount % 10 < 5) {
        ctx.fillRect(birdX + 2, s.birdY + BIRD_SIZE - 3, 8, 4);
      } else {
        ctx.fillRect(birdX + 2, s.birdY - 3, 8, 4);
      }

      // Score
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(s.score), GAME_W / 2, 20);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver, isArcade, setHighScore]);

  return (
    <div
      className={isArcade ? 'p-3 flex flex-col h-full' : 'flex flex-col'}
      style={!isArcade ? { height: 'calc(100vh - 14rem)' } : undefined}
    >
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className={isArcade ? 'text-xs opacity-70' : 'text-green-400 text-xs'}>— FLAPPY BIRD —</p>
        <button onClick={onExit} className={isArcade ? 'text-xs cursor-pointer underline' : 'text-green-600 text-xs cursor-pointer underline'}>BACK</button>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className={`border ${isArcade ? 'border-cyan-800' : 'border-green-800'} block w-full h-full cursor-pointer`}
          style={{ backgroundColor: isArcade ? '#0a0a1a' : '#000', imageRendering: 'pixelated', objectFit: 'contain' }}
          onClick={handleCanvasTap}
          onTouchStart={(e) => { e.preventDefault(); handleCanvasTap(); }}
        />

        {!gameStarted && !gameOver && (
          <div
            className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${isArcade ? 'bg-[#0a0a1a]/90' : 'bg-black/80'} cursor-pointer`}
            onClick={handleCanvasTap}
            onTouchStart={(e) => { e.preventDefault(); handleCanvasTap(); }}
          >
            <p className={`font-bold ${isArcade ? 'text-xl text-cyan-400' : 'text-lg text-green-400'}`}>🐦 FLAPPY BIRD</p>
            <p className={isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-600'}>Tap or SPACE to flap!</p>
            <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-500'}`}>Press ENTER to start</p>
          </div>
        )}

        {gameOver && (
          <div
            className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${isArcade ? 'bg-[#0a0a1a]/90' : 'bg-black/80'} cursor-pointer`}
            onClick={handleCanvasTap}
            onTouchStart={(e) => { e.preventDefault(); handleCanvasTap(); }}
          >
            <p className={`font-bold ${isArcade ? 'text-xl text-cyan-400' : 'text-lg text-red-400'}`}>GAME OVER</p>
            <p className={isArcade ? 'text-base text-cyan-400' : 'text-sm text-green-400'}>Score: {score}</p>
            <p className={isArcade ? 'text-sm text-cyan-400' : 'text-xs text-gray-500'}>Best: {useStore.getState().highScores.flappy || 0}</p>
            <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-500'}`}>ENTER to retry • ESC to exit</p>
          </div>
        )}
      </div>

      <p className={`text-center mt-2 shrink-0 ${isArcade ? 'text-xs opacity-50' : 'text-green-700 text-xs'}`}>
        {isMobile ? 'Tap to flap • Tap to start/retry' : 'SPACE/↑/tap to flap • ESC to exit'}
      </p>
    </div>
  );
}

