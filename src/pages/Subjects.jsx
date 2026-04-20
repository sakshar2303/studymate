import { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Card, CardHeader, CardBody, Button, Input, Select, Modal, EmptyState, Badge } from '../components/ui';
import { SUBJECT_COLORS, SUBJECT_ICONS } from '../utils/constants';
import { formatDuration } from '../utils/formatters';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';

export function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useStudy();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#f59e0b', icon: 'BookOpen', goalHours: '' });
  const [deletingId, setDeletingId] = useState(null);

  const colorOptions = SUBJECT_COLORS.map(c => ({ value: c.value, label: c.name }));
  const iconOptions = SUBJECT_ICONS.map(i => ({ value: i.icon, label: i.name }));

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', color: '#f59e0b', icon: 'BookOpen', goalHours: '' });
    setModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setForm({
      name: subject.name,
      color: subject.color || '#f59e0b',
      icon: subject.icon || 'BookOpen',
      goalHours: subject.goalHours || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(),
      color: form.color,
      icon: form.icon,
      goalHours: form.goalHours ? Number(form.goalHours) : 0,
    };
    if (editing) {
      await updateSubject(editing.id, data);
    } else {
      await addSubject(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteSubject(id);
    setDeletingId(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subjects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your study subjects</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="No subjects yet"
          description="Add subjects to organize your study sessions and track progress"
          action={<Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Your First Subject</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <Card key={subject.id}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${subject.color || '#f59e0b'}20` }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color: subject.color || '#f59e0b' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{subject.name}</h3>
                      <p className="text-xs text-slate-400">{formatDuration((subject.totalHours || 0) * 60)} logged</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(subject)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeletingId(subject.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {subject.goalHours > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(((subject.totalHours || 0) / subject.goalHours) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((subject.totalHours || 0) / subject.goalHours) * 100)}%`,
                          backgroundColor: subject.color || '#f59e0b',
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Goal: {subject.goalHours}h</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Mathematics"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Color"
              value={form.color}
              onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
              options={colorOptions}
            />
            <Input
              label="Goal (hours)"
              type="number"
              min="0"
              placeholder="Optional"
              value={form.goalHours}
              onChange={(e) => setForm(f => ({ ...f, goalHours: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">{editing ? 'Save Changes' : 'Add Subject'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Subject">
        <p className="text-slate-300 mb-4">Are you sure you want to delete this subject? Study sessions will be kept.</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setDeletingId(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deletingId)} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
