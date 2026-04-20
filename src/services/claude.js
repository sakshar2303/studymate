import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

const client = new Anthropic({
  apiKey: ANTHROPIC_KEY,
  dangerouslyAllowBrowser: true,
});

const AI_MODEL = 'claude-3-haiku-20240307';

const systemPrompt = `You are StudyMate AI, a helpful study assistant for students. You help with:
- Generating quiz questions and flashcards from any subject/topic
- Explaining complex concepts in simple terms
- Providing examples, mnemonics, and memory tricks
- Analyzing study patterns and giving recommendations
- Answering subject-specific questions

Be concise, encouraging, and focused. Use simple language suitable for students.`;

export const generateQuizQuestions = async (subject, topic, count = 5) => {
  const response = await client.messages.stream({
    model: AI_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Generate ${count} multiple choice quiz questions about "${topic}" in ${subject}.
For each question provide:
- The question text
- 4 options (A, B, C, D)
- The correct answer letter
- A brief explanation of the answer

Format as a JSON array like this:
[
  {
    "question": "What is...?",
    "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
    "correctAnswer": "B",
    "explanation": "Because..."
  }
]

Only output valid JSON, no markdown or extra text.`,
    }],
  });

  let fullText = '';
  for await (const event of response) {
    if (event.type === 'content_block_delta') {
      fullText += event.delta.text;
    }
  }

  const text = fullText.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    return JSON.parse(match[0]);
  }
  throw new Error('Failed to parse quiz questions from AI response');
};

export const generateFlashcards = async (subject, topic, count = 5) => {
  const response = await client.messages.stream({
    model: AI_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Generate ${count} flashcards about "${topic}" in ${subject}.
For each flashcard provide:
- front: The question or term (what to remember)
- back: The answer or definition (the memory hook)

Format as a JSON array:
[
  {
    "front": "What is...?",
    "back": "It is... (use a memorable explanation or example)"
  }
]

Only output valid JSON.`,
    }],
  });

  let fullText = '';
  for await (const event of response) {
    if (event.type === 'content_block_delta') {
      fullText += event.delta.text;
    }
  }

  const text = fullText.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    return JSON.parse(match[0]);
  }
  throw new Error('Failed to parse flashcards from AI response');
};

export const askAI = async (messages) => {
  const response = await client.messages.stream({
    model: AI_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  });

  let fullText = '';
  for await (const event of response) {
    if (event.type === 'content_block_delta') {
      fullText += event.delta.text;
    }
  }

  return fullText.trim();
};

export const generateStudyInsights = async (subjects, sessions) => {
  if (sessions.length === 0) {
    return 'Start tracking your study sessions to get personalized insights!';
  }

  const subjectSummary = subjects.map(s => ({
    name: s.name,
    totalHours: s.totalHours || 0,
    goalHours: s.goalHours || 10,
  }));

  const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
  const avgPerDay = totalHours / 7;

  const response = await client.messages.stream({
    model: AI_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Analyze this student's study data and provide 3-4 actionable insights:

Subjects: ${JSON.stringify(subjectSummary)}
Total hours tracked: ${totalHours.toFixed(1)}
Average per day: ${avgPerDay.toFixed(1)} hours
Total sessions: ${sessions.length}

Provide insights about:
1. Balance across subjects (are any neglected?)
2. Study intensity recommendation
3. Best subject to improve
4. One specific actionable tip

Be encouraging but honest. Keep it concise (2-3 sentences per insight).`,
    }],
  });

  let fullText = '';
  for await (const event of response) {
    if (event.type === 'content_block_delta') {
      fullText += event.delta.text;
    }
  }

  return fullText.trim();
};
