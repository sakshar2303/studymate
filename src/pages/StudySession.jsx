import { useState, useCallback } from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { Card, CardHeader, CardBody, Button, Select } from '../components/ui';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { Play } from 'lucide-react';
import { TIMER_STATES } from '../utils/constants';

export function StudySession() {
  const { subjects, addSession } = useStudy();
  const { state, currentSubjectId, start, stop, startTimeRef } = useTimer();
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));

  const handleStartWithSubject = useCallback(async () => {
    if (selectedSubjectId) {
      start(selectedSubjectId);
    } else {
      start(null);
    }
  }, [selectedSubjectId, start]);

  const handleStopAndLog = useCallback(async () => {
    const endTime = Date.now();
    const startTime = startTimeRef.current || endTime;
    const durationMinutes = Math.round((endTime - startTime) / 60000);

    if (currentSubjectId && durationMinutes > 0) {
      await addSession({
        subjectId: currentSubjectId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: durationMinutes,
        type: 'pomodoro',
        completed: true,
      });
    }
    stop();
  }, [currentSubjectId, startTimeRef, addSession, stop]);

  const isRunning = state === TIMER_STATES.RUNNING || state === TIMER_STATES.PAUSED;
  const isIdle = state === TIMER_STATES.IDLE;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Study Session</h1>
        <p className="text-slate-400 text-sm mt-1">Focus. Track. Achieve.</p>
      </div>

      {/* Subject Selector */}
      {!isRunning && subjects.length > 0 && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-3 items-end">
              <Select
                label="Select Subject (optional)"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                options={[{ value: '', label: 'General (no subject)' }, ...subjectOptions]}
                className="flex-1"
              />
              <Button onClick={handleStartWithSubject}>
                <Play className="w-4 h-4" /> Start Timer
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Timer */}
      <Card>
        <CardBody className="py-8">
          <PomodoroTimer />
        </CardBody>
      </Card>

      {/* Stop & Log Button */}
      {isRunning && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400 mb-3">
            {currentSubjectId
              ? `Studying: ${subjects.find(s => s.id === currentSubjectId)?.name || 'Subject'}`
              : 'General study session'}
          </p>
          <Button variant="secondary" onClick={handleStopAndLog}>
            Stop & Log Session
          </Button>
        </div>
      )}

      {subjects.length === 0 && !isRunning && (
        <Card className="mt-6">
          <CardBody className="text-center py-8">
            <p className="text-slate-400">Add subjects first to track study time per subject.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
