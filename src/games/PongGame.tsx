import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { VirtualJoystick, LandscapeWrapper, useIsMobile } from '../components/TouchControls';

interface PongGameProps {
  variant: 'arcade' | 'terminal';
  onExit: () => void;
}

const GAME_W = 300;
const GAME_H = 180;
const PADDLE_W = 8;
const PADDLE_H = 35;
const BALL_SIZE = 6;

export default function PongGame({ variant, onExit }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const setHighScore = useStore((s) => s.setHighScore);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const isArcade = variant === 'arcade';
  const isMobile = useIsMobile();

  const gameState = useRef({
    playerY: GAME_H / 2 - PADDLE_H / 2,
    aiY: GAME_H / 2 - PADDLE_H / 2,
    ballX: GAME_W / 2,
    ballY: GAME_H / 2,
    ballVX: 3,
    ballVY: 2,
    playerScore: 0,
    aiScore: 0,
  });

  const resetBall = useCallback(() => {
    const s = gameState.current;
    s.ballX = GAME_W / 2;
    s.ballY = GAME_H / 2;
    s.ballVX = (Math.random() > 0.5 ? 1 : -1) * 3;
    s.ballVY = (Math.random() - 0.5) * 4;
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      playerY: GAME_H / 2 - PADDLE_H / 2,
      aiY: GAME_H / 2 - PADDLE_H / 2,
      ballX: GAME_W / 2,
      ballY: GAME_H / 2,
      ballVX: 3,
      ballVY: 2,
      playerScore: 0,
      aiScore: 0,
    };
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, []);

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
      ? { bg: '#0a0a1a', fg: '#00f0ff', mid: '#ff00aa', net: '#00f0ff30' }
      : { bg: '#000000', fg: '#00ff00', mid: '#00aa00', net: '#005500' };

    const PADDLE_SPEED = 4;

    const gameLoop = () => {
      const s = gameState.current;
      const keys = keysRef.current;

      // Player movement
      if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
        s.playerY = Math.max(0, s.playerY - PADDLE_SPEED);
      }
      if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) {
        s.playerY = Math.min(GAME_H - PADDLE_H, s.playerY + PADDLE_SPEED);
      }

      // AI movement (tracks ball with slight delay)
      const aiCenter = s.aiY + PADDLE_H / 2;
      const diff = s.ballY - aiCenter;
      s.aiY += diff * 0.06; // Slow-ish AI
      s.aiY = Math.max(0, Math.min(GAME_H - PADDLE_H, s.aiY));

      // Ball movement
      s.ballX += s.ballVX;
      s.ballY += s.ballVY;

      // Top/bottom walls
      if (s.ballY <= 0 || s.ballY >= GAME_H - BALL_SIZE) {
        s.ballVY = -s.ballVY;
        s.ballY = Math.max(0, Math.min(GAME_H - BALL_SIZE, s.ballY));
      }

      // Paddle collisions
      // Player paddle (left)
      if (
        s.ballX <= 20 + PADDLE_W &&
        s.ballX >= 20 &&
        s.ballY + BALL_SIZE >= s.playerY &&
        s.ballY <= s.playerY + PADDLE_H
      ) {
        s.ballVX = Math.abs(s.ballVX) * 1.05;
        const hitPos = (s.ballY - s.playerY) / PADDLE_H - 0.5;
        s.ballVY = hitPos * 6;
      }

      // AI paddle (right)
      if (
        s.ballX + BALL_SIZE >= GAME_W - 20 - PADDLE_W &&
        s.ballX + BALL_SIZE <= GAME_W - 20 &&
        s.ballY + BALL_SIZE >= s.aiY &&
        s.ballY <= s.aiY + PADDLE_H
      ) {
        s.ballVX = -Math.abs(s.ballVX) * 1.05;
        const hitPos = (s.ballY - s.aiY) / PADDLE_H - 0.5;
        s.ballVY = hitPos * 6;
      }

      // Scoring
      if (s.ballX < 0) {
        s.aiScore++;
        setAiScore(s.aiScore);
        resetBall();
      }
      if (s.ballX > GAME_W) {
        s.playerScore++;
        setPlayerScore(s.playerScore);
        resetBall();
      }

      // Game over at 5
      if (s.playerScore >= 5 || s.aiScore >= 5) {
        setGameOver(true);
        if (s.playerScore >= 5) {
          setHighScore('pong', s.playerScore * 20);
        }
        return;
      }

      // Draw
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // Net (dashed center line)
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = colors.net;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(GAME_W / 2, 0);
      ctx.lineTo(GAME_W / 2, GAME_H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      ctx.fillStyle = colors.fg;
      ctx.fillRect(20, s.playerY, PADDLE_W, PADDLE_H);
      ctx.fillRect(GAME_W - 20 - PADDLE_W, s.aiY, PADDLE_W, PADDLE_H);

      // Ball
      ctx.fillRect(s.ballX, s.ballY, BALL_SIZE, BALL_SIZE);

      // Scores
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.mid;
      ctx.fillText(String(s.playerScore), GAME_W / 2 - 40, 25);
      ctx.fillText(String(s.aiScore), GAME_W / 2 + 40, 25);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver, isArcade, resetBall, setHighScore]);

  const content = (
    <div
      className={isArcade ? 'p-3 flex flex-col h-full' : 'flex flex-col'}
      style={!isArcade ? { height: 'calc(100vh - 14rem)' } : undefined}
    >
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className={isArcade ? 'text-cyan-400 text-xs' : 'text-green-400 text-xs'}>— PONG —</p>
        <button onClick={onExit} className={isArcade ? 'text-cyan-300 text-xs cursor-pointer underline' : 'text-green-600 text-xs cursor-pointer underline'}>BACK</button>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden flex-col gap-3">
        <div className="relative flex-1 flex items-center justify-center min-h-0 w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            width={GAME_W}
            height={GAME_H}
            className={`border ${isArcade ? 'border-cyan-800' : 'border-green-800'} block w-full h-full`}
            style={{ backgroundColor: isArcade ? '#0a0a1a' : '#000', imageRendering: 'pixelated', objectFit: 'contain' }}
          />

          {!gameStarted && !gameOver && (
            <div className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${isArcade ? 'bg-[#0a0a1a]/90' : 'bg-black/80'}`}>
              <p className={`font-bold ${isArcade ? 'text-xl text-cyan-400' : 'text-lg text-green-400'}`}>🏓 PONG</p>
              <p className={isArcade ? 'text-sm text-cyan-300' : 'text-xs text-green-600'}>You vs AI — First to 5 wins!</p>
              <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-300' : 'text-xs text-green-500'}`}>Press ENTER to start</p>
            </div>
          )}

          {gameOver && (
            <div className={`absolute inset-0 flex items-center justify-center flex-col gap-3 ${isArcade ? 'bg-[#0a0a1a]/90' : 'bg-black/80'}`}>
              <p className={`font-bold ${isArcade ? 'text-xl text-cyan-400' : 'text-lg text-green-400'}`}>
                {playerScore >= 5 ? '🏆 YOU WIN!' : '💀 AI WINS'}
              </p>
              <p className={isArcade ? 'text-base text-cyan-300' : 'text-sm text-green-400'}>{playerScore} - {aiScore}</p>
              <p className={`animate-pulse ${isArcade ? 'text-sm text-cyan-300' : 'text-xs text-green-500'}`}>ENTER to retry • ESC to exit</p>
            </div>
          )}
        </div>

        {isArcade && isMobile && (
          <div className="flex justify-center shrink-0 py-2">
            <VirtualJoystick axes="vertical" size={120} />
          </div>
        )}
      </div>

      <p className={`text-center mt-2 shrink-0 ${isArcade ? 'text-cyan-400/70 text-xs' : 'text-green-700 text-xs'}`}>
        {isArcade && isMobile ? 'Joystick to move paddle • ESC to exit' : '↑/↓ or W/S to move • ESC to exit'}
      </p>
    </div>
  );

  if (isArcade) {
    return <LandscapeWrapper>{content}</LandscapeWrapper>;
  }
  return content;
}

