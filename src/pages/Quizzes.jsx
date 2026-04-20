import { AIQuizGenerator } from '../components/ai/AIQuizGenerator';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFlashcards } from '../services/firebase';
import { useStudy } from '../context/StudyContext';
import { Card, CardHeader, CardBody, Button, Select, Badge, EmptyState } from '../components/ui';
import { useMemo } from 'react';
import { FlipHorizontal, Trash2, BookOpen } from 'lucide-react';

export function Quizzes() {
  const { user } = useAuth();
  const { subjects } = useStudy();
  const [flashcards, setFlashcards] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));

  useEffect(() => {
    if (!user) return;
    const loadCards = async () => {
      const cards = await getFlashcards(user.uid, selectedSubjectId || null);
      setFlashcards(cards);
    };
    loadCards();
  }, [user, selectedSubjectId]);

  const filtered = useMemo(() => {
    if (!selectedSubjectId) return flashcards;
    return flashcards.filter(c => c.subjectId === selectedSubjectId);
  }, [flashcards, selectedSubjectId]);

  const startReview = () => {
    setReviewMode(true);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < filtered.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
    } else {
      setReviewMode(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setFlipped(false);
    }
  };

  if (reviewMode && filtered.length > 0) {
    const card = filtered[currentIndex];
    const subject = subjects.find(s => s.id === card.subjectId);
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Flashcard Review</h1>
          <p className="text-slate-400 text-sm">{currentIndex + 1} of {filtered.length}</p>
        </div>
        <div
          className="min-h-[300px] bg-slate-800 rounded-xl border border-slate-700 p-8 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setFlipped(f => !f)}
        >
          <Badge className="mb-4">{subject?.name || 'General'}</Badge>
          <p className="text-xl font-medium text-center text-white mb-6">
            {flipped ? card.back : card.front}
          </p>
          <p className="text-sm text-slate-500">{flipped ? 'Answer' : 'Question'} — click to {flipped ? 'see question' : 'reveal answer'}</p>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={prevCard} disabled={currentIndex === 0}>Previous</Button>
          <Button variant="secondary" onClick={() => setReviewMode(false)}>Exit Review</Button>
          <Button onClick={nextCard}>{currentIndex < filtered.length - 1 ? 'Next' : 'Finish'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Quiz Center</h1>
        <p className="text-slate-400 text-sm mt-1">Generate AI quizzes and review flashcards</p>
      </div>

      {/* AI Generator */}
      <AIQuizGenerator />

      {/* Flashcards Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">My Flashcards</h3>
              {filtered.length > 0 && (
                <Badge variant="amber">{filtered.length} cards</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Select
                placeholder="Filter by subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                options={[{ value: '', label: 'All subjects' }, ...subjectOptions]}
              />
              <Button onClick={startReview} disabled={filtered.length === 0}>
                <FlipHorizontal className="w-4 h-4" /> Review
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-10 h-10" />}
              title="No flashcards yet"
              description="Generate flashcards using the AI Quiz Generator above"
            />
          ) : (
            <div className="space-y-2">
              {filtered.map(card => {
                const subject = subjects.find(s => s.id === card.subjectId);
                return (
                  <div key={card.id} className="flex items-center justify-between py-2 px-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject?.color || '#f59e0b' }} />
                      <div>
                        <p className="text-sm text-white">{card.front}</p>
                        <p className="text-xs text-slate-500 truncate max-w-md">{card.back}</p>
                      </div>
                    </div>
                    <Badge variant="default">{subject?.name || 'General'}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
