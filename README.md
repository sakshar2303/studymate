# StudyMate

AI-powered study companion that helps students track study sessions, manage subjects, use a Pomodoro timer, generate AI quizzes and flashcards, get personalized study insights, and chat with an AI assistant.

## Problem Statement

Students struggle with maintaining consistent study habits, lack personalized recommendations, and don't know their optimal study patterns. StudyMate solves this with an all-in-one AI-driven study companion.

## Features

- **Pomodoro Timer** — Customizable focus/break sessions with audio notifications
- **Subject Management** — CRUD for subjects with color coding and goal tracking
- **Study Session Tracking** — Log sessions with automatic time tracking per subject
- **Progress Analytics** — Weekly bar charts, subject breakdown pie charts (Recharts)
- **AI Quiz Generator** — Generate multiple-choice questions on any topic via Claude
- **AI Flashcards** — Create flip-style flashcards with AI
- **AI Study Insights** — Personalized behavioral recommendations based on your data
- **AI Chat Assistant** — Conversational AI for study help
- **Firebase Auth** — Email/password + Google sign-in
- **Persistent Storage** — All data stored in Firestore

## Tech Stack

- **React 18** (Vite)
- **React Router v6** (routing with lazy loading)
- **Context API + useReducer** (global state)
- **Firebase** (Auth + Firestore)
- **Tailwind CSS** (styling)
- **@anthropic-ai/sdk** (Claude API)
- **Recharts** (charts)
- **Lucide React** (icons)

## Project Structure

```
/src
  /components
    /ui          Button, Card, Input, Modal, ProgressBar, etc.
    /layout      Navbar, Sidebar, ProtectedRoute
    /timer       PomodoroTimer, TimerSettings
    /analytics   InsightCard, StudyChart, SubjectPieChart
    /ai          AIQuizGenerator, AIChat, AIInsights
  /pages
    Dashboard, Subjects, StudySession, Analytics,
    Quizzes, AIAssistant, Settings, Login, Signup
  /context
    AuthContext, StudyContext, TimerContext
  /services
    firebase.js  (Firestore CRUD)
    claude.js    (Anthropic AI API)
  /utils
    formatters.js
    constants.js
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** (Email/Password + Google providers)
4. Enable **Firestore Database** in your region
5. Copy your Firebase app config and replace the placeholder values in `src/services/firebase.js`
6. Set Firestore rules for authenticated access only:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{collection}/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Configure Claude AI

1. Get an API key from [Anthropic Console](https://console.anthropic.com)
2. Create a `.env` file in the project root:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

### 4. Run the App

```bash
npm run dev
```

## React Requirements Coverage

| Concept | Implementation |
|---|---|
| Functional Components | All components are FC |
| Props & Composition | UI components composed in pages |
| useState | Local component state everywhere |
| useEffect | Timer ticks, data fetching, auto-scroll in chat |
| Conditional Rendering | Loading states, auth guards |
| Lists & Keys | Subject list, session history, flashcard review |
| Lifting State Up | TimerContext lifts timer state |
| Controlled Components | All forms with state-driven inputs |
| React Router | All pages with nested routes + protected routes |
| Context API | AuthContext, StudyContext, TimerContext |
| useMemo | Computed stats in InsightCard, StudyChart, Analytics |
| useCallback | Event handlers in AIQuizGenerator, AIChat |
| useRef | Chat scroll, timer display |
| Lazy Loading | React.lazy + Suspense for all page components |

## Evaluation Rubric Coverage

- Problem Statement & Idea — 15 marks (real-world problem, clear users)
- React Fundamentals — 20 marks (all compulsory concepts covered)
- Advanced React Usage — 15 marks (useMemo, useCallback, lazy loading, Context, useRef)
- Backend Integration — 15 marks (Firebase Auth + Firestore CRUD)
- UI/UX — 10 marks (Tailwind, responsive, consistent design, loading states)
- Code Quality — 10 marks (proper folder structure, separation of concerns)
- Functionality — 10 marks (all features working end-to-end)
- Demo & Explanation — 5 marks (be ready to explain your code)

## Build for Production

```bash
npm run build
```
