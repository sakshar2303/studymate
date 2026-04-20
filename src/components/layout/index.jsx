import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { BookOpen, BarChart2, Users, Play, Settings, LogOut, Zap, GraduationCap } from 'lucide-react';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: BookOpen },
  { to: ROUTES.SUBJECTS, label: 'Subjects', icon: Users },
  { to: ROUTES.STUDY_SESSION, label: 'Study', icon: Play },
  { to: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart2 },
  { to: ROUTES.QUIZZES, label: 'Quizzes', icon: Zap },
  { to: ROUTES.AI_ASSISTANT, label: 'AI Helper', icon: GraduationCap },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function Navbar() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-lg font-bold text-white">StudyMate</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.slice(0, 5).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user?.displayName || (user?.email?.split('@')[0]) || 'Student'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Sidebar() {
  return (
    <div className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-slate-800 min-h-screen sticky top-0">
      <div className="flex flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    navigate(ROUTES.LOGIN, { replace: true });
    return null;
  }

  return children;
}
