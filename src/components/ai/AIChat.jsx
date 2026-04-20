import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addChatSession, getChatSessions, updateChatSession } from '../../services/firebase';
import { askAI } from '../../services/claude';
import { Card, CardHeader, CardBody, Button, LoadingSpinner } from '../ui';
import { GraduationCap, Send, Trash2 } from 'lucide-react';

export function AIChat() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const history = await getChatSessions(user.uid);
      setSessions(history);
    } catch (e) {
      console.error('Failed to load chat history:', e);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleNewChat = async () => {
    const id = await addChatSession(user.uid);
    setCurrentSessionId(id);
    setCurrentMessages([]);
    await loadHistory();
  };

  const handleSend = async () => {
    if (!input.trim() || !currentSessionId) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...currentMessages, userMsg];
    setCurrentMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await askAI(newMessages);
      const aiMsg = { role: 'assistant', content: aiResponse };
      const allMessages = [...newMessages, aiMsg];
      setCurrentMessages(allMessages);
      await updateChatSession(user.uid, currentSessionId, allMessages);
    } catch (e) {
      const errorMsg = { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." };
      setCurrentMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col" style={{ minHeight: '500px' }}>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">AI Study Assistant</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={handleNewChat}>
          + New Chat
        </Button>
      </CardHeader>
      <CardBody className="flex-1 flex flex-col p-0">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="text-center text-sm text-slate-500 py-8">
            <p>Ask any study question — concepts, explanations, examples, or memory tricks.</p>
          </div>
          {currentMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700 text-slate-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="bg-slate-700 rounded-xl px-4 py-3">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a study question..."
              rows={1}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading} size="md">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
