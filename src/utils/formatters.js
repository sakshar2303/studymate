export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeDate = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
};

export const getDayName = (date) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
};

export const getWeekDays = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
};

export const groupByDay = (sessions) => {
  const grouped = {};
  sessions.forEach(s => {
    const day = new Date(s.createdAt?.seconds ? s.createdAt.seconds * 1000 : s.createdAt).toDateString();
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(s);
  });
  return grouped;
};

export const getStreak = (sessions) => {
  if (!sessions.length) return 0;
  const sorted = [...sessions].sort((a, b) => {
    const da = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
    const db = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
    return db - da;
  });

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sorted) {
    const sessionDate = new Date(session.createdAt?.seconds ? session.createdAt.seconds * 1000 : session.createdAt);
    sessionDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
    if (diff === streak || diff === streak + 1) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }
  return streak;
};

export const getSubjectColor = (index) => {
  const colors = [
    'bg-amber-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-indigo-500',
  ];
  return colors[index % colors.length];
};

export const getSubjectIcon = (index) => {
  const icons = ['Book', 'Calculator', 'Atom', 'Palette', 'Music', 'Globe', 'Code', 'Flask'];
  return icons[index % icons.length];
};
