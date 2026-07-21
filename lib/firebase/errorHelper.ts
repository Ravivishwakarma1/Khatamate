export function formatAuthError(err: any): string {
  if (!err) return 'Authentication failed. Please try again.';

  const code = err.code || '';
  const message = err.message || '';

  if (message.includes('demo-firebase-api-key') || code === 'auth/invalid-api-key') {
    return 'Firebase API keys are missing in Vercel. Please add NEXT_PUBLIC_FIREBASE_* environment variables and redeploy.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Domain not authorized! In Firebase Console, go to Authentication > Settings > Authorized domains and add your Vercel URL.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in method is disabled in Firebase. Enable Email/Password or Google in Firebase Console > Authentication > Sign-in method.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completing.';
  }

  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Invalid email or password. Please check your credentials or create an account.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  return message || 'Authentication error. Please try again.';
}
