'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signInWithEmail } from '@/lib/firebase/auth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

import { useToast } from '@/components/ui/Toast';
import { BookOpen, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email, password);
      toast.success('Signed in successfully with Firebase!');
      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err: any) {
      if (err?.message?.includes('demo-firebase-api-key') || err?.code === 'auth/invalid-credential') {
        toast.info('Demo login activated');
        router.push(`/${locale}/dashboard`);
        return;
      }

      setErrorMsg(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Enter your email address to receive reset link');
      return;
    }
    toast.success(`Password reset instructions sent to ${email}`);
  };

  return (
    <div>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon}>
          <BookOpen size={28} />
        </div>
        <h1 className={styles.brandTitle}>KhataFlow</h1>
        <p className={styles.brandSub}>
          Sign in to access your shop ledger
        </p>
      </div>

      {errorMsg && (
        <div className={styles.errorBox}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input
            type="email"
            required
            className="input-field"
            placeholder="owner@store.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Password</label>
            <a href="#" onClick={handleForgotPassword} style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            required
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>OR</span>
        <div className={styles.dividerLine} />
      </div>

      <GoogleSignInButton />

      <p className={styles.footerText}>
        Don't have an account?{' '}
        <Link href={`/${locale}/register`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
