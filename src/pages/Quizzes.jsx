import { AIQuizGenerator } from '../components/ai/AIQuizGenerator';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFlashcards, updateFlashcard } from '../services/firebase';
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

  const filteredDue = useMemo(() => {
    const today = new Date();
    return filtered.filter(c => {
      if (!c.nextReview) return true;
      return new Date(c.nextReview) <= today;
    });
  }, [filtered]);

  const startReview = () => {
    setReviewMode(true);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < filteredDue.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
    } else {
      setReviewMode(false);
    }
  };

  const rateCard = async (quality) => {
    const card = filteredDue[currentIndex];
    let interval = card.interval || 0;
    let repetitions = card.repetitions || 0;
    let easeFactor = card.easeFactor || 2.5;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    if (user) {
      await updateFlashcard(user.uid, card.id, {
        interval,
        repetitions,
        easeFactor,
        nextReview: nextReviewDate.toISOString()
      });
      setFlashcards(prev => prev.map(c => c.id === card.id ? {
        ...c, interval, repetitions, easeFactor, nextReview: nextReviewDate.toISOString()
      } : c));
    }
    nextCard();
  };

  if (reviewMode && filteredDue.length > 0) {
    const card = filteredDue[currentIndex];
    const subject = subjects.find(s => s.id === card.subjectId);
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Flashcard Review</h1>
          <p className="text-slate-400 text-sm">{currentIndex + 1} of {filteredDue.length} due today</p>
        </div>
        <div
          className="group min-h-[350px] relative bg-slate-800 rounded-xl border border-slate-700 p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => setFlipped(f => !f)}
          style={{ perspective: '1000px' }}
        >
           <div className={`absolute inset-0 w-full h-full rounded-xl transition-all duration-500 ease-out [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
             
             {/* Front Side */}
             <div className="absolute inset-0 w-full h-full bg-slate-800 rounded-xl flex flex-col items-center justify-center p-8 [backface-visibility:hidden]">
               <Badge className="mb-4">{subject?.name || 'General'}</Badge>
               <p className="text-2xl font-medium text-center text-white">{card.front}</p>
               <p className="absolute bottom-6 text-sm text-slate-500 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                 <FlipHorizontal size={14} /> Click to reveal answer
               </p>
             </div>

             {/* Back Side */}
             <div className="absolute inset-0 w-full h-full bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col items-center justify-center p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]">
               <Badge variant="amber" className="mb-4">Answer</Badge>
               <div className="w-full max-h-full overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                 <p className="text-lg text-center text-amber-50 font-normal">{card.back}</p>
               </div>
             </div>

           </div>
        </div>

        {flipped ? (
          <div className="flex justify-center gap-3 mt-8">
             <button onClick={(e) => { e.stopPropagation(); rateCard(1); }} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Again</button>
             <button onClick={(e) => { e.stopPropagation(); rateCard(3); }} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">Hard</button>
             <button onClick={(e) => { e.stopPropagation(); rateCard(4); }} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">Good</button>
             <button onClick={(e) => { e.stopPropagation(); rateCard(5); }} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors border-b-4 border-green-800 active:border-b-0 active:translate-y-[4px]">Easy</button>
          </div>
        ) : (
          <div className="flex justify-center mt-8">
            <Button variant="secondary" onClick={() => setReviewMode(false)}>Exit Review</Button>
          </div>
        )}
      </div>
    );
  }

  if (reviewMode && filteredDue.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
         <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-green-400" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
         <p className="text-slate-400 mb-8 text-center text-sm">There are no flashcards due for review in this subject right now. Check back later!</p>
         <Button onClick={() => setReviewMode(false)}>Back to Quizzes</Button>
      </div>
    )
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
              <Button onClick={startReview} disabled={filteredDue.length === 0}>
                <FlipHorizontal className="w-4 h-4" /> Review ({filteredDue.length} Due)
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
