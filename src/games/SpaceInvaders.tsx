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
  x: number;
  y: number;
  alive: boolean;
  type: number; // 0, 1, 2 for different sprites
}

interface Bullet {
  x: number;
  y: number;
  active: boolean;
}

interface AlienBullet {
  x: number;
  y: number;
  active: boolean;
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
    alienBullets: [] as AlienBullet[],
    alienDir: 1,
    alienSpeed: 0.4,
    frameCount: 0,
    score: 0,
    lives: 3,
    cooldown: 0,
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
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setGameStarted(true);
  }, [initAliens]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }
      keysRef.current.add(e.key);

      if (!gameStarted || gameOver) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          resetGame();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, onExit, resetGame]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = isArcade
      ? { bg: '#0a0a1a', fg: '#00f0ff', mid: '#ff00aa', accent: '#39ff14' }
      : { bg: '#000000', fg: '#00ff00', mid: '#00aa00', accent: '#005500' };

    const gameLoop = () => {
      const s = gameState.current;
      const keys = keysRef.current;
      s.frameCount++;

      // Player movement
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
        s.playerX = Math.max(10, s.playerX - 3);
      }
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
        s.playerX = Math.min(GAME_W - 10 - PLAYER_W, s.playerX + 3);
      }

      // Shooting
      s.cooldown = Math.max(0, s.cooldown - 1);
      if ((keys.has(' ') || keys.has('ArrowUp') || keys.has('w') || keys.has('W')) && s.cooldown <= 0) {
        s.bullets.push({ x: s.playerX + PLAYER_W / 2 - 1, y: GAME_H - 25, active: true });
        s.cooldown = 15;
      }

      // Move bullets
      s.bullets.forEach((b) => { b.y -= 4; if (b.y < 0) b.active = false; });
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
        liveAliens.forEach((a) => { a.y += 4; });
        s.alienSpeed += 0.05;
      }

      // Alien shooting
      if (s.frameCount % 60 === 0 && liveAliens.length > 0) {
        const shooter = liveAliens[Math.floor(Math.random() * liveAliens.length)];
        s.alienBullets.push({ x: shooter.x + ALIEN_W / 2, y: shooter.y + ALIEN_H, active: true });
      }

      // Move alien bullets
      s.alienBullets.forEach((b) => { b.y += 2.5; if (b.y > GAME_H) b.active = false; });
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
          setLives(s.lives);
          if (s.lives <= 0) {
            setGameOver(true);
            setHighScore('invaders', s.score);
            return;
          }
        }
      });

      // Aliens reach bottom
      if (liveAliens.some((a) => a.y + ALIEN_H >= GAME_H - 25)) {
        setGameOver(true);
        setHighScore('invaders', s.score);
        return;
      }

      // Win condition
      if (liveAliens.length === 0) {
        setWon(true);
        setGameOver(true);
        setHighScore('invaders', s.score);
        return;
      }

      // ── DRAW ──
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // Aliens
      s.aliens.forEach((alien) => {
        if (!alien.alive) return;
        ctx.fillStyle = alien.type === 2 ? colors.fg : alien.type === 1 ? colors.mid : colors.accent;
        // Simple pixel alien
        ctx.fillRect(alien.x, alien.y, ALIEN_W, ALIEN_H);
        // Eyes
        ctx.fillStyle = colors.bg;
        ctx.fillRect(alien.x + 3, alien.y + 3, 3, 3);
        ctx.fillRect(alien.x + ALIEN_W - 6, alien.y + 3, 3, 3);
        // Legs (animated)
        ctx.fillStyle = alien.type === 2 ? colors.fg : alien.type === 1 ? colors.mid : colors.accent;
        if (s.frameCount % 30 < 15) {
          ctx.fillRect(alien.x + 1, alien.y + ALIEN_H, 3, 3);
          ctx.fillRect(alien.x + ALIEN_W - 4, alien.y + ALIEN_H, 3, 3);
        } else {
          ctx.fillRect(alien.x + 4, alien.y + ALIEN_H, 3, 3);
          ctx.fillRect(alien.x + ALIEN_W - 7, alien.y + ALIEN_H, 3, 3);
        }
      });

      // Player
      ctx.fillStyle = colors.fg;
      ctx.fillRect(s.playerX, GAME_H - 20, PLAYER_W, PLAYER_H);
      // Cannon
      ctx.fillRect(s.playerX + PLAYER_W / 2 - 2, GAME_H - 24, 4, 5);

      // Bullets
      ctx.fillStyle = colors.fg;
      s.bullets.forEach((b) => { ctx.fillRect(b.x, b.y, 2, 6); });

      // Alien bullets
      ctx.fillStyle = colors.mid;
      s.alienBullets.forEach((b) => { ctx.fillRect(b.x, b.y, 2, 6); });

      // HUD
      ctx.fillStyle = colors.fg;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${s.score}`, 5, 12);
      ctx.textAlign = 'right';
      ctx.fillText(`LIVES: ${'❤'.repeat(s.lives)}`, GAME_W - 5, 12);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver, isArcade, setHighScore]);

  const handleMobileTap = useCallback(() => {
    if (!gameStarted || gameOver) resetGame();
  }, [gameStarted, gameOver, resetGame]);

  const arcadeContent = (
    <div className={`flex flex-col h-full ${isMobile ? 'p-1' : 'p-3'}`}>
      <div className="flex items-center justify-between mb-1 shrink-0 px-2">
        <p className="text-xs text-cyan-400">— SPACE INVADERS —</p>
        <button onClick={onExit} className="text-xs text-cyan-300 cursor-pointer underline">BACK</button>
      </div>

      {/* Canvas area — takes all available space between header and controls */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden"
        onClick={isMobile ? handleMobileTap : undefined}
        onTouchEnd={isMobile && (!gameStarted || gameOver) ? (e) => { e.preventDefault(); handleMobileTap(); } : undefined}
      >
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className="border border-[#00f0ff30] block w-full h-full"
          style={{ backgroundColor: '#0a0a1a', imageRendering: 'pixelated', objectFit: 'contain' }}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-[#0a0a1a]/90">
            <p className="font-bold text-xl text-cyan-400">👾 SPACE INVADERS</p>
            <p className="text-sm text-cyan-300">Defend Earth from the bugs!</p>
            <p className="animate-pulse text-sm text-cyan-300">{isMobile ? 'Tap to start' : 'Press ENTER to start'}</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-[#0a0a1a]/90">
            <p className="font-bold text-xl text-cyan-400">
              {won ? '🏆 VICTORY!' : '💀 GAME OVER'}
            </p>
            <p className="text-base text-cyan-300">Score: {score}</p>
            <p className="text-sm text-cyan-400">Best: {useStore.getState().highScores.invaders || 0}</p>
            <p className="animate-pulse text-sm text-cyan-300">{isMobile ? 'Tap to retry' : 'ENTER to retry • ESC to exit'}</p>
          </div>
        )}
      </div>

      {/* Mobile controls — compact, fixed height */}
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

      <p className={`text-center shrink-0 text-xs ${isMobile ? 'text-cyan-400/80 py-0.5' : 'text-cyan-400/70 mt-2'}`}>
        {isMobile ? 'Joystick to move • FIRE to shoot' : '←/→ to move • SPACE/↑ to shoot • ESC to exit'}
      </p>
    </div>
  );

  if (isArcade) {
    return <LandscapeWrapper>{arcadeContent}</LandscapeWrapper>;
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 14rem)' }}
    >
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
            <p className="font-bold text-lg text-green-400">
              {won ? '🏆 VICTORY!' : '💀 GAME OVER'}
            </p>
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

