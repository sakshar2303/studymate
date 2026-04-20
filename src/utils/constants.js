export const SUBJECT_COLORS = [
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Indigo', value: '#6366f1' },
];

export const SUBJECT_ICONS = [
  { name: 'Book', icon: 'BookOpen' },
  { name: 'Math', icon: 'Calculator' },
  { name: 'Science', icon: 'Atom' },
  { name: 'Art', icon: 'Palette' },
  { name: 'Music', icon: 'Music' },
  { name: 'History', icon: 'Globe' },
  { name: 'Computer', icon: 'Code' },
  { name: 'Chemistry', icon: 'FlaskConical' },
];

export const DEFAULT_TIMER = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLong: 4,
};

export const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  BREAK: 'break',
  LONG_BREAK: 'long_break',
};

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/',
  SUBJECTS: '/subjects',
  STUDY_SESSION: '/study',
  ANALYTICS: '/analytics',
  AI_ASSISTANT: '/ai-assistant',
  QUIZZES: '/quizzes',
  SETTINGS: '/settings',
};

export const QUIZ_MODE = {
  QUIZ: 'quiz',
  FLASHCARD: 'flashcard',
};
