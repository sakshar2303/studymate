import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { TimerProvider } from './context/TimerContext';
import { Navbar, ProtectedRoute } from './components/layout';
import { LoadingSpinner } from './components/ui';
import { ROUTES } from './utils/constants';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Subjects = lazy(() => import('./pages/Subjects'));
const StudySession = lazy(() => import('./pages/StudySession'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Settings = lazy(() => import('./pages/Settings'));

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
                    <div className="min-h-screen bg-slate-900">
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
                            <Route path={ROUTES.SETTINGS} element={<Settings />} />
                            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                          </Routes>
                        </Suspense>
                      </main>
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
