import { useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Card, CardHeader, CardBody, Badge, ProgressBar } from '../ui';
import { formatDuration } from '../../utils/formatters';
import { TrendingUp, Target, Flame } from 'lucide-react';
import { getStreak } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export function InsightCard() {
  const { subjects = [], sessions = [] } = useStudy();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const streak = getStreak(sessions);
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const todaySessions = (sessions || []).filter(s => {
      if (!s.createdAt) return false;
      try {
        const dateVal = s.createdAt?.seconds ? s.createdAt.seconds * 1000 : s.createdAt;
        if (!dateVal) return false;
        const d = new Date(dateVal);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    });
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    const subjectStats = (subjects || []).map(s => ({
      ...s,
      progress: (s.goalHours > 0) ? Math.min(100, ((s.totalHours || 0) / s.goalHours) * 100) : 0,
    }));

    const topSubject = subjectStats.length > 0 
      ? subjectStats.sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0))[0]
      : null;

    return { streak, totalHours, todayMinutes, topSubject, subjectStats };
  }, [subjects, sessions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Streak */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
        <CardBody className="flex flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-400 fire-icon" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{stats.streak}</p>
            <p className="text-xs text-slate-400">Day Streak</p>
          </div>
        </CardBody>
      </Card>

      {/* Total Hours */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        <CardBody className="flex flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{formatDuration(stats.totalHours * 60)}</p>
            <p className="text-xs text-slate-400">Total Study Time</p>
          </div>
        </CardBody>
      </Card>

      {/* Today's Progress */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        <CardBody className="flex flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{formatDuration(stats.todayMinutes)}</p>
            <p className="text-xs text-slate-400">Today</p>
          </div>
        </CardBody>
      </Card>

      {/* Top Subject */}
      {stats.topSubject && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardBody>
            <p className="text-xs text-slate-400 mb-1">Strongest Subject</p>
            <p className="text-lg font-semibold text-purple-400 truncate">{stats.topSubject.name}</p>
            <p className="text-sm text-slate-500">{formatDuration(stats.topSubject.totalHours * 60)} logged</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export function SubjectCard({ subject, showProgress = true }) {
  return (
    <Card className="hover:border-slate-600 transition-colors">
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">{subject.name}</h3>
            <p className="text-sm text-slate-400">{formatDuration((subject.totalHours || 0) * 60)} logged</p>
          </div>
          {subject.goalHours > 0 && (
            <Badge variant="amber">
              {Math.round((subject.totalHours / subject.goalHours) * 100)}%
            </Badge>
          )}
        </div>
        {showProgress && subject.goalHours > 0 && (
          <div>
            <ProgressBar
              value={subject.totalHours}
              max={subject.goalHours}
              color={`bg-[${subject.color || '#f59e0b'}]`}
            />
            <p className="text-xs text-slate-500 mt-1">Goal: {subject.goalHours}h</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
