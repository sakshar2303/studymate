import { useTimer } from '../../context/TimerContext';
import { formatTime } from '../../utils/formatters';
import { TIMER_STATES } from '../../utils/constants';
import { Play, Pause, Square, RotateCcw, Coffee, Brain, Maximize2, Minimize2, Music, VolumeX } from 'lucide-react';
import { Button } from '../ui';
import { useState, useRef, useEffect } from 'react';

export function PomodoroTimer({ compact = false }) {
  const {
    timeLeft,
    state,
    sessionType,
    sessionsCompleted,
    currentSubjectId,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useTimer();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
       audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'); // Mock Lofi track
       audioRef.current.loop = true;
       audioRef.current.volume = 0.5;
    }
  }, []);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  const isRunning = state === TIMER_STATES.RUNNING;
  const isPaused = state === TIMER_STATES.PAUSED;
  const isIdle = state === TIMER_STATES.IDLE;
  const isBreak = sessionType !== 'work';

  const progress = sessionType === 'work'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : sessionType === 'shortBreak'
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((15 * 60 - timeLeft) / (15 * 60)) * 100;

  const sessionLabel = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  }[sessionType];

  const accentColor = isBreak ? 'text-green-400' : 'text-amber-400';

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`text-2xl font-mono font-bold ${accentColor}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-1">
          {isIdle && <Button size="sm" onClick={() => start(currentSubjectId)}><Play className="w-3 h-3" /></Button>}
          {isRunning && <Button size="sm" variant="secondary" onClick={pause}><Pause className="w-3 h-3" /></Button>}
          {isPaused && <Button size="sm" onClick={resume}><Play className="w-3 h-3" /></Button>}
          {!isIdle && <Button size="sm" variant="ghost" onClick={stop}><Square className="w-3 h-3" /></Button>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md p-10 h-screen w-screen' : 'gap-6'}`}>
      
      {isFullscreen && (
         <div className="absolute top-8 right-8 flex gap-4">
             <Button variant="ghost" onClick={toggleAudio} className={`rounded-full p-3 ${isPlayingAudio ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                {isPlayingAudio ? <Music className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
             </Button>
             <Button variant="ghost" onClick={() => setIsFullscreen(false)} className="rounded-full p-3 bg-slate-800 text-white">
                <Minimize2 className="w-5 h-5" />
             </Button>
         </div>
      )}

      {isFullscreen && (
          <h1 className="text-4xl font-bold text-white mb-12 opacity-80">Focus Mode</h1>
      )}

      {/* Session type badge */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${isFullscreen ? 'mb-8 scale-125' : ''} ${isBreak ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
        {isBreak ? <Coffee className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
        <span className="text-sm font-medium">{sessionLabel}</span>
      </div>

      {/* Timer circle */}
      <div className="relative">
        <div className={`${isFullscreen ? 'w-80 h-80' : 'w-56 h-56'} rounded-full border-4 border-slate-700 flex items-center justify-center relative transition-all duration-500`}>
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle
               cx={isFullscreen ? 160 : 112}
               cy={isFullscreen ? 160 : 112}
               r={isFullscreen ? 152 : 104}
               fill="none"
               stroke={isBreak ? '#22c55e' : '#f59e0b'}
               strokeWidth="4"
               strokeDasharray={`${(1 - progress / 100) * (isFullscreen ? 955 : 654)} ${isFullscreen ? 955 : 654}`}
               className="transition-all duration-1000 ease-linear"
             />
          </svg>

          <div className="text-center">
            <div className={`${isFullscreen ? 'text-7xl font-bold tracking-tight' : 'text-5xl font-mono font-bold'} ${accentColor} ${isRunning ? 'timer-pulse' : ''} transition-all duration-500`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-slate-400 mt-2">
              Session {sessionsCompleted + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`flex gap-3 ${isFullscreen ? 'mt-12 scale-125' : ''} transition-all duration-500`}>
        {isIdle && (
          <Button size="lg" onClick={() => start(currentSubjectId)}>
            <Play className="w-5 h-5" /> Start Studying
          </Button>
        )}
        {isRunning && (
          <Button size="lg" variant="secondary" onClick={pause}>
            <Pause className="w-5 h-5" /> Pause
          </Button>
        )}
        {isPaused && (
          <>
            <Button size="lg" onClick={resume}>
              <Play className="w-5 h-5" /> Resume
            </Button>
            <Button size="lg" variant="ghost" onClick={stop}>
              <Square className="w-5 h-5" /> Stop
            </Button>
          </>
        )}
        {isBreak && (
          <Button size="lg" variant="ghost" onClick={stop}>
            <Square className="w-5 h-5" /> Skip Break
          </Button>
        )}
        <Button size="lg" variant="ghost" onClick={reset} title="Reset timer">
          <RotateCcw className="w-5 h-5" />
        </Button>
        
        {!isFullscreen && (
          <Button size="lg" variant="ghost" onClick={() => setIsFullscreen(true)} title="Focus Mode">
            <Maximize2 className="w-5 h-5" />
          </Button>
        )}
      </div>
      
      {/* Mini Audio Player for normal view */}
      {!isFullscreen && (
         <div className="mt-2 text-slate-500 flex items-center gap-2 text-xs">
            <button onClick={toggleAudio} className={`hover:text-amber-400 transition-colors ${isPlayingAudio ? 'text-amber-500' : ''}`}>
               {isPlayingAudio ? <Music className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {isPlayingAudio ? 'Lofi Beats Playing' : 'Ambient Audio Off'}
         </div>
      )}
    </div>
  );
}
