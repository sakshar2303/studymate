import { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card, CardHeader, CardBody, Select, Badge } from '../components/ui';
import { Book, Bold, Italic, List, ListOrdered, Quote, Heading2, Code } from 'lucide-react';
import { updateSubject } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-700 p-2 bg-slate-800/80 rounded-t-xl">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-700 transition-colors ${editor.isActive('bold') ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}>
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-700 transition-colors ${editor.isActive('italic') ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}>
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-slate-700 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-700 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}>
        <Heading2 className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-700 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}>
        <List className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-slate-700 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}>
        <ListOrdered className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-slate-700 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}>
        <Quote className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-2 rounded hover:bg-slate-700 transition-colors ${editor.isActive('codeBlock') ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}>
        <Code className="w-4 h-4" />
      </button>
    </div>
  );
};

export function Notes() {
  const { user } = useAuth();
  const { subjects, updateSubject: ctxUpdateSubject } = useStudy();
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  const editor = useEditor({
    extensions: [StarterKit],
    content: selectedSubject?.notes || '<p>Select a subject to start typing...</p>',
    editable: !!selectedSubject,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-amber max-w-none focus:outline-none min-h-[400px] p-6 bg-slate-800/30 rounded-b-xl',
      },
    },
    onUpdate: ({ editor }) => {
      if (selectedSubject && user) {
        const html = editor.getHTML();
        // Debounce this in a real app, keeping it simple here
        updateSubject(user.uid, selectedSubject.id, { notes: html });
        ctxUpdateSubject(selectedSubject.id, { notes: html });
      }
    },
  });

  useEffect(() => {
    if (editor && selectedSubject) {
      if (editor.getHTML() !== selectedSubject.notes) {
        editor.commands.setContent(selectedSubject.notes || '<p></p>');
      }
    } else if (editor) {
        editor.commands.setContent('<p>Select a subject to start typing...</p>');
    }
  }, [selectedSubjectId, editor]); // Removing selectedSubject.notes from deps to avoid jumpy cursor

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">Study Notes</h1>
        <p className="text-slate-400 text-sm mt-1">Slash-command rich text editor linked to your subjects</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-3">
             <Book className="w-5 h-5 text-amber-500" />
             <h2 className="font-semibold text-white">Workspace</h2>
             {selectedSubject && <Badge variant="amber">{selectedSubject.name}</Badge>}
          </div>
          <div className="w-64">
            <Select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              options={[{ value: '', label: 'Select subject...' }, ...subjectOptions]}
            />
          </div>
        </CardHeader>
        <CardBody className="p-0 border border-t-0 border-slate-700 rounded-b-xl bg-slate-900/50">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </CardBody>
      </Card>
    </motion.div>
  );
}
