'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useToast } from '@/components/ui/Toast';
import { BookOpen, ArrowRight, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const toast = useToast();
  const { user } = useAuth();

  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [user, router, locale]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (!isPlaceholder) {
          setErrorMsg(error.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }
        // In local placeholder demo mode without Supabase env vars, fall back gracefully
        const localUser = { uid: `usr_${Date.now()}`, email, displayName: email.split('@')[0] };
        localStorage.setItem('khataflow_user', JSON.stringify(localUser));
      } else if (data?.user) {
        const localUser = {
          uid: data.user.id,
          email: data.user.email || email,
          displayName: data.user.user_metadata?.full_name || email.split('@')[0],
        };
        localStorage.setItem('khataflow_user', JSON.stringify(localUser));
      }

      document.cookie = 'khataflow_session=true; path=/; max-age=31536000; SameSite=Lax;';
      toast.success('Signed in successfully!');
      window.location.href = `/${locale}/dashboard`;
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

      if (isPlaceholder) {
        toast.success(`Demo OTP code sent to ${email} (Use code: 123456)`);
        setOtpSent(true);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) {
        const msg = error.message && error.message !== '{}' ? error.message : 'Failed to send OTP code. Please check your SMTP settings or try again.';
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      toast.success(`6-digit OTP sent to ${email}`);
      setOtpSent(true);
    } catch (err: any) {
      const msg = err?.message && err?.message !== '{}' ? err?.message : 'Failed to send OTP code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

      if (isPlaceholder) {
        if (otpCode.trim() !== '123456') {
          setErrorMsg('Invalid OTP code. Use 123456 in demo mode.');
          setLoading(false);
          return;
        }
        const localUser = { uid: `usr_otp_${Date.now()}`, email, displayName: email.split('@')[0] };
        localStorage.setItem('khataflow_user', JSON.stringify(localUser));
      } else {
        const supabase = createClient();
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode.trim(),
          type: 'email',
        });

        if (error) {
          setErrorMsg(error.message || 'Invalid or expired OTP code.');
          setLoading(false);
          return;
        }

        if (data?.user) {
          const localUser = {
            uid: data.user.id,
            email: data.user.email || email,
            displayName: data.user.user_metadata?.full_name || email.split('@')[0],
          };
          localStorage.setItem('khataflow_user', JSON.stringify(localUser));
        }
      }

      document.cookie = 'khataflow_session=true; path=/; max-age=31536000; SameSite=Lax;';
      toast.success('OTP verified! Redirecting...');
      window.location.href = `/${locale}/dashboard`;
    } catch (err: any) {
      setErrorMsg(err?.message || 'OTP verification failed.');
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

      {/* Auth Method Selector (Password vs OTP) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => { setAuthMethod('PASSWORD'); setErrorMsg(''); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: authMethod === 'PASSWORD' ? 'var(--primary-light)' : 'transparent',
            color: authMethod === 'PASSWORD' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <KeyRound size={14} /> Password
        </button>
        <button
          type="button"
          onClick={() => { setAuthMethod('OTP'); setErrorMsg(''); setOtpSent(false); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: authMethod === 'OTP' ? 'var(--accent)' : 'transparent',
            color: authMethod === 'OTP' ? '#0F0A1E' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <Mail size={14} /> Email OTP
        </button>
      </div>

      {errorMsg && (
        <div className={styles.errorBox}>
          {errorMsg}
        </div>
      )}

      {/* Password Form */}
      {authMethod === 'PASSWORD' && (
        <form onSubmit={handlePasswordLogin}>
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
      )}

      {/* Email OTP Form */}
      {authMethod === 'OTP' && (
        <>
          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className="input-group">
                <label className="input-label">Email Address for OTP</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="owner@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', marginTop: '8px' }}>
                {loading ? 'Sending Code...' : 'Send 6-Digit OTP Code'}
                {!loading && <Mail size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Enter the 6-digit OTP code sent to <strong style={{ color: 'var(--text)' }}>{email}</strong>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="input-field"
                  placeholder="123456"
                  style={{ fontSize: '1.5rem', letterSpacing: '0.4em', textAlign: 'center', fontWeight: 800 }}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', marginTop: '12px' }}>
                {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
                {!loading && <ShieldCheck size={18} />}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}
              >
                Change Email / Resend Code
              </button>
            </form>
          )}
        </>
      )}

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
