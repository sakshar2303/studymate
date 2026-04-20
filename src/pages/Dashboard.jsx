import { useStudy } from '../context/StudyContext';
import { Card, CardBody, CardHeader, Button, EmptyState } from '../components/ui';
import { InsightCard } from '../components/analytics/InsightCard';
import { SubjectCard } from '../components/analytics/InsightCard';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Plus, Play, BookOpen } from 'lucide-react';

export function Dashboard() {
  const { subjects } = useStudy();
  const navigate = useNavigate();

  const recentSubjects = subjects.slice(0, 3);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track your study progress</p>
        </div>
        <Button onClick={() => navigate(ROUTES.STUDY_SESSION)}>
          <Play className="w-4 h-4" /> Start Studying
        </Button>
      </div>

      {/* Quick Stats */}
      <InsightCard />

      {/* Quick Timer */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Quick Timer</h3>
        </CardHeader>
        <CardBody className="flex justify-center py-6">
          <PomodoroTimer compact />
        </CardBody>
      </Card>

      {/* Recent Subjects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Subjects</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.SUBJECTS)}>
              View All
            </Button>
            <Button size="sm" onClick={() => navigate(ROUTES.SUBJECTS)}>
              <Plus className="w-3 h-3" /> Add Subject
            </Button>
          </div>
        </div>

        {recentSubjects.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-10 h-10" />}
            title="No subjects yet"
            description="Add your first subject to start tracking your study sessions"
            action={
              <Button onClick={() => navigate(ROUTES.SUBJECTS)}>
                <Plus className="w-4 h-4" /> Add Subject
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSubjects.map(subject => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
