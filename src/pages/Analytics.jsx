import { useStudy } from '../context/StudyContext';
import { StudyChart, SubjectPieChart } from '../components/analytics/StudyChart';
import { AIInsights } from '../components/ai/AIInsights';
import { Card, CardHeader, CardBody } from '../components/ui';
import { EmptyState } from '../components/ui';
import { BarChart2 } from 'lucide-react';
import { useMemo } from 'react';

export function Analytics() {
  const { sessions, subjects } = useStudy();

  const hasData = sessions.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Visualize your study patterns</p>
      </div>

      {/* AI Insights */}
      <AIInsights />

      {/* Charts */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudyChart />
          <SubjectPieChart />
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<BarChart2 className="w-10 h-10" />}
            title="No study data yet"
            description="Start a study session to see your analytics and track your progress"
          />
        </Card>
      )}

      {/* Session Summary */}
      {hasData && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {sessions.slice(0, 10).map(session => {
                const subject = subjects.find(s => s.id === session.subjectId);
                const date = session.createdAt
                  ? new Date(session.createdAt.seconds ? session.createdAt.seconds * 1000 : session.createdAt).toLocaleDateString()
                  : 'Unknown';
                return (
                  <div key={session.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subject?.color || '#f59e0b' }}
                      />
                      <span className="text-sm text-white">{subject?.name || 'General'}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span>{session.duration}m</span>
                      <span>{date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
