'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import styles from '../auth.module.css';

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';
  const email = searchParams?.get('email') || '';
  const toast = useToast();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg('Please enter the verification code.');
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
        const localUser = { uid: `usr_verify_${Date.now()}`, email, displayName: email.split('@')[0] };
        localStorage.setItem('khataflow_user', JSON.stringify(localUser));
      } else {
        const supabase = createClient();
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode.trim(),
          type: 'signup',
        });

        if (error) {
          setErrorMsg(error.message || 'Invalid or expired verification code.');
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
      toast.success('Email verified successfully!');
      window.location.href = `/${locale}/dashboard`;
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      if (!email) {
        toast.warning('No email address found to resend.');
        return;
      }
      const supabase = createClient();
      await supabase.auth.resend({ type: 'signup', email });
      toast.success(`Verification code resent to ${email}`);
    } catch (e) {
      toast.error('Could not resend verification email.');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon} style={{ background: 'rgba(0, 201, 167, 0.15)', color: 'var(--accent)', border: '1px solid rgba(0, 201, 167, 0.3)' }}>
          <Mail size={32} />
        </div>
        <h1 className={styles.brandTitle}>Verify Account</h1>
        <p className={styles.brandSub}>
          Verification code sent to <strong style={{ color: 'var(--text)' }}>{email || 'your email'}</strong>
        </p>
      </div>

      {errorMsg && (
        <div className={styles.errorBox} style={{ marginBottom: '16px' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleVerifyOtp} style={{ marginTop: '16px' }}>
        <div className="input-group">
          <label className="input-label">Enter Verification Code</label>
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
          {loading ? 'Verifying...' : 'Verify & Continue'}
          {!loading && <ShieldCheck size={18} />}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        <button onClick={handleResend} type="button" className="btn btn-secondary" style={{ width: '100%' }}>
          Resend Verification Code
        </button>

        <Link href={`/${locale}/login`} className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
