import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  await setUserDocument(userCredential.user);
  return userCredential.user;
};

export const loginWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  await setUserDocument(result.user);
  return result.user;
};

export const logout = async () => signOut(auth);

export const getCurrentUser = () => auth.currentUser;

export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);

// User document
const setUserDocument = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await addDoc(collection(db, 'users', user.uid, 'metadata'), {
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
      settings: {
        pomodoroWork: 25,
        pomodoroBreak: 5,
        pomodoroLong: 15,
        sessionsBeforeLong: 4,
      },
    });
  }
};

export const getUserMetadata = async (uid) => {
  const q = query(collection(db, 'users', uid, 'metadata'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// Subjects CRUD
export const addSubject = async (uid, subject) => {
  const ref = await addDoc(collection(db, 'users', uid, 'subjects'), {
    ...subject,
    totalHours: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getSubjects = async (uid) => {
  const q = query(collection(db, 'users', uid, 'subjects'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateSubject = async (uid, subjectId, data) => {
  await updateDoc(doc(db, 'users', uid, 'subjects', subjectId), data);
};

export const deleteSubject = async (uid, subjectId) => {
  await deleteDoc(doc(db, 'users', uid, 'subjects', subjectId));
};

// Sessions CRUD
export const addSession = async (uid, session) => {
  const ref = await addDoc(collection(db, 'users', uid, 'sessions'), {
    ...session,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getSessions = async (uid, limit = 100) => {
  const q = query(
    collection(db, 'users', uid, 'sessions'),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getSessionsBySubject = async (uid, subjectId) => {
  const q = query(
    collection(db, 'users', uid, 'sessions'),
    where('subjectId', '==', subjectId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Quizzes CRUD
export const addQuiz = async (uid, quiz) => {
  const ref = await addDoc(collection(db, 'users', uid, 'quizzes'), {
    ...quiz,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getQuizzes = async (uid) => {
  const q = query(collection(db, 'users', uid, 'quizzes'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteQuiz = async (uid, quizId) => {
  await deleteDoc(doc(db, 'users', uid, 'quizzes', quizId));
};

// Flashcards CRUD
export const addFlashcard = async (uid, card) => {
  const ref = await addDoc(collection(db, 'users', uid, 'flashcards'), {
    ...card,
    createdAt: serverTimestamp(),
    nextReview: new Date().toISOString(),
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0
  });
  return ref.id;
};

export const addFlashcards = async (uid, cards) => {
  const ids = [];
  for (const card of cards) {
    const id = await addFlashcard(uid, card);
    ids.push(id);
  }
  return ids;
};

export const getFlashcards = async (uid, subjectId) => {
  const q = subjectId
    ? query(collection(db, 'users', uid, 'flashcards'), where('subjectId', '==', subjectId))
    : query(collection(db, 'users', uid, 'flashcards'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteFlashcard = async (uid, cardId) => {
  await deleteDoc(doc(db, 'users', uid, 'flashcards', cardId));
};

export const updateFlashcard = async (uid, cardId, data) => {
  await updateDoc(doc(db, 'users', uid, 'flashcards', cardId), data);
};

// Chat History CRUD
export const addChatSession = async (uid) => {
  const ref = await addDoc(collection(db, 'users', uid, 'chatHistory'), {
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getChatSessions = async (uid) => {
  const q = query(collection(db, 'users', uid, 'chatHistory'), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateChatSession = async (uid, chatId, messages) => {
  await updateDoc(doc(db, 'users', uid, 'chatHistory', chatId), {
    messages,
    updatedAt: serverTimestamp(),
  });
};

export const deleteChatSession = async (uid, chatId) => {
  await deleteDoc(doc(db, 'users', uid, 'chatHistory', chatId));
};

// Tasks and Exams CRUD
export const addTask = async (uid, task) => {
  const ref = await addDoc(collection(db, 'users', uid, 'tasks'), {
    ...task,
    completed: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getTasks = async (uid) => {
  const q = query(collection(db, 'users', uid, 'tasks'), orderBy('dueDate', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateTask = async (uid, taskId, data) => {
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), data);
};

export const deleteTask = async (uid, taskId) => {
  await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
};

export default app;
