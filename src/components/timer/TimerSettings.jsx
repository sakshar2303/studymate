import { useTimer } from '../../context/TimerContext';
import { Card, CardHeader, CardBody, Input, Button } from '../ui';

export function TimerSettings() {
  const {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsBeforeLong,
    setWorkDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setSessionsBeforeLong,
  } = useTimer();

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Timer Settings</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Focus Duration (min)"
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => setWorkDuration(Number(e.target.value))}
          />
          <Input
            label="Short Break (min)"
            type="number"
            min="1"
            max="30"
            value={shortBreakDuration}
            onChange={(e) => setShortBreakDuration(Number(e.target.value))}
          />
          <Input
            label="Long Break (min)"
            type="number"
            min="1"
            max="60"
            value={longBreakDuration}
            onChange={(e) => setLongBreakDuration(Number(e.target.value))}
          />
          <Input
            label="Sessions before long break"
            type="number"
            min="1"
            max="10"
            value={sessionsBeforeLong}
            onChange={(e) => setSessionsBeforeLong(Number(e.target.value))}
          />
        </div>
      </CardBody>
    </Card>
  );
}
