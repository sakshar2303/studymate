import { useState, useCallback } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Card, CardHeader, CardBody, Button, LoadingSpinner, Select, Input } from '../ui';
import { generateQuizQuestions, generateFlashcards } from '../../services/claude';
import { addQuiz, addFlashcards } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { Zap, BookOpen, FlipHorizontal, Lightbulb } from 'lucide-react';

export function AIQuizGenerator() {
  const { subjects } = useStudy();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [mode, setMode] = useState('quiz'); // 'quiz' or 'flashcard'

  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));

  const handleGenerate = useCallback(async () => {
    if (!selectedSubject || !topic.trim()) return;
    const subject = subjects.find(s => s.id === selectedSubject);
    setLoading(true);
    setQuestions([]);
    try {
      if (mode === 'quiz') {
        const qs = await generateQuizQuestions(subject?.name || 'General', topic, count);
        setQuestions(qs);
        await addQuiz(user.uid, { subjectId: selectedSubject, topic, questions: qs });
      } else {
        const cards = await generateFlashcards(subject?.name || 'General', topic, count);
        setQuestions(cards);
        await addFlashcards(user.uid, cards.map(c => ({ ...c, subjectId: selectedSubject })));
      }
    } catch (e) {
      console.error('AI generation failed:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, topic, count, mode, subjects, user]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">AI Quiz Generator</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('quiz')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${mode === 'quiz' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}
            >
              Quiz
            </button>
            <button
              onClick={() => setMode('flashcard')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${mode === 'flashcard' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}
            >
              Flashcards
            </button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={[{ value: '', label: 'Select subject...' }, ...subjectOptions]}
          />
          <Input
            label="Topic"
            placeholder={mode === 'quiz' ? 'e.g. World War II' : 'e.g. Python loops'}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input
            label="Count"
            type="number"
            min="3"
            max="10"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
        <Button onClick={handleGenerate} disabled={!selectedSubject || !topic.trim() || loading} loading={loading} className="w-full">
          <Zap className="w-4 h-4" />
          Generate {mode === 'quiz' ? 'Quiz' : 'Flashcards'} with AI
        </Button>

        {loading && (
          <div className="flex flex-col items-center gap-2 py-8">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-400">AI is crafting questions for you...</p>
          </div>
        )}

        {questions.length > 0 && !loading && (
          <div className="space-y-3">
            {mode === 'quiz' ? (
              questions.map((q, i) => (
                <div key={i} className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-white">
                    <span className="text-amber-400 mr-2">{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {q.options.map((opt, j) => (
                      <div key={j} className={`text-sm px-3 py-1.5 rounded ${opt === q.options[q.correctAnswer.charCodeAt(0) - 65] ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-300'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{q.explanation}</p>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-400 text-center">{questions.length} flashcards saved to your collection</p>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
