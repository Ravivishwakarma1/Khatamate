'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signUpWithEmail } from '@/lib/firebase/auth';
import { formatAuthError } from '@/lib/firebase/errorHelper';
import { useAuth } from '@/components/auth/AuthProvider';

import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

import { useToast } from '@/components/ui/Toast';
import { BookOpen, UserPlus } from 'lucide-react';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const toast = useToast();
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [user, router, locale]);

  const handleRegister = async (e: React.FormEvent) => {


    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email, password, fullName);
      toast.success('Account created with Firebase!');
      router.push(`/${locale}/onboarding`);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {


      setLoading(false);
    }
  };


  return (
    <div>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon} style={{ background: 'var(--gradient-accent)', color: '#0F0A1E' }}>
          <BookOpen size={28} />
        </div>
        <h1 className={styles.brandTitle}>Create Account</h1>
        <p className={styles.brandSub}>
          Start managing your shop ledger digitally
        </p>
      </div>

      {errorMsg && (
        <div className={styles.errorBox}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label className="input-label">Full Name</label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="Ramesh Kumar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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
          <label className="input-label">Password</label>
          <input
            type="password"
            required
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Confirm Password</label>
          <input
            type="password"
            required
            className="input-field"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', marginTop: '8px' }}>
          {loading ? 'Creating Account...' : 'Sign Up Free'}
          {!loading && <UserPlus size={18} />}
        </button>
      </form>

      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>OR</span>
        <div className={styles.dividerLine} />
      </div>

      <GoogleSignInButton />

      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link href={`/${locale}/login`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
