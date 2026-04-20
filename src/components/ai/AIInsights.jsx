import { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import { generateStudyInsights } from '../../services/claude';
import { Card, CardHeader, CardBody, LoadingSpinner } from '../ui';
import { Sparkles } from 'lucide-react';

export function AIInsights() {
  const { subjects, sessions } = useStudy();
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessions.length === 0) {
      setInsights('Start tracking your study sessions to get personalized insights!');
      return;
    }
    setLoading(true);
    generateStudyInsights(subjects, sessions)
      .then(setInsights)
      .catch(() => setInsights('Unable to generate insights at this time.'))
      .finally(() => setLoading(false));
  }, [subjects, sessions]);

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">AI Study Insights</h3>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {insights}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
