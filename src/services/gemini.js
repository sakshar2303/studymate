// Groq API — free, fast, generous quota using Llama models
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const AI_MODEL = 'llama-3.3-70b-versatile';

if (!GROQ_KEY) {
  console.warn('VITE_GROQ_API_KEY is missing — AI features will use Demo Mode.');
}

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

// ─── Core API call (OpenAI-compatible format) ───────────────────────────

async function callGroq(messages, sysPrompt = systemInstruction) {
  if (!GROQ_KEY) return null;

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: sysPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ─── Demo Mode Fallback Data ────────────────────────────────────────────

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

// ─── Exported Functions ─────────────────────────────────────────────────

export const generateQuizQuestions = async (subject, topic, count = 5) => {
  try {
    const messages = [{ role: 'user', content: `Generate ${count} multiple choice quiz questions about "${topic}" in ${subject}.
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

Only output valid JSON, no markdown blocks or extra text. Start directly with [.` }];

    const text = await callGroq(messages);
    if (!text) return demoQuizzes(subject, topic, count);
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse quiz response');
  } catch (err) {
    console.warn('⚠️ AI API failed, falling back to Demo Mode:', err.message);
    return demoQuizzes(subject, topic, count);
  }
};

export const generateFlashcards = async (subject, topic, count = 5) => {
  try {
    const messages = [{ role: 'user', content: `Generate ${count} flashcards about "${topic}" in ${subject}.
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

Only output valid JSON, no markdown blocks or extra text. Start directly with [.` }];

    const text = await callGroq(messages);
    if (!text) return demoFlashcards(subject, topic, count);
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse flashcards response');
  } catch (err) {
    console.warn('⚠️ AI API failed, falling back to Demo Mode:', err.message);
    return demoFlashcards(subject, topic, count);
  }
};

export const askAI = async (messages) => {
  try {
    const formatted = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
    const text = await callGroq(formatted, tutorPrompt);
    if (!text) return "👋 Hi! I'm StudyMate's AI Tutor running in **Demo Mode**. To enable live AI tutoring, add a valid `VITE_GROQ_API_KEY` in your environment variables.";
    return text;
  } catch (err) {
    console.warn('⚠️ AI API failed for chat:', err.message);
    return "I'm having trouble connecting to the AI service right now. Please try again in a moment! 🔄";
  }
};

export const generateStudyInsights = async (subjects, sessions) => {
  if (sessions.length === 0) {
    return 'Start tracking your study sessions to get personalized insights!';
  }

  try {
    const subjectSummary = subjects.map(s => ({
      name: s.name,
      totalHours: s.totalHours || 0,
      goalHours: s.goalHours || 10,
    }));
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const avgPerDay = totalHours / 7;

    const messages = [{ role: 'user', content: `Analyze this student's study data and provide 3-4 actionable insights:

Subjects: ${JSON.stringify(subjectSummary)}
Total hours tracked: ${totalHours.toFixed(1)}
Average per day: ${avgPerDay.toFixed(1)} hours
Total sessions: ${sessions.length}

Provide insights about:
1. Balance across subjects (are any neglected?)
2. Study intensity recommendation
3. Best subject to improve
4. One specific actionable tip

Be encouraging but honest. Keep it concise (2-3 sentences per insight).` }];

    const text = await callGroq(messages);
    if (!text) return `📊 You have ${subjects.length} subject(s) and ${sessions.length} session(s) logged. Keep up the great work!`;
    return text;
  } catch (err) {
    console.warn('⚠️ AI API failed for insights:', err.message);
    return `📊 You have ${subjects.length} subject(s) and ${sessions.length} session(s) logged. Keep building consistent study habits!`;
  }
};
