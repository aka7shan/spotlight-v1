import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useIsMobile } from '../components/TouchControls';

interface CodeTyperProps {
  variant: 'arcade' | 'terminal';
  onExit: () => void;
}

const CODE_SNIPPETS = [
  `const api = async (url) => {\n  const res = await fetch(url);\n  return res.json();\n};`,
  `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}`,
  `const useDebounce = (value, delay) => {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n  return debounced;\n};`,
  `app.get('/api/users', async (req, res) => {\n  const users = await User.find({});\n  res.status(200).json(users);\n});`,
  `class Stack {\n  constructor() { this.items = []; }\n  push(item) { this.items.push(item); }\n  pop() { return this.items.pop(); }\n  peek() { return this.items[this.items.length - 1]; }\n}`,
  `const mergeSort = (arr) => {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n};`,
];

export default function CodeTyper({ variant, onExit }: CodeTyperProps) {
  const [snippet, setSnippet] = useState('');
  const [typed, setTyped] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const setHighScore = useStore((s) => s.setHighScore);

  const isArcade = variant === 'arcade';
  const isMobile = useIsMobile();

  const startGame = useCallback(() => {
    const randomSnippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    setSnippet(randomSnippet);
    setTyped('');
    setGameStarted(true);
    setGameOver(false);
    setStartTime(Date.now());
    setErrors(0);
    setTotalTyped(0);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(60);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        setGameOver(true);
        setHighScore('typer', wpm);
        if (wpm >= 60) {
          useStore.getState().unlockAchievement('speed_demon');
        }
      }
    }, 200);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, startTime, wpm, setHighScore]);

  const handleInput = (value: string) => {
    if (gameOver) return;

    setTyped(value);
    const newTotalTyped = totalTyped + 1;
    setTotalTyped(newTotalTyped);

    // Calculate errors
    let errCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== snippet[i]) errCount++;
    }
    setErrors(errCount);
    setAccuracy(Math.round(((newTotalTyped - errCount) / newTotalTyped) * 100));

    // Calculate WPM
    const elapsedMin = (Date.now() - startTime) / 60000;
    if (elapsedMin > 0) {
      const words = value.trim().split(/\s+/).length;
      setWpm(Math.round(words / elapsedMin));
    }

    // Check if completed
    if (value === snippet) {
      // Load next snippet
      const remaining = CODE_SNIPPETS.filter((s) => s !== snippet);
      if (remaining.length > 0) {
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        setSnippet(next);
        setTyped('');
      } else {
        setGameOver(true);
        setHighScore('typer', wpm);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (!gameStarted && (e.key === 'Enter')) startGame();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, onExit, startGame]);

  const renderCodeComparison = () => {
    return snippet.split('').map((char, i) => {
      let className = '';
      if (i < typed.length) {
        className = typed[i] === char
          ? (isArcade ? 'text-cyan-400 font-bold' : 'text-green-400')
          : (isArcade ? 'bg-red-900/50 text-red-300' : 'bg-red-900 text-red-300');
      } else if (i === typed.length) {
        className = isArcade ? 'bg-cyan-900 text-cyan-300 animate-pulse' : 'bg-green-900 text-green-300 animate-pulse';
      } else {
        className = isArcade ? 'text-gray-600' : 'text-gray-600';
      }

      return (
        <span key={i} className={className}>
          {char === '\n' ? '↵\n' : char}
        </span>
      );
    });
  };

  return (
    <div
      className={isArcade ? 'p-3 flex flex-col h-full' : 'flex flex-col'}
      style={!isArcade ? { maxHeight: 'calc(100vh - 14rem)' } : undefined}
    >
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className={isArcade ? 'text-cyan-400 text-xs' : 'text-green-400 text-xs'}>— CODE TYPER —</p>
        <button
          onClick={onExit}
          className={isArcade ? 'text-cyan-400 text-xs cursor-pointer underline' : 'text-green-600 text-xs cursor-pointer underline'}
        >
          BACK
        </button>
      </div>

      {isMobile && (
        <div className="text-xs text-center py-2 px-3 mb-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-amber-400">
          📱 Best played on desktop with a physical keyboard
        </div>
      )}

      {!gameStarted && !gameOver && (
        <div
          className={`text-center flex-1 flex flex-col items-center justify-center gap-3`}
          onClick={isMobile ? startGame : undefined}
        >
          <p className={`font-bold ${isArcade ? 'text-xl text-cyan-400' : 'text-lg text-green-400'}`}>⌨️ CODE TYPER</p>
          <p className={isArcade ? 'text-gray-400 text-sm mt-2' : 'text-xs text-green-600 mt-2'}>Type code snippets as fast as you can!</p>
          <p className={isArcade ? 'text-gray-400 text-sm mt-1' : 'text-xs text-green-700 mt-1'}>60 seconds on the clock</p>
          <p className={`animate-pulse mt-4 ${isArcade ? 'text-cyan-400 text-sm' : 'text-xs text-green-500'}`}>
            {isMobile ? 'Tap to start' : 'Press ENTER to start'}
          </p>
        </div>
      )}

      {gameStarted && (
        <div className="flex-1 flex flex-col">
          {/* Stats bar */}
          <div className={`flex justify-between text-sm mb-3 ${isArcade ? 'text-cyan-400' : 'text-green-400'}`}>
            <span>⏱️ {timeLeft}s</span>
            <span>WPM: {wpm}</span>
            <span>ACC: {accuracy}%</span>
            <span>ERR: {errors}</span>
          </div>

          {/* Code display — tap to focus the hidden input and trigger keyboard */}
          <div
            className={`border rounded p-3 font-mono whitespace-pre-wrap break-all cursor-text flex-1 relative ${
              isArcade
                ? 'border-cyan-800 bg-[#0a0a1a]/50 text-sm overflow-y-auto'
                : 'border-green-800 bg-black/50 text-xs min-h-[120px] max-h-[200px] overflow-y-auto'
            }`}
            onClick={() => inputRef.current?.focus()}
          >
            {renderCodeComparison()}
            {isMobile && !gameOver && (
              <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 animate-pulse">
                Tap here to type
              </div>
            )}
          </div>

          {/* Hidden input — sized to be focusable on mobile for native keyboard */}
          <textarea
            ref={inputRef}
            value={typed}
            onChange={(e) => handleInput(e.target.value)}
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: 1,
              height: 1,
              opacity: 0,
              border: 'none',
              padding: 0,
              margin: 0,
              resize: 'none',
              caretColor: 'transparent',
            }}
          />

          {gameOver && (
            <div className={`text-center mt-3 p-4 border rounded ${
              isArcade ? 'border-cyan-800 bg-[#0a0a1a]/80' : 'border-green-800 bg-black/50'
            }`}>
              <p className={`font-bold ${isArcade ? 'text-lg text-cyan-400' : 'text-lg text-yellow-400'}`}>⏱️ TIME'S UP!</p>
              <div className={`mt-2 space-y-1 ${isArcade ? 'text-sm text-cyan-400' : 'text-sm text-green-400'}`}>
                <p>WPM: {wpm} {wpm >= 60 ? '🔥' : wpm >= 40 ? '👍' : '💪'}</p>
                <p>Accuracy: {accuracy}%</p>
                <p>High Score: {useStore.getState().highScores.typer || 0} WPM</p>
              </div>
              <p className={`animate-pulse mt-2 ${isArcade ? 'text-gray-400 text-sm' : 'text-xs text-green-500'}`}>
                Press ENTER to retry • ESC to exit
              </p>
            </div>
          )}
        </div>
      )}

      <p className={`text-center mt-2 ${isArcade ? 'text-cyan-800 text-xs' : 'text-green-700 text-xs'}`}>
        Type the code exactly • ESC to exit
      </p>
    </div>
  );
}

