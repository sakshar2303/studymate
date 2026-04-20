import { useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Card, CardHeader, CardBody } from '../ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getWeekDays } from '../../utils/formatters';

export function StudyChart() {
  const { sessions } = useStudy();

  const weeklyData = useMemo(() => {
    const days = getWeekDays();
    const dailyMinutes = Array(7).fill(0);

    try {
      sessions.forEach(s => {
        if (!s.createdAt) return;
        const dateVal = s.createdAt?.seconds ? s.createdAt.seconds * 1000 : s.createdAt;
        if (!dateVal) return;
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return;
        const dayIndex = (d.getDay() + 6) % 7;
        if (dayIndex >= 0 && dayIndex < 7) {
          dailyMinutes[dayIndex] += (s.duration || 0);
        }
      });
    } catch (e) {
      console.warn('Chart data processing failed', e);
    }

    return days.map((day, i) => ({
      day,
      hours: parseFloat(((dailyMinutes[i] || 0) / 60).toFixed(1)),
    }));
  }, [sessions]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Weekly Overview</h3>
      </CardHeader>
      <CardBody>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
                formatter={(value) => [`${value}h`, 'Studied']}
              />
              <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

export function SubjectPieChart() {
  const { subjects } = useStudy();

  const data = useMemo(() => {
    return subjects
      .filter(s => s.totalHours > 0)
      .map(s => ({
        name: s.name,
        value: parseFloat(s.totalHours.toFixed(1)),
      }));
  }, [subjects]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Subject Breakdown</h3>
        </CardHeader>
        <CardBody>
          <div className="h-64 flex items-center justify-center text-slate-500">
            No study data yet
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Subject Breakdown</h3>
      </CardHeader>
      <CardBody>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}h`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
                formatter={(value) => [`${value}h`, 'Studied']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
