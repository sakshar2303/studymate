import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_KEY) {
  console.error('CRITICAL: VITE_GEMINI_API_KEY is missing from environment variables!');
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY || 'MISSING_KEY');
const AI_MODEL = 'gemini-1.5-flash';

const systemInstruction = `You are StudyMate AI, a helpful study assistant for students. You help with:
- Generating quiz questions and flashcards from any subject/topic
- Explaining complex concepts in simple terms
- Providing examples, mnemonics, and memory tricks
- Analyzing study patterns and giving recommendations
- Answering subject-specific questions

Be concise, encouraging, and focused. Use simple language suitable for students.`;

const tutorPrompt = `You are StudyMate's Socratic AI Tutor. Your ultimate goal is not to just give students the answers, but to help them reach the answer themselves!
- When a student asks a question about a concept, give a VERY BRIEF explanation (1-2 sentences).
- THEN, immediately ask them a follow-up question to test their understanding of what you just said.
- If they get it wrong, gently correct them and give a hint.
- If they get it right, praise them and push them one step further with a slightly harder scenario.

Never write long essays. Keep your interactions highly conversational back-and-forth chat. Always end your message with a question back to the student!`;

// Helper function to get the model with standard instructions
const getModel = (instruction = systemInstruction) => {
  return genAI.getGenerativeModel({
    model: AI_MODEL,
    systemInstruction: instruction,
  });
};

export const generateQuizQuestions = async (subject, topic, count = 5) => {
  const model = getModel();
  const prompt = `Generate ${count} multiple choice quiz questions about "${topic}" in ${subject}.
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

Only output valid JSON, no markdown blocks or extra text. Start directly with [.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    return JSON.parse(match[0]);
  }
  throw new Error('Failed to parse quiz questions from AI response');
};

export const generateFlashcards = async (subject, topic, count = 5) => {
  const model = getModel();
  const prompt = `Generate ${count} flashcards about "${topic}" in ${subject}.
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

Only output valid JSON, no markdown blocks or extra text. Start directly with [.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    return JSON.parse(match[0]);
  }
  throw new Error('Failed to parse flashcards from AI response');
};

export const askAI = async (messages) => {
  const model = getModel(tutorPrompt);
  
  // Gemini requires mapping standard role names to "user" and "model"
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
  
  const lastMessage = messages[messages.length - 1].content;
  
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  
  return result.response.text();
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

  const model = getModel();
  const prompt = `Analyze this student's study data and provide 3-4 actionable insights:

Subjects: ${JSON.stringify(subjectSummary)}
Total hours tracked: ${totalHours.toFixed(1)}
Average per day: ${avgPerDay.toFixed(1)} hours
Total sessions: ${sessions.length}

Provide insights about:
1. Balance across subjects (are any neglected?)
2. Study intensity recommendation
3. Best subject to improve
4. One specific actionable tip

Be encouraging but honest. Keep it concise (2-3 sentences per insight).`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
