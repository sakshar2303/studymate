import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  addSubject as fbAddSubject,
  getSubjects as fbGetSubjects,
  updateSubject as fbUpdateSubject,
  deleteSubject as fbDeleteSubject,
  addSession as fbAddSession,
  getSessions as fbGetSessions,
  addTask as fbAddTask,
  getTasks as fbGetTasks,
  updateTask as fbUpdateTask,
  deleteTask as fbDeleteTask,
} from '../services/firebase';
import { useAuth } from './AuthContext';

const StudyContext = createContext(null);

const initialState = {
  subjects: [],
  sessions: [],
  tasks: [],
  loading: false,
  error: null,
};

function studyReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUBJECTS':
      return { ...state, subjects: action.payload };
    case 'ADD_SUBJECT':
      return { ...state, subjects: [action.payload, ...state.subjects] };
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.data } : s
        ),
      };
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'ADD_SESSION':
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)) };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.data } : t
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

export const StudyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(studyReducer, initialState);
  const { user } = useAuth();

  const loadSubjects = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const subjects = await fbGetSubjects(user.uid);
      dispatch({ type: 'SET_SUBJECTS', payload: subjects });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const loadSessions = useCallback(async () => {
    if (!user) return;
    try {
      const sessions = await fbGetSessions(user.uid);
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [user]);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const tasks = await fbGetTasks(user.uid);
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSubjects();
      loadSessions();
      loadTasks();
    }
  }, [user, loadSubjects, loadSessions, loadTasks]);

  const addSubject = async (subject) => {
    if (!user) return;
    const id = await fbAddSubject(user.uid, subject);
    dispatch({ type: 'ADD_SUBJECT', payload: { id, ...subject, totalHours: 0 } });
    return id;
  };

  const updateSubject = async (subjectId, data) => {
    if (!user) return;
    await fbUpdateSubject(user.uid, subjectId, data);
    dispatch({ type: 'UPDATE_SUBJECT', payload: { id: subjectId, data } });
  };

  const deleteSubject = async (subjectId) => {
    if (!user) return;
    await fbDeleteSubject(user.uid, subjectId);
    dispatch({ type: 'DELETE_SUBJECT', payload: subjectId });
  };

  const addSession = async (session) => {
    if (!user) return;
    const id = await fbAddSession(user.uid, session);
    dispatch({ type: 'ADD_SESSION', payload: { id, ...session } });

    // Update total hours on subject
    const subject = state.subjects.find(s => s.id === session.subjectId);
    if (subject) {
      const newTotal = (subject.totalHours || 0) + (session.duration || 0) / 60;
      await fbUpdateSubject(user.uid, session.subjectId, { totalHours: newTotal });
      dispatch({
        type: 'UPDATE_SUBJECT',
        payload: { id: session.subjectId, data: { totalHours: newTotal } },
      });
    }
    return id;
  };

  const addTask = async (task) => {
    if (!user) return;
    const id = await fbAddTask(user.uid, task);
    dispatch({ type: 'ADD_TASK', payload: { id, ...task, completed: false } });
    return id;
  };

  const updateTask = async (taskId, data) => {
    if (!user) return;
    await fbUpdateTask(user.uid, taskId, data);
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, data } });
  };

  const deleteTask = async (taskId) => {
    if (!user) return;
    await fbDeleteTask(user.uid, taskId);
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  return (
    <StudyContext.Provider value={{
      ...state,
      addSubject,
      updateSubject,
      deleteSubject,
      addSession,
      addTask,
      updateTask,
      deleteTask,
      loadSubjects,
      loadSessions,
      loadTasks,
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
};
