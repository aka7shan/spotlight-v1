import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface MemoryMatchProps {
  variant: 'gameboy' | 'terminal';
  onExit: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const TECH_PAIRS = ['⚛️', '🐍', '☕', '🟢', '☁️', '🐳', '🍃', '🔷'];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MemoryMatch({ variant, onExit }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const setHighScore = useStore((s) => s.setHighScore);

  const isGameBoy = variant === 'gameboy';
  const totalPairs = TECH_PAIRS.length;

  const initGame = useCallback(() => {
    const pairs = [...TECH_PAIRS, ...TECH_PAIRS];
    const shuffled = shuffleArray(pairs);
    const newCards: Card[] = shuffled.map((emoji, i) => ({
      id: i,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(newCards);
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setGameStarted(true);
    setStartTime(Date.now());
    setElapsed(0);
  }, []);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, startTime]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (!gameStarted && e.key === 'Enter') initGame();
      if (gameOver && e.key === 'Enter') initGame();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, gameOver, onExit, initGame]);

  const flipCard = (id: number) => {
    if (isChecking) return;
    if (flippedIds.length >= 2) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const card1 = newCards.find((c) => c.id === newFlipped[0])!;
      const card2 = newCards.find((c) => c.id === newFlipped[1])!;

      if (card1.emoji === card2.emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === newFlipped[0] || c.id === newFlipped[1]
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedIds([]);
          setIsChecking(false);

          const newMatches = matches + 1;
          setMatches(newMatches);

          if (newMatches === totalPairs) {
            setGameOver(true);
            // Score = bonus for fewer moves and less time
            const score = Math.max(0, 1000 - moves * 10 - elapsed * 2);
            setHighScore('memory', score);
          }
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === newFlipped[0] || c.id === newFlipped[1]
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedIds([]);
          setIsChecking(false);
        }, 800);
      }
    }
  };

  return (
    <div
      className={isGameBoy ? 'p-3 flex flex-col h-full' : 'flex flex-col'}
      style={!isGameBoy ? { height: 'calc(100vh - 14rem)' } : undefined}
    >
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className={isGameBoy ? 'text-xs opacity-70' : 'text-green-400 text-xs'}>— MEMORY MATCH —</p>
        <button
          onClick={onExit}
          className={isGameBoy ? 'text-xs cursor-pointer underline' : 'text-green-600 text-xs cursor-pointer underline'}
        >
          BACK
        </button>
      </div>

      {!gameStarted && !gameOver && (
        <div className="text-center flex-1 flex flex-col items-center justify-center gap-3">
          <p className={`font-bold ${isGameBoy ? 'text-xl' : 'text-lg text-green-400'}`}>🧠 MEMORY MATCH</p>
          <p className={isGameBoy ? 'text-sm mt-2' : 'text-xs text-green-600 mt-2'}>Match the tech icon pairs!</p>
          <p className={`animate-pulse mt-4 ${isGameBoy ? 'text-sm' : 'text-xs text-green-500'}`}>
            Press ENTER to start
          </p>
        </div>
      )}

      {gameStarted && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Stats */}
          <div className={`flex justify-between text-sm mb-2 shrink-0 ${isGameBoy ? '' : 'text-green-400'}`}>
            <span>⏱️ {elapsed}s</span>
            <span>Moves: {moves}</span>
            <span>Matched: {matches}/{totalPairs}</span>
          </div>

          {/* Card Grid - fills available space, rows sized to fit */}
          <div className={`grid grid-cols-4 grid-rows-4 gap-2 mx-auto flex-1 min-h-0 w-full ${isGameBoy ? '' : 'max-w-[500px]'}`}>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`rounded flex items-center justify-center text-2xl cursor-pointer transition-all duration-200 min-h-0 ${
                  card.isMatched
                    ? (isGameBoy
                        ? 'bg-[#0f380f]/30 border border-[#306230]/30'
                        : 'bg-green-900/30 border border-green-700/30')
                    : card.isFlipped
                    ? (isGameBoy
                        ? 'bg-[#0f380f] border-2 border-[#306230] scale-105'
                        : 'bg-green-900 border-2 border-green-500 scale-105')
                    : (isGameBoy
                        ? 'bg-[#306230] border border-[#0f380f] hover:bg-[#306230]/80 active:scale-95'
                        : 'bg-green-800 border border-green-600 hover:bg-green-700 active:scale-95')
                }`}
                disabled={card.isMatched || card.isFlipped || isChecking}
              >
                {card.isFlipped || card.isMatched ? (
                  <span className={card.isMatched ? 'opacity-40' : ''}>{card.emoji}</span>
                ) : (
                  <span className={isGameBoy ? 'text-[#9bbc0f] text-base' : 'text-green-400 text-xs'}>?</span>
                )}
              </button>
            ))}
          </div>

          {gameOver && (
            <div className={`text-center mt-2 p-2 border rounded shrink-0 ${
              isGameBoy ? 'border-[#306230]' : 'border-green-800 bg-black/50'
            }`}>
              <p className={`font-bold ${isGameBoy ? 'text-lg' : 'text-lg text-yellow-400'}`}>🎉 ALL MATCHED!</p>
              <div className={`mt-2 space-y-1 ${isGameBoy ? 'text-sm' : 'text-sm text-green-400'}`}>
                <p>Time: {elapsed}s</p>
                <p>Moves: {moves}</p>
                <p>Score: {Math.max(0, 1000 - moves * 10 - elapsed * 2)}</p>
              </div>
              <p className={`animate-pulse mt-2 ${isGameBoy ? 'text-sm' : 'text-xs text-green-500'}`}>
                Press ENTER to play again • ESC to exit
              </p>
            </div>
          )}
        </div>
      )}

      <p className={`text-center mt-1 shrink-0 ${isGameBoy ? 'text-xs opacity-50' : 'text-green-700 text-xs'}`}>
        Click cards to flip • Match all pairs • ESC to exit
      </p>
    </div>
  );
}

