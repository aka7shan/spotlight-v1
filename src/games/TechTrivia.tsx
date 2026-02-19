import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface TechTriviaProps {
  variant: 'netflix' | 'gpt';
  onExit: () => void;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const QUESTIONS: Question[] = [
  {
    question: 'Which hook is used for side effects in React?',
    options: ['useState', 'useEffect', 'useMemo', 'useRef'],
    correct: 1,
    category: 'React',
  },
  {
    question: 'What does REST stand for?',
    options: ['Remote Execution State Transfer', 'Representational State Transfer', 'Reliable Endpoint Service Technology', 'Real-time Event Stream Transfer'],
    correct: 1,
    category: 'API',
  },
  {
    question: 'Which data structure uses LIFO?',
    options: ['Queue', 'Array', 'Stack', 'Tree'],
    correct: 2,
    category: 'DSA',
  },
  {
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    correct: 2,
    category: 'DSA',
  },
  {
    question: 'Which AWS service is serverless compute?',
    options: ['EC2', 'Lambda', 'ECS', 'Lightsail'],
    correct: 1,
    category: 'AWS',
  },
  {
    question: 'What does JWT stand for?',
    options: ['Java Web Token', 'JSON Web Token', 'JavaScript Worker Thread', 'Joint Web Technology'],
    correct: 1,
    category: 'Security',
  },
  {
    question: 'Which MongoDB method finds one document?',
    options: ['find()', 'findOne()', 'getOne()', 'selectOne()'],
    correct: 1,
    category: 'Database',
  },
  {
    question: 'What does Docker containerize?',
    options: ['Hardware', 'Applications', 'Networks', 'Databases only'],
    correct: 1,
    category: 'DevOps',
  },
  {
    question: 'Which HTTP status code means "Not Found"?',
    options: ['200', '301', '404', '500'],
    correct: 2,
    category: 'Web',
  },
  {
    question: 'What is the purpose of Redis?',
    options: ['File storage', 'In-memory caching', 'Video processing', 'Email service'],
    correct: 1,
    category: 'Backend',
  },
  {
    question: 'Which Git command creates a new branch?',
    options: ['git branch', 'git new', 'git create', 'git fork'],
    correct: 0,
    category: 'Git',
  },
  {
    question: 'What does CI/CD stand for?',
    options: ['Code Integration / Code Deployment', 'Continuous Integration / Continuous Delivery', 'Central Instance / Central Database', 'Cloud Infrastructure / Cloud Development'],
    correct: 1,
    category: 'DevOps',
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TechTrivia({ variant, onExit }: TechTriviaProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const setHighScore = useStore((s) => s.setHighScore);

  const isNetflix = variant === 'netflix';
  const totalQuestions = 8; // Show 8 questions per round

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(QUESTIONS).slice(0, totalQuestions);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setGameOver(false);
    setGameStarted(true);
    setStreak(0);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (!gameStarted && e.key === 'Enter') startGame();
      if (gameOver && e.key === 'Enter') startGame();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, gameOver, onExit, startGame]);

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;
    setSelected(optionIndex);
    setShowResult(true);

    const isCorrect = optionIndex === questions[currentIndex].correct;
    if (isCorrect) {
      const bonus = streak >= 2 ? 15 : 10;
      setScore((s) => s + bonus);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        const finalScore = score + (isCorrect ? (streak >= 2 ? 15 : 10) : 0);
        setGameOver(true);
        setHighScore('trivia', finalScore);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const currentQ = questions[currentIndex];

  // ── Netflix Variant ──
  if (isNetflix) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-red-600 font-black text-2xl">ARE YOU STILL WATCHING?</h2>
            <button onClick={onExit} className="text-gray-400 hover:text-white cursor-pointer text-sm">✕ Close</button>
          </div>

          {!gameStarted && (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">🍿</p>
              <p className="text-white text-xl font-bold">Tech Trivia</p>
              <p className="text-gray-400 mt-2">Test your knowledge before the next episode!</p>
              <button
                onClick={startGame}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded cursor-pointer transition-colors"
              >
                ▶ START QUIZ
              </button>
            </div>
          )}

          {gameStarted && !gameOver && currentQ && (
            <>
              {/* Progress */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm">{currentIndex + 1}/{questions.length}</span>
              </div>

              {/* Streak */}
              {streak >= 2 && (
                <p className="text-yellow-400 text-xs mb-2 animate-pulse">🔥 {streak} streak! +5 bonus</p>
              )}

              {/* Question */}
              <div className="bg-[#181818] rounded-lg p-6 border border-gray-800">
                <span className="text-xs text-red-500 uppercase tracking-wider">{currentQ.category}</span>
                <p className="text-white text-lg font-semibold mt-2 mb-6">{currentQ.question}</p>

                <div className="space-y-3">
                  {currentQ.options.map((option, i) => {
                    let btnClass = 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800';
                    if (showResult) {
                      if (i === currentQ.correct) {
                        btnClass = 'border-green-500 bg-green-900/30 text-green-400';
                      } else if (i === selected && i !== currentQ.correct) {
                        btnClass = 'border-red-500 bg-red-900/30 text-red-400';
                      } else {
                        btnClass = 'border-gray-800 text-gray-600';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={showResult}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all cursor-pointer ${btnClass}`}
                      >
                        <span className="text-gray-500 mr-3">{String.fromCharCode(65 + i)}.</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>Score: {score}</span>
                <span>High: {useStore.getState().highScores.trivia || 0}</span>
              </div>
            </>
          )}

          {gameOver && (
            <div className="text-center py-8 bg-[#181818] rounded-lg border border-gray-800">
              <p className="text-4xl mb-3">{score >= 60 ? '🏆' : score >= 40 ? '⭐' : '💪'}</p>
              <p className="text-white text-2xl font-bold">Quiz Complete!</p>
              <p className="text-3xl font-black text-red-500 mt-2">{score} pts</p>
              <p className="text-gray-400 mt-2">
                {score >= 60 ? 'Outstanding! You know your stuff!' : score >= 40 ? 'Nice work! Keep learning!' : 'Good try! Practice makes perfect!'}
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={startGame}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded cursor-pointer transition-colors"
                >
                  ▶ PLAY AGAIN
                </button>
                <button
                  onClick={onExit}
                  className="border border-gray-600 text-gray-300 hover:bg-gray-800 py-2 px-6 rounded cursor-pointer transition-colors"
                >
                  BACK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── GPT Variant ──
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">🧠 Tech Trivia</h3>
        <button onClick={onExit} className="text-gray-400 hover:text-white cursor-pointer text-sm">✕ Close</button>
      </div>

      {!gameStarted && (
        <div className="text-center py-8">
          <p className="text-3xl mb-3">🧠</p>
          <p className="text-white font-bold">Tech Trivia Challenge</p>
          <p className="text-gray-400 text-sm mt-2">Test your knowledge with {totalQuestions} questions!</p>
          <button
            onClick={startGame}
            className="mt-4 bg-[#10a37f] hover:bg-[#0d8c6d] text-white font-bold py-2 px-6 rounded-lg cursor-pointer transition-colors"
          >
            Start Quiz
          </button>
        </div>
      )}

      {gameStarted && !gameOver && currentQ && (
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>{currentQ.category}</span>
            <span>{currentIndex + 1}/{questions.length} • Score: {score}</span>
          </div>

          <p className="text-white font-medium mb-4">{currentQ.question}</p>

          <div className="space-y-2">
            {currentQ.options.map((option, i) => {
              let btnClass = 'border-gray-600 text-gray-300 hover:border-[#10a37f] hover:bg-[#10a37f]/10';
              if (showResult) {
                if (i === currentQ.correct) btnClass = 'border-green-500 bg-green-900/30 text-green-400';
                else if (i === selected && i !== currentQ.correct) btnClass = 'border-red-500 bg-red-900/30 text-red-400';
                else btnClass = 'border-gray-800 text-gray-600';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full text-left px-3 py-2 rounded border text-sm transition-all cursor-pointer ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="text-center py-6 bg-[#2a2a2a] rounded-lg border border-gray-700">
          <p className="text-white text-lg font-bold">Score: {score}</p>
          <p className="text-gray-400 text-sm mt-1">High Score: {useStore.getState().highScores.trivia || 0}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={startGame} className="bg-[#10a37f] hover:bg-[#0d8c6d] text-white py-2 px-4 rounded-lg cursor-pointer text-sm">
              Play Again
            </button>
            <button onClick={onExit} className="border border-gray-600 text-gray-300 py-2 px-4 rounded-lg cursor-pointer text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

