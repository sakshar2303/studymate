import { AIChat } from '../components/ai/AIChat';

export function AIAssistant() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">AI Study Assistant</h1>
        <p className="text-slate-400 text-sm mt-1">Ask anything, get instant help</p>
      </div>
      <AIChat />
    </div>
  );
}
