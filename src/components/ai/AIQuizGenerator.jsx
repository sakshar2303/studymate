import { useState, useCallback } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Card, CardHeader, CardBody, Button, LoadingSpinner, Select, Input } from '../ui';
import { generateQuizQuestions, generateFlashcards } from '../../services/gemini';
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
  const [userAnswers, setUserAnswers] = useState({});
  const [flippedCards, setFlippedCards] = useState({});

  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));

  const handleAnswerSelect = (questionIndex, opt) => {
    if (userAnswers[questionIndex]) return;
    setUserAnswers(prev => ({ ...prev, [questionIndex]: opt }));
  };

  const toggleCard = (index) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };



  const handleGenerate = useCallback(async () => {
    if (!selectedSubject || !topic.trim()) return;
    const subject = subjects.find(s => s.id === selectedSubject);
    setLoading(true);
    setQuestions([]);
    setUserAnswers({});
    setFlippedCards({});
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
        <Button 
          onClick={handleGenerate} 
          disabled={!selectedSubject || !topic.trim() || loading} 
          loading={loading} 
          className="w-full relative shadow-[0_4px_0_theme(colors.slate.800)] hover:-translate-y-[1px] hover:shadow-[0_5px_0_theme(colors.slate.800)] active:translate-y-[4px] active:shadow-none transition-all duration-150"
        >
          <Zap className="w-4 h-4" />
          <span className="ml-2">Generate {mode === 'quiz' ? 'Quiz' : 'Flashcards'} with AI</span>
        </Button>

        {loading && (
          <div className="flex flex-col items-center gap-2 py-8">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-400">AI is crafting questions for you...</p>
          </div>
        )}

        {questions.length > 0 && !loading && (
          <div className="space-y-4 mt-6">
            {mode === 'quiz' ? (
              questions.map((q, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700/50 shadow-lg rounded-xl p-5 space-y-3 transition-all hover:shadow-xl hover:-translate-y-0.5 duration-300">
                  <p className="font-medium text-white text-lg">
                    <span className="text-amber-400 mr-2">{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {q.options.map((opt, j) => {
                      const isAnswered = !!userAnswers[i];
                      const isSelected = userAnswers[i] === opt;
                      const correctIdx = q.correctAnswer ? q.correctAnswer.charCodeAt(0) - 65 : -1;
                      const correctAnswer = correctIdx >= 0 && correctIdx < q.options.length ? q.options[correctIdx] : q.correctAnswer;
                      const isCorrect = opt === correctAnswer;

                      let btnStyle = "bg-slate-700 text-slate-200 border-b-4 border-slate-900 hover:bg-slate-600 hover:-translate-y-[1px] active:translate-y-[3px] active:border-b-0";
                      
                      if (isAnswered) {
                         if (isCorrect) {
                            btnStyle = "bg-green-500/20 text-green-400 border border-green-500/30 ring-1 ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                         } else if (isSelected) {
                            btnStyle = "bg-red-500/20 text-red-400 border border-red-500/30";
                         } else {
                            btnStyle = "bg-slate-700/50 text-slate-500 border-transparent opacity-60";
                         }
                      }

                      return (
                        <button
                          key={j}
                          onClick={() => handleAnswerSelect(i, opt)}
                          disabled={isAnswered}
                          className={`text-left text-sm px-4 py-3 rounded-lg transition-all duration-200 ${btnStyle}`}
                        >
                          <span className="font-semibold opacity-60 mr-2">{String.fromCharCode(65 + j)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  
                  {userAnswers[i] && (
                    <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                       <p className="text-sm font-semibold flex items-center gap-2 mb-2 text-amber-200">
                          <Lightbulb size={16} className="text-amber-400" />
                          Explanation
                       </p>
                       <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-amber-400 font-medium text-center bg-amber-500/10 py-2 rounded-lg border border-amber-500/20">
                  {questions.length} flashcards generated! Click below to flip and practice.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 [perspective:1000px]">
                  {questions.map((card, i) => (
                    <div
                      key={i}
                      className="group h-56 w-full cursor-pointer"
                      onClick={() => toggleCard(i)}
                    >
                      <div
                        className={`relative h-full w-full rounded-xl shadow-xl transition-all duration-500 ease-out [transform-style:preserve-3d] ${flippedCards[i] ? '[transform:rotateY(180deg)]' : ''}`}
                      >
                        {/* Front side (Question) */}
                        <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-6 flex flex-col items-center justify-center text-center border overflow-hidden border-slate-600/50 [backface-visibility:hidden] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300">
                          <p className="text-lg font-medium text-white">{card.front || card.question}</p>
                          <div className="absolute bottom-4 text-slate-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FlipHorizontal size={14} />
                            <span className="text-xs">Click to flip</span>
                          </div>
                        </div>

                        {/* Back side (Answer) */}
                        <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-500/5 p-6 flex items-center justify-center text-center border overflow-hidden border-amber-500/30 text-amber-50 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_8px_30px_rgba(245,158,11,0.15)]">
                          <div className="w-full max-h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                           <p className="text-base font-normal leading-relaxed">{card.back || card.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
