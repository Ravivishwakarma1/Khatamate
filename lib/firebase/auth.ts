import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './config';

export function setAuthCookie(identifier: string) {
  if (typeof window !== 'undefined') {
    // 30 days session persistence cookie for Next.js middleware
    document.cookie = `khataflow_session=${encodeURIComponent(identifier)}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

export function clearAuthCookie() {
  if (typeof window !== 'undefined') {
    document.cookie = `khataflow_session=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function getAuthCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )khataflow_session=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  const user = userCredential.user;
  setAuthCookie(user.email || user.uid);
  if (typeof window !== 'undefined') {
    localStorage.setItem('khataflow_user', JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName || displayName }));
  }
  return user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  setAuthCookie(user.email || user.uid);
  if (typeof window !== 'undefined') {
    localStorage.setItem('khataflow_user', JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName }));
  }
  return user;
}

export async function signInWithGoogle(): Promise<User> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;
  setAuthCookie(user.email || user.uid);
  if (typeof window !== 'undefined') {
    localStorage.setItem('khataflow_user', JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName }));
  }
  return user;
}

export async function signOutUser(): Promise<void> {
  clearAuthCookie();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('khataflow_user');
  }
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('SignOut error:', err);
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      setAuthCookie(user.email || user.uid);
      if (typeof window !== 'undefined') {
        localStorage.setItem('khataflow_user', JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName }));
      }
    }
    callback(user);
  });
}

