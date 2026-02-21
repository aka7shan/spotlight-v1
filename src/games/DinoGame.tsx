import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { SwipeOverlay, useIsMobile } from '../components/TouchControls';

interface DinoGameProps {
  variant: 'arcade' | 'terminal';
  onExit: () => void;
}

interface Obstacle {
  x: number; width: number; height: number; type: 'cactus' | 'bird';
}
interface Cloud {
  x: number; y: number; w: number; speed: number;
}
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number;
}

const GROUND_Y = 150;
const DINO_W = 30;
const DINO_H = 35;
const GRAVITY = 0.8;
const JUMP_FORCE = -13;
const GAME_W = 300;

export default function DinoGame({ variant, onExit }: DinoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const setHighScore = useStore((s) => s.setHighScore);
  const animRef = useRef<number>(0);
  const isArcade = variant === 'arcade';
  const isMobile = useIsMobile();
  const duckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gameState = useRef({
    dinoY: GROUND_Y - DINO_H,
    dinoVelocity: 0,
    isJumping: false,
    isDucking: false,
    obstacles: [] as Obstacle[],
    speed: 4,
    score: 0,
    frameCount: 0,
    groundOffset: 0,
    clouds: [] as Cloud[],
    particles: [] as Particle[],
    deathFlash: 0,
    runCycle: 0,
    milestone: 0,
    milestoneFlash: 0,
  });

  const initClouds = useCallback(() => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random() * GAME_W,
        y: 20 + Math.random() * 50,
        w: 25 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.4,
      });
    }
    return clouds;
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      dinoY: GROUND_Y - DINO_H,
      dinoVelocity: 0,
      isJumping: false,
      isDucking: false,
      obstacles: [],
      speed: 4,
      score: 0,
      frameCount: 0,
      groundOffset: 0,
      clouds: initClouds(),
      particles: [],
      deathFlash: 0,
      runCycle: 0,
      milestone: 0,
      milestoneFlash: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, [initClouds]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }
      if (!gameStarted || gameOver) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resetGame(); }
        return;
      }
      const s = gameState.current;
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && !s.isJumping) {
        e.preventDefault();
        s.dinoVelocity = JUMP_FORCE;
        s.isJumping = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        s.isDucking = true;
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
    if (!gameStarted || gameOver) { resetGame(); return; }
    const s = gameState.current;
    if (!s.isJumping) {
      s.dinoVelocity = JUMP_FORCE;
      s.isJumping = true;
    }
  }, [gameStarted, gameOver, resetGame]);

  const handleSwipeDown = useCallback(() => {
    const s = gameState.current;
    if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current);
    s.isDucking = true;
    duckTimeoutRef.current = setTimeout(() => {
      gameState.current.isDucking = false;
      duckTimeoutRef.current = null;
    }, 500);
  }, []);

  const handleSwipe = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (dir === 'down') handleSwipeDown();
    if (dir === 'up') handleTap();
  }, [handleSwipeDown, handleTap]);

  useEffect(() => {
    return () => { if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current); };
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = isArcade
      ? { bg: '#06060f', ground: '#00f0ff', groundDark: '#00607080', dino: '#00f0ff', dinoGlow: 'rgba(0,240,255,0.2)', obstacle: '#ff00aa', cloud: 'rgba(0,240,255,0.06)', text: '#00f0ff', bird: '#39ff14' }
      : { bg: '#000', ground: '#00ff00', groundDark: '#00550050', dino: '#4ade80', dinoGlow: 'rgba(74,222,128,0.15)', obstacle: '#00ff00', cloud: 'rgba(0,255,0,0.04)', text: '#00ff00', bird: '#00aa00' };

    const spawnObstacle = () => {
      const s = gameState.current;
      const type = Math.random() > 0.8 && s.score > 50 ? 'bird' : 'cactus';
      s.obstacles.push({
        x: GAME_W + 20,
        width: type === 'cactus' ? 14 + Math.random() * 10 : 20,
        height: type === 'cactus' ? 25 + Math.random() * 15 : 14,
        type,
      });
    };

    const gameLoop = () => {
      const s = gameState.current;
      s.frameCount++;

      // Physics
      s.dinoVelocity += GRAVITY;
      s.dinoY += s.dinoVelocity;
      if (s.dinoY >= GROUND_Y - DINO_H) {
        s.dinoY = GROUND_Y - DINO_H;
        s.dinoVelocity = 0;
        s.isJumping = false;
      }

      // Running animation cycle
      if (!s.isJumping) s.runCycle += s.speed * 0.15;

      // Clouds
      s.clouds.forEach((c) => {
        c.x -= c.speed;
        if (c.x + c.w < 0) { c.x = GAME_W + 10; c.y = 20 + Math.random() * 50; c.w = 25 + Math.random() * 30; }
      });

      // Particles
      s.particles = s.particles.filter((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.04;
        return p.life > 0;
      });

      // Move obstacles
      s.obstacles = s.obstacles.filter((o) => o.x > -40);
      s.obstacles.forEach((o) => { o.x -= s.speed; });

      // Spawn
      const spawnInterval = Math.max(35, 75 - Math.floor(s.score / 5));
      if (s.frameCount % spawnInterval === 0) spawnObstacle();

      // Score + milestones
      if (s.frameCount % 5 === 0) {
        s.score++;
        setScore(s.score);
        if (s.score > 0 && s.score % 100 === 0 && s.score > s.milestone) {
          s.milestone = s.score;
          s.milestoneFlash = 1;
        }
      }
      if (s.milestoneFlash > 0) s.milestoneFlash -= 0.015;

      // Speed progression
      s.speed = 4 + Math.floor(s.score / 50) * 0.5;
      s.groundOffset = (s.groundOffset + s.speed) % 20;

      // Collision
      const duck = s.isDucking;
      const dinoBox = {
        x: 22,
        y: duck ? GROUND_Y - DINO_H / 2 : s.dinoY,
        w: duck ? DINO_W + 2 : DINO_W - 6,
        h: duck ? DINO_H / 2 : DINO_H,
      };

      for (const obs of s.obstacles) {
        const obsY = obs.type === 'bird' ? GROUND_Y - 50 : GROUND_Y - obs.height;
        const obsBox = { x: obs.x + 2, y: obsY, w: obs.width - 4, h: obs.height };
        if (
          dinoBox.x < obsBox.x + obsBox.w &&
          dinoBox.x + dinoBox.w > obsBox.x &&
          dinoBox.y < obsBox.y + obsBox.h &&
          dinoBox.y + dinoBox.h > obsBox.y
        ) {
          s.deathFlash = 1;
          for (let i = 0; i < 10; i++) {
            s.particles.push({
              x: dinoBox.x + DINO_W / 2, y: dinoBox.y + DINO_H / 2,
              vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 4,
              life: 1,
            });
          }
          setGameOver(true);
          setHighScore('dino', s.score);
          return;
        }
      }

      // ── DRAW ──
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, GAME_W, 180);

      // Clouds
      ctx.fillStyle = colors.cloud;
      s.clouds.forEach((c) => {
        ctx.beginPath();
        ctx.ellipse(c.x + c.w / 2, c.y, c.w / 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x + c.w * 0.3, c.y - 3, c.w * 0.3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ground line + texture
      ctx.strokeStyle = colors.ground;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_W, GROUND_Y);
      ctx.stroke();

      // Ground details — dual layer parallax
      ctx.strokeStyle = colors.groundDark;
      ctx.lineWidth = 1;
      for (let i = -s.groundOffset; i < GAME_W; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, GROUND_Y + 5);
        ctx.lineTo(i + 8, GROUND_Y + 5);
        ctx.stroke();
      }
      for (let i = -(s.groundOffset * 0.6) % 30; i < GAME_W; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, GROUND_Y + 10);
        ctx.lineTo(i + 5, GROUND_Y + 10);
        ctx.stroke();
      }

      // Dino
      ctx.fillStyle = colors.dino;
      const duckNow = s.isDucking;
      const drawY = duckNow ? GROUND_Y - DINO_H / 2 : s.dinoY;
      const drawH = duckNow ? DINO_H / 2 : DINO_H;

      // Dino glow
      const gx = 20 + DINO_W / 2;
      const gy = drawY + drawH / 2;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, DINO_W);
      glow.addColorStop(0, colors.dinoGlow);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(gx - DINO_W, gy - DINO_W, DINO_W * 2, DINO_W * 2);

      ctx.fillStyle = colors.dino;
      // Body
      ctx.beginPath();
      ctx.roundRect(20, drawY, DINO_W - 4, drawH, 4);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.roundRect(20 + DINO_W - 10, drawY - (duckNow ? 0 : 6), 14, 13, 3);
      ctx.fill();
      // Eye
      ctx.fillStyle = colors.bg;
      ctx.fillRect(20 + DINO_W, drawY - (duckNow ? -2 : 3), 3, 3);
      // Mouth
      ctx.fillStyle = colors.dino;
      ctx.fillRect(20 + DINO_W + 2, drawY + (duckNow ? 6 : 2), 4, 1);

      // Legs (animated running)
      if (!s.isJumping) {
        const cycle = Math.floor(s.runCycle) % 4;
        ctx.fillStyle = colors.dino;
        if (cycle < 2) {
          ctx.fillRect(25, drawY + drawH, 4, 7);
          ctx.fillRect(36, drawY + drawH, 4, 4);
        } else {
          ctx.fillRect(25, drawY + drawH, 4, 4);
          ctx.fillRect(36, drawY + drawH, 4, 7);
        }
      } else {
        // Legs tucked while jumping
        ctx.fillRect(27, drawY + drawH, 4, 4);
        ctx.fillRect(34, drawY + drawH, 4, 4);
      }

      // Obstacles
      s.obstacles.forEach((obs) => {
        ctx.fillStyle = colors.obstacle;
        if (obs.type === 'cactus') {
          const cx = obs.x;
          const cy = GROUND_Y - obs.height;
          // Main trunk
          ctx.beginPath();
          ctx.roundRect(cx + 2, cy, obs.width - 4, obs.height, 2);
          ctx.fill();
          // Left arm
          ctx.fillRect(cx - 3, cy + 8, 5, 3);
          ctx.fillRect(cx - 3, cy + 5, 3, 6);
          // Right arm
          ctx.fillRect(cx + obs.width - 2, cy + 12, 5, 3);
          ctx.fillRect(cx + obs.width, cy + 10, 3, 6);
          // Spines
          ctx.fillRect(cx + obs.width / 2, cy - 2, 1, 3);
        } else {
          const by = GROUND_Y - 50;
          ctx.fillStyle = colors.bird;
          // Body
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, by + 4, obs.width / 2, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          // Beak
          ctx.fillRect(obs.x + obs.width - 2, by + 2, 5, 3);
          // Wings
          const wingUp = s.frameCount % 16 < 8;
          ctx.fillRect(obs.x + 4, wingUp ? by - 7 : by + 9, 10, 5);
        }
      });

      // Death particles
      s.particles.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = colors.dino;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1;

      // Milestone flash
      if (s.milestoneFlash > 0) {
        ctx.globalAlpha = s.milestoneFlash;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, GAME_W, 180);
        ctx.globalAlpha = 1;
      }

      // Score HUD
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      const hi = useStore.getState().highScores.dino || 0;
      ctx.fillText(`HI ${String(hi).padStart(5, '0')}  ${String(s.score).padStart(5, '0')}`, GAME_W - 10, 20);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver, isArcade, setHighScore]);

  return (
    <div
      className={isArcade ? 'p-2 flex flex-col h-full' : 'flex flex-col'}
      style={!isArcade ? { height: 'calc(100vh - 14rem)' } : undefined}
    >
      <div className="flex items-center justify-between mb-1 shrink-0">
        <p className={isArcade ? 'text-xs opacity-70' : 'text-green-400 text-xs'}>— DINO JUMP —</p>
        <button onClick={onExit} className={isArcade ? 'text-xs cursor-pointer underline' : 'text-green-600 text-xs cursor-pointer underline'}>BACK</button>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={180}
          className={`border ${isArcade ? 'border-cyan-800/30' : 'border-green-800'} rounded block w-full h-full`}
          style={{
            backgroundColor: isArcade ? '#06060f' : '#000',
            imageRendering: 'pixelated',
            objectFit: 'contain',
          }}
        />

        {isArcade && isMobile && (
          <SwipeOverlay onTap={handleTap} onSwipe={handleSwipe} />
        )}

        {!gameStarted && !gameOver && (
          <div
            className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${isArcade ? 'bg-[#06060f]/90' : 'bg-black/80'}`}
            style={isArcade && isMobile ? { pointerEvents: 'none' } : undefined}
          >
            <p className={`font-bold ${isArcade ? 'text-2xl text-cyan-400' : 'text-lg text-green-400'}`}>🦖 DINO JUMP</p>
            <p className={isArcade ? 'text-sm text-cyan-400/80' : 'text-xs text-green-600'}>Jump over obstacles!</p>
            <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-500'}`}>
              {isMobile ? 'Tap to start' : 'Press ENTER or SPACE to start'}
            </p>
          </div>
        )}

        {gameOver && (
          <div
            className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${isArcade ? 'bg-[#06060f]/85' : 'bg-black/80'}`}
            style={isArcade && isMobile ? { pointerEvents: 'none' } : undefined}
          >
            <p className={`font-bold ${isArcade ? 'text-2xl text-cyan-400' : 'text-lg text-red-400'}`}>GAME OVER</p>
            <p className={isArcade ? 'text-lg text-cyan-400' : 'text-sm text-green-400'}>Score: {score}</p>
            <p className={isArcade ? 'text-sm text-cyan-400/60' : 'text-xs text-gray-500'}>Best: {useStore.getState().highScores.dino || 0}</p>
            <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-400' : 'text-xs text-green-500'}`}>
              {isMobile ? 'Tap to retry' : 'Press ENTER to retry • ESC to exit'}
            </p>
          </div>
        )}
      </div>

      <p className={`text-center mt-1 shrink-0 ${isArcade ? 'text-xs opacity-40' : 'text-green-700 text-xs'}`}>
        {isMobile && isArcade ? 'Tap to jump • Swipe down to duck' : 'SPACE/↑ to jump • ↓ to duck • ESC to exit'}
      </p>
    </div>
  );
}
