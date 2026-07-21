'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Mail, ArrowLeft } from 'lucide-react';
import styles from '../auth.module.css';

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';
  const email = searchParams?.get('email') || 'your email';
  const toast = useToast();

  const handleResend = () => {
    toast.success(`Verification link resent to ${email}`);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon} style={{ background: 'rgba(0, 201, 167, 0.15)', color: 'var(--accent)', border: '1px solid rgba(0, 201, 167, 0.3)' }}>
          <Mail size={32} />
        </div>
        <h1 className={styles.brandTitle}>Check Your Inbox</h1>
        <p className={styles.brandSub}>
          We sent a verification link to <strong style={{ color: 'var(--text)' }}>{email}</strong>
        </p>
      </div>

      <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', margin: '20px 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        Click the link in the email to activate your account and start managing your ledger.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
        <button onClick={handleResend} className="btn btn-secondary" style={{ width: '100%' }}>
          Resend Email
        </button>

        <Link href={`/${locale}/login`} className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
