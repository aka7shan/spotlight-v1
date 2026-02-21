import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { VirtualJoystick, ActionButton, LandscapeWrapper, useIsMobile } from '../components/TouchControls';

function simulateKeyDown(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}
function simulateKeyUp(key: string) {
  window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
}

interface SpaceInvadersProps {
  variant: 'arcade' | 'terminal';
  onExit: () => void;
}

interface Alien {
  x: number; y: number; alive: boolean; type: number;
}
interface Bullet {
  x: number; y: number; active: boolean;
}
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}
interface Star {
  x: number; y: number; speed: number; brightness: number;
}

const GAME_W = 300;
const GAME_H = 200;
const PLAYER_W = 20;
const PLAYER_H = 12;
const ALIEN_W = 16;
const ALIEN_H = 12;
const ROWS = 4;
const COLS = 8;

export default function SpaceInvaders({ variant, onExit }: SpaceInvadersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [won, setWon] = useState(false);
  const setHighScore = useStore((s) => s.setHighScore);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const isArcade = variant === 'arcade';
  const isMobile = useIsMobile();

  const gameState = useRef({
    playerX: GAME_W / 2 - PLAYER_W / 2,
    aliens: [] as Alien[],
    bullets: [] as Bullet[],
    alienBullets: [] as Bullet[],
    alienDir: 1,
    alienSpeed: 0.4,
    frameCount: 0,
    score: 0,
    lives: 3,
    cooldown: 0,
    particles: [] as Particle[],
    stars: [] as Star[],
    playerFlash: 0,
  });

  const initAliens = useCallback(() => {
    const aliens: Alien[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        aliens.push({
          x: 30 + c * (ALIEN_W + 6),
          y: 20 + r * (ALIEN_H + 6),
          alive: true,
          type: r === 0 ? 2 : r === 1 ? 1 : 0,
        });
      }
    }
    return aliens;
  }, []);

  const initStars = useCallback(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * GAME_W,
        y: Math.random() * GAME_H,
        speed: 0.1 + Math.random() * 0.3,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
    return stars;
  }, []);

  const spawnExplosion = useCallback((x: number, y: number, color: string) => {
    const s = gameState.current;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * (1 + Math.random() * 2),
        vy: Math.sin(angle) * (1 + Math.random() * 2),
        life: 1,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      playerX: GAME_W / 2 - PLAYER_W / 2,
      aliens: initAliens(),
      bullets: [],
      alienBullets: [],
      alienDir: 1,
      alienSpeed: 0.4,
      frameCount: 0,
      score: 0,
      lives: 3,
      cooldown: 0,
      particles: [],
      stars: initStars(),
      playerFlash: 0,
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setGameStarted(true);
  }, [initAliens, initStars]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }
      keysRef.current.add(e.key);
      if (!gameStarted || gameOver) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resetGame(); }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current.delete(e.key); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, onExit, resetGame]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = isArcade
      ? { bg: '#06060f', fg: '#00f0ff', mid: '#ff00aa', accent: '#39ff14', bulletGlow: 'rgba(0,240,255,0.4)' }
      : { bg: '#000000', fg: '#00ff00', mid: '#00aa00', accent: '#005500', bulletGlow: 'rgba(0,255,0,0.3)' };

    const PLAYER_SPEED = 3;

    const gameLoop = () => {
      const s = gameState.current;
      const keys = keysRef.current;
      s.frameCount++;

      // Stars drift
      s.stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > GAME_H) { star.y = 0; star.x = Math.random() * GAME_W; }
      });

      // Update particles
      s.particles = s.particles.filter((p) => {
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.03;
        p.vx *= 0.96; p.vy *= 0.96;
        return p.life > 0;
      });

      if (s.playerFlash > 0) s.playerFlash -= 0.05;

      // Player movement — smoother with sub-pixel
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
        s.playerX = Math.max(10, s.playerX - PLAYER_SPEED);
      }
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
        s.playerX = Math.min(GAME_W - 10 - PLAYER_W, s.playerX + PLAYER_SPEED);
      }

      // Shooting
      s.cooldown = Math.max(0, s.cooldown - 1);
      if ((keys.has(' ') || keys.has('ArrowUp') || keys.has('w') || keys.has('W')) && s.cooldown <= 0) {
        s.bullets.push({ x: s.playerX + PLAYER_W / 2 - 1, y: GAME_H - 25, active: true });
        s.cooldown = 12;
      }

      // Move bullets
      s.bullets.forEach((b) => { b.y -= 5; if (b.y < 0) b.active = false; });
      s.bullets = s.bullets.filter((b) => b.active);

      // Move aliens
      let hitEdge = false;
      const liveAliens = s.aliens.filter((a) => a.alive);
      liveAliens.forEach((a) => {
        a.x += s.alienDir * s.alienSpeed;
        if (a.x <= 5 || a.x + ALIEN_W >= GAME_W - 5) hitEdge = true;
      });
      if (hitEdge) {
        s.alienDir *= -1;
        liveAliens.forEach((a) => { a.y += 3; });
        s.alienSpeed += 0.04;
      }

      // Alien shooting
      if (s.frameCount % 50 === 0 && liveAliens.length > 0) {
        const shooter = liveAliens[Math.floor(Math.random() * liveAliens.length)];
        s.alienBullets.push({ x: shooter.x + ALIEN_W / 2, y: shooter.y + ALIEN_H, active: true });
      }
      s.alienBullets.forEach((b) => { b.y += 2.8; if (b.y > GAME_H) b.active = false; });
      s.alienBullets = s.alienBullets.filter((b) => b.active);

      // Bullet-alien collision
      s.bullets.forEach((bullet) => {
        if (!bullet.active) return;
        s.aliens.forEach((alien) => {
          if (!alien.alive) return;
          if (
            bullet.x >= alien.x && bullet.x <= alien.x + ALIEN_W &&
            bullet.y >= alien.y && bullet.y <= alien.y + ALIEN_H
          ) {
            alien.alive = false;
            bullet.active = false;
            const pts = (alien.type + 1) * 10;
            s.score += pts;
            setScore(s.score);
            const alienColor = alien.type === 2 ? colors.fg : alien.type === 1 ? colors.mid : colors.accent;
            spawnExplosion(alien.x + ALIEN_W / 2, alien.y + ALIEN_H / 2, alienColor);
          }
        });
      });

      // Alien bullet-player collision
      s.alienBullets.forEach((b) => {
        if (!b.active) return;
        if (
          b.x >= s.playerX && b.x <= s.playerX + PLAYER_W &&
          b.y >= GAME_H - 20 && b.y <= GAME_H - 20 + PLAYER_H
        ) {
          b.active = false;
          s.lives--;
          s.playerFlash = 1;
          setLives(s.lives);
          spawnExplosion(s.playerX + PLAYER_W / 2, GAME_H - 14, colors.fg);
          if (s.lives <= 0) {
            setGameOver(true);
            setHighScore('invaders', s.score);
            return;
          }
        }
      });

      if (liveAliens.some((a) => a.y + ALIEN_H >= GAME_H - 25)) {
        setGameOver(true);
        setHighScore('invaders', s.score);
        return;
      }
      if (liveAliens.length === 0) {
        setWon(true);
        setGameOver(true);
        setHighScore('invaders', s.score);
        return;
      }

      // ── DRAW ──
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // Stars
      s.stars.forEach((star) => {
        ctx.globalAlpha = star.brightness * (0.5 + Math.sin(s.frameCount * 0.02 + star.x) * 0.5);
        ctx.fillStyle = '#fff';
        ctx.fillRect(star.x, star.y, 1, 1);
      });
      ctx.globalAlpha = 1;

      // Aliens with improved sprites
      s.aliens.forEach((alien) => {
        if (!alien.alive) return;
        const c = alien.type === 2 ? colors.fg : alien.type === 1 ? colors.mid : colors.accent;
        ctx.fillStyle = c;

        const ax = alien.x;
        const ay = alien.y;
        const anim = s.frameCount % 40 < 20;

        // Rounded body
        ctx.beginPath();
        ctx.roundRect(ax + 1, ay + 2, ALIEN_W - 2, ALIEN_H - 2, 3);
        ctx.fill();

        // Antennae
        ctx.fillRect(ax + 3, ay, 2, 3);
        ctx.fillRect(ax + ALIEN_W - 5, ay, 2, 3);

        // Eyes
        ctx.fillStyle = colors.bg;
        ctx.fillRect(ax + 4, ay + 4, 3, 3);
        ctx.fillRect(ax + ALIEN_W - 7, ay + 4, 3, 3);

        // Eye pupils (animated)
        ctx.fillStyle = '#fff';
        ctx.fillRect(ax + 5, ay + 5, 1, 1);
        ctx.fillRect(ax + ALIEN_W - 6, ay + 5, 1, 1);

        // Legs (animated)
        ctx.fillStyle = c;
        if (anim) {
          ctx.fillRect(ax + 2, ay + ALIEN_H, 3, 3);
          ctx.fillRect(ax + ALIEN_W - 5, ay + ALIEN_H, 3, 3);
        } else {
          ctx.fillRect(ax + 5, ay + ALIEN_H, 3, 3);
          ctx.fillRect(ax + ALIEN_W - 8, ay + ALIEN_H, 3, 3);
        }
      });

      // Player ship with glow
      const px = s.playerX;
      const py = GAME_H - 20;
      if (s.playerFlash > 0) {
        ctx.globalAlpha = s.playerFlash;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(px - 2, py - 2, PLAYER_W + 4, PLAYER_H + 6);
        ctx.globalAlpha = 1;
      }

      // Ship glow
      const shipGrad = ctx.createRadialGradient(px + PLAYER_W / 2, py + PLAYER_H / 2, 0, px + PLAYER_W / 2, py + PLAYER_H / 2, PLAYER_W);
      shipGrad.addColorStop(0, colors.bulletGlow);
      shipGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shipGrad;
      ctx.fillRect(px - 10, py - 10, PLAYER_W + 20, PLAYER_H + 20);

      ctx.fillStyle = colors.fg;
      // Ship body
      ctx.beginPath();
      ctx.moveTo(px + PLAYER_W / 2, py - 4);
      ctx.lineTo(px + PLAYER_W + 2, py + PLAYER_H);
      ctx.lineTo(px - 2, py + PLAYER_H);
      ctx.closePath();
      ctx.fill();

      // Engine flames
      const flicker = Math.random() * 3;
      ctx.fillStyle = colors.mid;
      ctx.fillRect(px + PLAYER_W / 2 - 3, py + PLAYER_H, 6, 3 + flicker);

      // Player bullets with glow trails
      s.bullets.forEach((b) => {
        const bGrad = ctx.createLinearGradient(b.x, b.y + 8, b.x, b.y);
        bGrad.addColorStop(0, 'transparent');
        bGrad.addColorStop(1, colors.fg);
        ctx.fillStyle = bGrad;
        ctx.fillRect(b.x - 1, b.y, 4, 10);
        ctx.fillStyle = '#fff';
        ctx.fillRect(b.x, b.y, 2, 4);
      });

      // Alien bullets
      s.alienBullets.forEach((b) => {
        ctx.fillStyle = colors.mid;
        ctx.fillRect(b.x - 1, b.y, 3, 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(b.x, b.y + 2, 1, 4);
      });

      // Particles
      s.particles.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // HUD
      ctx.fillStyle = colors.fg;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${s.score}`, 5, 12);
      ctx.textAlign = 'right';
      const hearts = s.lives > 0 ? '❤'.repeat(s.lives) : '';
      ctx.fillText(`LIVES: ${hearts}`, GAME_W - 5, 12);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver, isArcade, setHighScore, spawnExplosion]);

  const handleMobileTap = useCallback(() => {
    if (!gameStarted || gameOver) resetGame();
  }, [gameStarted, gameOver, resetGame]);

  const arcadeContent = (
    <div className={`flex flex-col h-full ${isMobile ? 'p-1' : 'p-3'}`}>
      <div className="flex items-center justify-between mb-1 shrink-0 px-2">
        <p className="text-xs text-cyan-400">— SPACE INVADERS —</p>
        <button onClick={onExit} className="text-xs text-cyan-300 cursor-pointer underline">BACK</button>
      </div>

      <div
        className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden"
        onClick={isMobile ? handleMobileTap : undefined}
        onTouchEnd={isMobile && (!gameStarted || gameOver) ? (e) => { e.preventDefault(); handleMobileTap(); } : undefined}
      >
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className="border border-[#00f0ff20] rounded block w-full h-full"
          style={{ backgroundColor: '#06060f', imageRendering: 'pixelated', objectFit: 'contain' }}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-[#06060f]/90">
            <p className="font-bold text-xl text-cyan-400">👾 SPACE INVADERS</p>
            <p className="text-sm text-cyan-300/80">Defend Earth from the bugs!</p>
            <p className="animate-pulse text-sm text-cyan-300">{isMobile ? 'Tap to start' : 'Press ENTER to start'}</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-[#06060f]/90">
            <p className="font-bold text-xl text-cyan-400">
              {won ? '🏆 VICTORY!' : '💀 GAME OVER'}
            </p>
            <p className="text-base text-cyan-300">Score: {score}</p>
            <p className="text-sm text-cyan-400/70">Best: {useStore.getState().highScores.invaders || 0}</p>
            <p className="animate-pulse text-sm text-cyan-300">{isMobile ? 'Tap to retry' : 'ENTER to retry • ESC to exit'}</p>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="flex items-center justify-between shrink-0 px-2 py-1" style={{ height: '90px' }}>
          <VirtualJoystick axes="horizontal" size={80} />
          <ActionButton
            label="FIRE"
            size={60}
            onPress={() => simulateKeyDown(' ')}
            onRelease={() => simulateKeyUp(' ')}
          />
        </div>
      )}

      <p className={`text-center shrink-0 text-xs ${isMobile ? 'text-cyan-400/60 py-0.5' : 'text-cyan-400/50 mt-2'}`}>
        {isMobile ? 'Joystick to move • FIRE to shoot' : '←/→ to move • SPACE/↑ to shoot • ESC to exit'}
      </p>
    </div>
  );

  if (isArcade) {
    return <LandscapeWrapper>{arcadeContent}</LandscapeWrapper>;
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 14rem)' }}>
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className="text-green-400 text-xs">— SPACE INVADERS —</p>
        <button onClick={onExit} className="text-green-600 text-xs cursor-pointer underline">BACK</button>
      </div>
      <div className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className="border border-green-800 block w-full h-full"
          style={{ backgroundColor: '#000', imageRendering: 'pixelated', objectFit: 'contain' }}
        />
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black/80">
            <p className="font-bold text-lg text-green-400">👾 SPACE INVADERS</p>
            <p className="text-xs text-green-600">Defend Earth from the bugs!</p>
            <p className="animate-pulse text-xs text-green-500">Press ENTER to start</p>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black/80">
            <p className="font-bold text-lg text-green-400">{won ? '🏆 VICTORY!' : '💀 GAME OVER'}</p>
            <p className="text-sm text-green-400">Score: {score}</p>
            <p className="text-xs text-gray-500">Best: {useStore.getState().highScores.invaders || 0}</p>
            <p className="animate-pulse text-xs text-green-500">ENTER to retry • ESC to exit</p>
          </div>
        )}
      </div>
      <p className="text-center mt-2 shrink-0 text-green-700 text-xs">
        ←/→ to move • SPACE/↑ to shoot • ESC to exit
      </p>
    </div>
  );
}
