import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Point } from './types';
import { GRID_SIZE, INITIAL_SPEED, TRACKS } from './constants';
import { MobileControls } from './components/MobileControls';

const generateFood = (snake: Point[]): Point => {
  let newFood = { x: 0, y: 0 };
  let isValid = false;
  while (!isValid) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    isValid = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood;
};

export default function App() {
  // Game State
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [nextDirection, setNextDirection] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Music Player State
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
  };

  const skipBack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrackIdx, isPlaying]);

  // --- Game Logic ---
  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setNextDirection({ x: 0, y: -1 });
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setFood(generateFood([{ x: 10, y: 10 }]));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      setNextDirection((prev) => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return prev.y !== 1 ? { x: 0, y: -1 } : prev;
          case 'ArrowDown':
          case 's':
          case 'S':
            return prev.y !== -1 ? { x: 0, y: 1 } : prev;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return prev.x !== 1 ? { x: -1, y: 0 } : prev;
          case 'ArrowRight':
          case 'd':
          case 'D':
            return prev.x !== -1 ? { x: 1, y: 0 } : prev;
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + nextDirection.x,
          y: head.y + nextDirection.y
        };

        setDirection(nextDirection);

        // Wall Collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        // Self Collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(60, INITIAL_SPEED - Math.floor(score / 50) * 10);
    const intervalId = setInterval(moveSnake, speed);

    return () => clearInterval(intervalId);
  }, [gameStarted, gameOver, nextDirection.x, nextDirection.y, food.x, food.y, score]);

  const handleGameOver = () => {
    setGameOver(true);
    setHighScore((prev) => Math.max(prev, score));
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col selection:bg-[#00f2ff33] selection:text-[#00f2ff] overflow-hidden relative">
      {/* Background Ambience / Grid */}
      <div id="grid-background" className="absolute inset-0 pointer-events-none grid-background"></div>

      {/* Header */}
      <motion.header 
        id="app-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full flex flex-row items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-[#ffffff10] bg-[#0a0a0a]"
      >
        <div id="app-branding" className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight italic text-[#e0e0e0]">
            Neon <span className="text-[#00f2ff]">Snake</span>
          </h1>
          <p className="text-[10px] md:text-xs tracking-[0.2em] text-[#888] uppercase mt-1">A.I. Synth Edition</p>
        </div>

        <div id="score-section" className="flex gap-4 md:gap-8 items-center">
          <div id="score-display" className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs text-[#888] uppercase tracking-[0.2em] mb-1">Score</span>
            <span className="text-xl md:text-3xl font-mono font-black text-[#00f2ff] drop-shadow-[0_0_8px_#00f2ff88]">
              {score.toString().padStart(4, '0')}
            </span>
          </div>
          <div id="high-score-display" className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs text-[#888] uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
              <Trophy size={10} className="text-[#ff00ff]" /> High Score
            </span>
            <span className="text-xl md:text-3xl font-mono font-black text-[#ff00ff] drop-shadow-[0_0_8px_#ff00ff88]">
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 relative z-10 flex flex-col items-center justify-center p-4 gap-6">
        
        {/* Game Container */}
        <div id="game-container" className="relative group touch-none">
          {/* Neon Border Glow */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#00f2ff] to-[#ff00ff] blur-md opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 rounded-2xl"></div>
          
          <div id="game-board-wrapper" className="relative bg-[#0a0a0a] border-2 border-[#00f2ff33] rounded-2xl p-2 shadow-[inset_0_0_30px_rgba(0,242,255,0.05)] overflow-hidden">
            {/* Grid Draw */}
            <div 
              id="game-board-grid"              
              className="grid gap-[1px] w-[300px] h-[300px] md:w-[400px] md:h-[400px] relative z-10 grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))]"
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isSnakePart = snake.some((s) => s.x === x && s.y === y);
                const isFood = food.x === x && food.y === y;
                const isHead = snake[0].x === x && snake[0].y === y;

                return (
                  <div
                    key={i}
                    className={`w-full h-full rounded-[1px] transition-all duration-75 ${
                      isHead
                        ? 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff] z-10'
                        : isSnakePart
                        ? 'bg-[#00f2ff]/80 shadow-[0_0_5px_rgba(0,242,255,0.5)]'
                        : isFood
                        ? 'bg-[#ff00ff] shadow-[0_0_15px_#ff00ff] animate-pulse rounded-full'
                        : 'transparent'
                    }`}
                  />
                );
              })}
            </div>

            {/* Overlays */}
            <AnimatePresence>
            {(!gameStarted || gameOver) && (
              <motion.div 
                id="game-overlay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm flex flex-col items-center justify-center z-20"
              >
                <motion.h2 
                  id="overlay-title"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-2xl md:text-4xl font-black tracking-widest text-[#00f2ff] drop-shadow-[0_0_15px_rgba(0,242,255,0.5)] mb-6"
                >
                  {gameOver ? 'SYSTEM FAILURE' : 'SYSTEM READY'}
                </motion.h2>
                {gameOver && (
                  <div id="overlay-final-score" className="mb-6 text-center">
                    <p className="text-[#888] mb-1 text-sm md:text-base uppercase tracking-widest">FINAL SCORE</p>
                    <p className="text-4xl font-mono font-black text-[#ff00ff] drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
                      {score.toString().padStart(4, '0')}
                    </p>
                  </div>
                )}
                <button
                  id="btn-start-game"
                  onClick={startGame}
                  className="group relative px-6 py-3 md:px-8 md:py-4 font-bold text-[#050505] uppercase tracking-widest overflow-hidden text-sm md:text-base rounded-md"
                >
                  <div className="absolute inset-0 bg-[#00f2ff] group-hover:bg-[#00f2ff]/80 transition-colors"></div>
                  <div className="absolute inset-0 ring-1 ring-[#00f2ff] ring-offset-2 ring-offset-[#0a0a0a] shadow-[0_0_15px_#00f2ff] rounded-md"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {gameOver ? 'Reboot System' : 'Initialize'}
                    <RefreshCw className={gameOver ? 'animate-spin' : ''} size={18} />
                  </span>
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Controls DPAD */}
        <MobileControls onDirection={(dir) => {
          setNextDirection((prev) => {
            switch (dir) {
              case 'UP': return prev.y !== 1 ? { x: 0, y: -1 } : prev;
              case 'DOWN': return prev.y !== -1 ? { x: 0, y: 1 } : prev;
              case 'LEFT': return prev.x !== 1 ? { x: -1, y: 0 } : prev;
              case 'RIGHT': return prev.x !== -1 ? { x: 1, y: 0 } : prev;
              default: return prev;
            }
          });
        }} />
      </main>

      {/* Footer / Music Player */}
      <motion.footer 
        id="app-footer-player"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full bg-[#0a0a0a] border-t border-[#ffffff10] px-4 md:px-10 py-4 md:min-h-[5rem] flex items-center justify-center"
      >
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-10">
          
          {/* Track Info */}
          <div id="now-playing-info" className="flex items-center gap-4 w-full sm:w-1/3">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#111] via-[#00f2ff22] to-[#ff00ff22] border border-[#ffffff10] rounded-xl flex shrink-0 items-center justify-center relative overflow-hidden">
               {isPlaying && (
                 <div id="music-visualizer" className="absolute inset-0 flex items-center gap-[2px] justify-center opacity-80 px-2">
                    <div className="w-1 bg-[#00f2ff] h-full animate-music-bar-1 shadow-[0_0_5px_#00f2ff]" />
                    <div className="w-1 bg-[#ff00ff] h-full animate-music-bar-2 shadow-[0_0_5px_#ff00ff]" />
                    <div className="w-1 bg-[#00f2ff] h-full animate-music-bar-3 shadow-[0_0_5px_#00f2ff]" />
                 </div>
               )}
            </div>
            <div className="flex flex-col min-w-0">
              <span id="track-title" className="text-sm font-bold text-white leading-tight truncate w-full">
                {TRACKS[currentTrackIdx].title}
              </span>
              <span id="track-artist" className="text-[10px] text-[#00f2ff] font-medium opacity-80 uppercase tracking-wider truncate w-full">
                {TRACKS[currentTrackIdx].artist}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div id="player-controls" className="flex items-center justify-center gap-4 md:gap-8 w-full sm:w-1/3">
            <button 
              id="btn-skip-back"
              onClick={skipBack}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#555] hover:text-[#00f2ff] hover:bg-[#111] transition-all"
            >
              <SkipBack size={24} />
            </button>
            <button 
              id="btn-play-pause"
              onClick={togglePlay}
              className="w-14 h-14 min-w-[56px] min-h-[56px] shrink-0 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all outline-none border-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
            </button>
            <button 
              id="btn-skip-forward"
              onClick={skipForward}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#555] hover:text-[#00f2ff] hover:bg-[#111] transition-all"
            >
              <SkipForward size={24} />
            </button>
          </div>

          {/* Volume */}
          <div id="volume-controls" className="hidden sm:flex items-center justify-end gap-2 md:gap-4 w-full sm:w-1/3">
            <button 
              id="btn-mute"
              onClick={() => setVolume(v => v === 0 ? 0.5 : 0)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#555] hover:text-[#00f2ff] hover:bg-[#111] transition-all"
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="flex items-center min-h-[44px]">
              <input 
                id="slider-volume"
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-transparent rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

        </div>

        <audio 
          id="music-audio-element"
          ref={audioRef}
          src={TRACKS[currentTrackIdx].url}
          onEnded={skipForward}
          className="hidden"
        />
      </motion.footer>
    </div>
  );
}
