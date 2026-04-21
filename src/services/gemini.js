import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_KEY) {
  console.warn('VITE_GEMINI_API_KEY is missing — AI features will use Demo Mode.');
}

const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const AI_MODEL = 'gemini-2.0-flash';

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
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: AI_MODEL,
    systemInstruction: instruction,
  });
};

// ─── Demo Mode Fallback Data ─────────────────────────────────────────────

const demoQuizzes = (subject, topic, count) => {
  const templates = [
    { question: `What is the primary purpose of ${topic} in ${subject}?`, options: ["A: To simplify complex operations", "B: To increase system overhead", "C: To reduce code readability", "D: To eliminate all errors"], correctAnswer: "A", explanation: `${topic} is primarily used to simplify complex operations and make systems more efficient in ${subject}.` },
    { question: `Which of the following best describes ${topic}?`, options: ["A: An outdated concept", "B: A fundamental principle in ${subject}", "C: A rarely used technique", "D: An optional framework"], correctAnswer: "B", explanation: `${topic} is considered a fundamental principle in ${subject} that forms the basis of many advanced concepts.` },
    { question: `When was ${topic} first introduced as a concept in ${subject}?`, options: ["A: In the early foundations of the field", "B: Only in the last decade", "C: It hasn't been formally introduced", "D: It was borrowed from an unrelated field"], correctAnswer: "A", explanation: `${topic} has been a cornerstone of ${subject} since the early development of the discipline.` },
    { question: `What is a common misconception about ${topic}?`, options: ["A: It is too complex to learn", "B: It only applies to advanced scenarios", "C: It has no practical applications", "D: All of the above are misconceptions"], correctAnswer: "D", explanation: `All of these are common misconceptions. ${topic} is approachable, widely applicable, and extremely practical in ${subject}.` },
    { question: `How does ${topic} relate to other concepts in ${subject}?`, options: ["A: It is completely independent", "B: It builds upon and connects to many core ideas", "C: It contradicts most other principles", "D: It is only relevant in theory"], correctAnswer: "B", explanation: `${topic} is deeply interconnected with other core concepts in ${subject}, building upon foundational ideas to create a comprehensive understanding.` },
  ];
  return templates.slice(0, count);
};

const demoFlashcards = (subject, topic, count) => {
  const templates = [
    { front: `Define ${topic} in the context of ${subject}.`, back: `${topic} is a key concept in ${subject} that refers to the systematic approach of organizing and applying core principles to solve problems effectively.` },
    { front: `What are the 3 main benefits of understanding ${topic}?`, back: `1) Deeper comprehension of ${subject} fundamentals. 2) Ability to apply knowledge to real-world scenarios. 3) Foundation for learning advanced topics.` },
    { front: `Give a real-world example of ${topic}.`, back: `A practical example of ${topic} in ${subject} is how it's used to structure solutions, similar to how an architect uses blueprints to design buildings systematically.` },
    { front: `What is the relationship between ${topic} and problem-solving?`, back: `${topic} provides a framework for breaking down complex problems in ${subject} into smaller, manageable components that can be addressed individually.` },
    { front: `Name one common mistake students make with ${topic}.`, back: `A common mistake is memorizing ${topic} definitions without understanding the underlying principles. Focus on understanding the "why" behind the concept.` },
  ];
  return templates.slice(0, count);
};

// ─── Exported Functions (with automatic Demo Mode fallback) ──────────────

export const generateQuizQuestions = async (subject, topic, count = 5) => {
  const model = getModel();
  if (!model) {
    console.info('🧪 Demo Mode: Returning sample quiz questions.');
    return demoQuizzes(subject, topic, count);
  }

  try {
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
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse quiz response');
  } catch (err) {
    console.warn('⚠️ Gemini API failed, falling back to Demo Mode:', err.message);
    return demoQuizzes(subject, topic, count);
  }
};

export const generateFlashcards = async (subject, topic, count = 5) => {
  const model = getModel();
  if (!model) {
    console.info('🧪 Demo Mode: Returning sample flashcards.');
    return demoFlashcards(subject, topic, count);
  }

  try {
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
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse flashcards response');
  } catch (err) {
    console.warn('⚠️ Gemini API failed, falling back to Demo Mode:', err.message);
    return demoFlashcards(subject, topic, count);
  }
};

export const askAI = async (messages) => {
  const model = getModel(tutorPrompt);
  if (!model) {
    return "👋 Hi! I'm StudyMate's AI Tutor running in **Demo Mode**. To enable live AI tutoring, please add a valid `VITE_GEMINI_API_KEY` in your environment variables. In the meantime, feel free to explore the rest of the app!";
  }

  try {
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
  } catch (err) {
    console.warn('⚠️ Gemini API failed for chat:', err.message);
    return "I'm having trouble connecting to the AI service right now. This might be a temporary rate limit — please try again in a few seconds! 🔄";
  }
};

export const generateStudyInsights = async (subjects, sessions) => {
  if (sessions.length === 0) {
    return 'Start tracking your study sessions to get personalized insights!';
  }

  const model = getModel();
  if (!model) {
    return `📊 **Demo Insights**: You have ${subjects.length} subject(s) and ${sessions.length} session(s) logged. Keep up the great work! Try to maintain a consistent daily study habit of at least 2 hours to hit your goals.`;
  }

  try {
    const subjectSummary = subjects.map(s => ({
      name: s.name,
      totalHours: s.totalHours || 0,
      goalHours: s.goalHours || 10,
    }));

    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const avgPerDay = totalHours / 7;

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
  } catch (err) {
    console.warn('⚠️ Gemini API failed for insights:', err.message);
    return `📊 **Demo Insights**: You have ${subjects.length} subject(s) and ${sessions.length} session(s) logged. Keep building consistent study habits — even 25-minute Pomodoro sessions add up fast!`;
  }
};
