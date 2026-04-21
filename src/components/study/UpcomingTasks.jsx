import { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Card, CardHeader, CardBody, Button, Badge, Input, Select } from '../ui';
import { Plus, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

export function UpcomingTasks() {
  const { tasks = [], subjects = [], addTask, updateTask, deleteTask } = useStudy();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('assignment'); // 'assignment', 'exam', 'reading'
  const [dueDate, setDueDate] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));

  const handleAdd = async () => {
    if (!title.trim() || !dueDate) return;
    await addTask({
      title,
      type,
      dueDate,
      subjectId,
    });
    setIsAdding(false);
    setTitle('');
    setDueDate('');
    setSubjectId('');
  };

  const toggleTask = async (task) => {
    await updateTask(task.id, { completed: !task.completed });
  };

  const getDaysUntil = (dateStr) => {
    const diffTime = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffTime < 0) return 'Overdue';
    if (diffTime === 0) return 'Today';
    if (diffTime === 1) return 'Tomorrow';
    return `In ${diffTime} days`;
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Card className="flex-1 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Upcoming Tasks & Exams</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4" /> Add
        </Button>
      </CardHeader>

      <CardBody className="flex-1 overflow-y-auto space-y-4 max-h-[400px] custom-scrollbar">
        {isAdding && (
          <div className="bg-slate-800/50 p-4 rounded-xl space-y-3 mb-4 border border-slate-700">
            <Input 
               placeholder="Task title (e.g., Math Midterm)" 
               value={title} 
               onChange={e => setTitle(e.target.value)} 
               autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
               <Select 
                 value={type} 
                 onChange={e => setType(e.target.value)}
                 options={[
                   {value: 'assignment', label: 'Assignment'},
                   {value: 'exam', label: 'Exam'},
                   {value: 'reading', label: 'Reading'}
                 ]}
               />
               <Input 
                 type="date"
                 value={dueDate}
                 onChange={e => setDueDate(e.target.value)}
               />
            </div>
            <Select 
               placeholder="Subject (Optional)"
               value={subjectId}
               onChange={e => setSubjectId(e.target.value)}
               options={[{value: '', label: 'General'}, ...subjectOptions]}
            />
            <div className="flex justify-end gap-2 mt-2">
               <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
               <Button size="sm" onClick={handleAdd} disabled={!title.trim() || !dueDate}>Save Task</Button>
            </div>
          </div>
        )}

        {pendingTasks.length === 0 && !isAdding ? (
          <div className="text-center py-6">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">You have no upcoming tasks!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map(task => {
              const subject = subjects.find(s => s.id === task.subjectId);
              const days = getDaysUntil(task.dueDate);
              const isUrgent = days === 'Today' || days === 'Tomorrow' || days === 'Overdue';

              return (
                <div key={task.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-700">
                  <button onClick={() => toggleTask(task)} className="mt-0.5 text-slate-500 hover:text-green-400 transition-colors">
                    <Circle className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                      <Badge variant={task.type === 'exam' ? 'danger' : 'default'} className="text-[10px] py-0 px-1.5 h-5">
                        {task.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className={`text-xs ${isUrgent ? 'text-red-400 font-medium' : 'text-slate-500'}`}>
                        {days}
                      </span>
                      {subject && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: subject.color || '#fff'}} />
                          {subject.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="mt-6">
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Completed</p>
             <div className="space-y-1">
               {completedTasks.slice(0, 5).map(task => (
                 <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg opacity-60">
                   <button onClick={() => toggleTask(task)} className="text-green-500 hover:text-slate-500 transition-colors">
                     <CheckCircle2 className="w-4 h-4" />
                   </button>
                   <p className="text-sm text-slate-400 line-through truncate">{task.title}</p>
                   <button onClick={() => deleteTask(task.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400">
                      Delete
                   </button>
                 </div>
               ))}
             </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
