import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_TIMER, TIMER_STATES } from '../utils/constants';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER.work * 60);
  const [state, setState] = useState(TIMER_STATES.IDLE);
  const [sessionType, setSessionType] = useState('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSubjectId, setCurrentSubjectId] = useState(null);
  const [workDuration, setWorkDuration] = useState(DEFAULT_TIMER.work);
  const [shortBreakDuration, setShortBreakDuration] = useState(DEFAULT_TIMER.shortBreak);
  const [longBreakDuration, setLongBreakDuration] = useState(DEFAULT_TIMER.longBreak);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(DEFAULT_TIMER.sessionsBeforeLong);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playNotification = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVcQNpHW+9qiVwZJlNj7/p4cBjqM1Pr8pxsGN47V/P6rHAU4j9X8/qwcBTaP1fz+qxwFNY/V/P6rHAU2j9X8/qscBTWP1fz+qxwFNo/V/P6rHAU1j9X8/qscBTWP1fz+qxwFNo/V/P6rHAU1j9X8/qscBTWP1fz+qxwFNY/V/P6rHAU2j9X8/qscBTaP1fz+qxwFNY/V/P6rHAU1j9X8/qscBTaP1fz+qxwFNY/V/P6rHAU2j9X8');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearTimer();
        playNotification();
        if (sessionType === 'work') {
          const newCount = sessionsCompleted + 1;
          setSessionsCompleted(newCount);
          if (newCount % sessionsBeforeLong === 0) {
            setState(TIMER_STATES.LONG_BREAK);
            setTimeLeft(longBreakDuration * 60);
            setSessionType('longBreak');
          } else {
            setState(TIMER_STATES.BREAK);
            setTimeLeft(shortBreakDuration * 60);
            setSessionType('shortBreak');
          }
        } else {
          setState(TIMER_STATES.IDLE);
          setSessionType('work');
          setTimeLeft(workDuration * 60);
        }
        return 0;
      }
      return prev - 1;
    });
  }, [sessionType, sessionsCompleted, sessionsBeforeLong, longBreakDuration, shortBreakDuration, workDuration, playNotification]);

  const start = useCallback((subjectId) => {
    if (state === TIMER_STATES.IDLE || state === TIMER_STATES.PAUSED) {
      setState(TIMER_STATES.RUNNING);
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      intervalRef.current = setInterval(tick, 1000);
      if (subjectId) setCurrentSubjectId(subjectId);
    }
  }, [state, tick]);

  const pause = useCallback(() => {
    if (state === TIMER_STATES.RUNNING) {
      clearTimer();
      setState(TIMER_STATES.PAUSED);
    }
  }, [state]);

  const resume = useCallback(() => {
    if (state === TIMER_STATES.PAUSED || state === TIMER_STATES.IDLE) {
      setState(TIMER_STATES.RUNNING);
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [state, tick]);

  const stop = useCallback(() => {
    clearTimer();
    setState(TIMER_STATES.IDLE);
    setTimeLeft(workDuration * 60);
    setSessionType('work');
    startTimeRef.current = null;
  }, [workDuration]);

  const reset = useCallback(() => {
    clearTimer();
    setState(TIMER_STATES.IDLE);
    setTimeLeft(workDuration * 60);
    setSessionType('work');
    setSessionsCompleted(0);
    startTimeRef.current = null;
  }, [workDuration]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <TimerContext.Provider value={{
      timeLeft,
      state,
      sessionType,
      sessionsCompleted,
      currentSubjectId,
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      sessionsBeforeLong,
      start,
      pause,
      resume,
      stop,
      reset,
      setWorkDuration,
      setShortBreakDuration,
      setLongBreakDuration,
      setSessionsBeforeLong,
      startTimeRef,
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
};
