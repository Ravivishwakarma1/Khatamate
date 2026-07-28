'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useToast } from '@/components/ui/Toast';
import { BookOpen, ArrowRight, KeyRound, Mail, ShieldCheck, ExternalLink, Sparkles, X, CheckCircle2 } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const toast = useToast();
  const { user } = useAuth();

  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP' | 'MAGIC_LINK'>('PASSWORD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

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

      toast.success(`OTP code sent to ${email}`);
      setOtpSent(true);
    } catch (err: any) {
      const msg = err?.message && err?.message !== '{}' ? err?.message : 'Failed to send OTP code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
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
        toast.success(`Demo magic link sent to ${email}`);
        setMagicLinkSent(true);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to send Magic Link.');
        setLoading(false);
        return;
      }

      toast.success(`1-Click Magic Link sent to ${email}!`);
      setMagicLinkSent(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send Magic Link.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg('Please enter the OTP verification code.');
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

  const handleOpenForgotModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotEmail(email);
    setForgotSent(false);
    setForgotErrorMsg('');
    setShowForgotModal(true);
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg('');

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setForgotLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

      if (isPlaceholder) {
        setForgotSent(true);
        toast.success(`Password reset email sent to ${forgotEmail} (Demo mode)`);
        return;
      }

      const supabase = createClient();
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/${locale}/settings`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo });

      if (error) {
        setForgotErrorMsg(error.message || 'Failed to send password reset email.');
      } else {
        setForgotSent(true);
        toast.success(`Password reset instructions sent to ${forgotEmail}`);
      }
    } catch (err: any) {
      setForgotErrorMsg(err?.message || 'Failed to send password reset email.');
    } finally {
      setForgotLoading(false);
    }
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

      {/* Auth Method Selector */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
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
            padding: '8px 6px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: authMethod === 'PASSWORD' ? 'var(--primary-light)' : 'transparent',
            color: authMethod === 'PASSWORD' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
          }}
        >
          <KeyRound size={13} /> Password
        </button>
        <button
          type="button"
          onClick={() => { setAuthMethod('OTP'); setErrorMsg(''); setOtpSent(false); }}
          style={{
            flex: 1,
            padding: '8px 6px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: authMethod === 'OTP' ? 'var(--accent)' : 'transparent',
            color: authMethod === 'OTP' ? '#0F0A1E' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
          }}
        >
          <Mail size={13} /> OTP Code
        </button>
        <button
          type="button"
          onClick={() => { setAuthMethod('MAGIC_LINK'); setErrorMsg(''); setMagicLinkSent(false); }}
          style={{
            flex: 1,
            padding: '8px 6px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: authMethod === 'MAGIC_LINK' ? 'var(--gold)' : 'transparent',
            color: authMethod === 'MAGIC_LINK' ? '#0F0A1E' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={13} /> Magic Link
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
              <button
                type="button"
                onClick={handleOpenForgotModal}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot password?
              </button>
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
                {loading ? 'Sending Code...' : 'Send Verification OTP Code'}
                {!loading && <Mail size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Enter the OTP code sent to <strong style={{ color: 'var(--text)' }}>{email}</strong>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  maxLength={8}
                  required
                  autoFocus
                  className="input-field"
                  placeholder="80199565"
                  style={{ fontSize: '1.4rem', letterSpacing: '0.3em', textAlign: 'center', fontWeight: 800 }}
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

      {/* Magic Link Form */}
      {authMethod === 'MAGIC_LINK' && (
        <>
          {!magicLinkSent ? (
            <form onSubmit={handleSendMagicLink}>
              <div className="input-group">
                <label className="input-label">Email Address for 1-Click Magic Link</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="owner@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-secondary" style={{ width: '100%', marginTop: '8px', background: 'var(--gradient-accent)', color: '#0F0A1E', fontWeight: 800 }}>
                {loading ? 'Sending Magic Link...' : 'Send 1-Click Magic Link'}
                {!loading && <Sparkles size={18} />}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255, 184, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--gold)' }}>
                <ExternalLink size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Check Your Inbox!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '20px' }}>
                We emailed a 1-click login link to <strong style={{ color: 'var(--text)' }}>{email}</strong>. Click the link in your email to log in instantly.
              </p>

              <button
                type="button"
                onClick={() => setMagicLinkSent(false)}
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', color: 'var(--accent)' }}
              >
                Resend Link / Use Another Email
              </button>
            </div>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#150D2A',
              border: '1px solid var(--primary-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={22} color="var(--accent)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Reset Your Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {forgotErrorMsg && (
              <div className={styles.errorBox} style={{ marginBottom: '16px' }}>
                {forgotErrorMsg}
              </div>
            )}

            {!forgotSent ? (
              <form onSubmit={handleSendPasswordReset}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  Enter your email address below to receive password reset instructions.
                </p>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    className="input-field"
                    placeholder="owner@store.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn btn-accent"
                    style={{ flex: 2 }}
                  >
                    {forgotLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0, 201, 167, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--accent)' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Reset Link Sent!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  We emailed password reset instructions to <strong style={{ color: 'var(--text)' }}>{forgotEmail}</strong>. Check your inbox and follow the link to reset your password.
                </p>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
