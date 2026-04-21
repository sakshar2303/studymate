import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { TimerProvider } from './context/TimerContext';
import { Navbar, ProtectedRoute } from './components/layout';
import { LoadingSpinner } from './components/ui';
import { AnimatedBackground } from './components/ui/AnimatedBackground';
import { ROUTES } from './utils/constants';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Subjects = lazy(() => import('./pages/Subjects').then(m => ({ default: m.Subjects })));
const StudySession = lazy(() => import('./pages/StudySession').then(m => ({ default: m.StudySession })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Quizzes = lazy(() => import('./pages/Quizzes').then(m => ({ default: m.Quizzes })));
const AIAssistant = lazy(() => import('./pages/AIAssistant').then(m => ({ default: m.AIAssistant })));
const Notes = lazy(() => import('./pages/Notes').then(m => ({ default: m.Notes })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudyProvider>
          <TimerProvider>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.SIGNUP} element={<Signup />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen relative" style={{ background: '#060918' }}>
                      <AnimatedBackground />
                      <div className="relative z-10">
                        <Navbar />
                        <main>
                          <Suspense fallback={
                            <div className="min-h-screen flex items-center justify-center">
                              <LoadingSpinner size="lg" />
                            </div>
                          }>
                            <Routes>
                              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                              <Route path={ROUTES.SUBJECTS} element={<Subjects />} />
                              <Route path={ROUTES.STUDY_SESSION} element={<StudySession />} />
                              <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
                              <Route path={ROUTES.QUIZZES} element={<Quizzes />} />
                              <Route path={ROUTES.AI_ASSISTANT} element={<AIAssistant />} />
                              <Route path={ROUTES.NOTES} element={<Notes />} />
                              <Route path={ROUTES.SETTINGS} element={<Settings />} />
                              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                            </Routes>
                          </Suspense>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </TimerProvider>
        </StudyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
