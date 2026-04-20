import { useTimer } from '../../context/TimerContext';
import { formatTime } from '../../utils/formatters';
import { TIMER_STATES } from '../../utils/constants';
import { Play, Pause, Square, RotateCcw, Coffee, Brain } from 'lucide-react';
import { Button } from '../ui';

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
    <div className="flex flex-col items-center gap-6">
      {/* Session type badge */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${isBreak ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
        {isBreak ? <Coffee className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
        <span className="text-sm font-medium">{sessionLabel}</span>
      </div>

      {/* Timer circle */}
      <div className="relative">
        <div className="w-56 h-56 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="104"
              fill="none"
              stroke={isBreak ? '#22c55e' : '#f59e0b'}
              strokeWidth="4"
              strokeDasharray={`${(1 - progress / 100) * 654} 654`}
              className="transition-all duration-1000"
            />
          </svg>

          <div className="text-center">
            <div className={`text-5xl font-mono font-bold ${accentColor} ${isRunning ? 'timer-pulse' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Session {sessionsCompleted + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
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
      </div>
    </div>
  );
}
