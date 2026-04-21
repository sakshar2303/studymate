import { useStudy } from '../context/StudyContext';
import { Card, CardBody, CardHeader, Button, EmptyState } from '../components/ui';
import { InsightCard } from '../components/analytics/InsightCard';
import { SubjectCard } from '../components/analytics/InsightCard';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { UpcomingTasks } from '../components/study/UpcomingTasks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { motion } from 'framer-motion';
import { Plus, Play, BookOpen } from 'lucide-react';

export function Dashboard() {
  const { subjects = [] } = useStudy();
  const navigate = useNavigate();

  const recentSubjects = subjects ? subjects.slice(0, 3) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track your study progress</p>
        </div>
        <Button onClick={() => navigate(ROUTES.STUDY_SESSION)} className="glow-button">
          <Play className="w-4 h-4" /> Start Studying
        </Button>
      </div>

      {/* Quick Stats */}
      <InsightCard />

      {/* Main Grid: Tasks + Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingTasks />
        </div>
        <div>
          <Card className="h-full glow-ring">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Quick Timer</h3>
            </CardHeader>
            <CardBody className="flex justify-center py-6">
              <PomodoroTimer compact />
            </CardBody>
          </Card>
        </div>
      </div>

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
    </motion.div>
  );
}
