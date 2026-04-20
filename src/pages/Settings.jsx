import { TimerSettings } from '../components/timer/TimerSettings';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardBody, Button } from '../components/ui';
import { User, LogOut, Bell } from 'lucide-react';

export function Settings() {
  const { user, signout } = useAuth();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Customize your study experience</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Profile</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 text-xl font-bold">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-medium text-white">{user?.displayName || 'Student'}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Timer Settings */}
      <TimerSettings />

      {/* Notifications placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-400">Timer notifications are enabled by default. Audio plays when sessions end.</p>
        </CardBody>
      </Card>

      {/* Logout */}
      <Card>
        <CardBody>
          <Button variant="danger" onClick={signout} className="w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
