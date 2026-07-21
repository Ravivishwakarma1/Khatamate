'use client';

import React from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';
import styles from './modal.module.css';

export type LegalDocType = 'privacy' | 'terms' | 'security';

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    security: 'Bank-Grade Security',
  };

  const icons = {
    privacy: <FileText size={22} color="var(--accent)" />,
    terms: <FileText size={22} color="var(--gold)" />,
    security: <ShieldCheck size={22} color="var(--emerald)" />,
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className={styles.dragHandle} />

        {/* Modal Header */}
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icons[type]}
            <h2 className={styles.title}>{titles[type]}</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            maxHeight: '360px',
            overflowY: 'auto',
            paddingRight: '6px',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          {type === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                At <strong>KhataFlow</strong>, your privacy is our top priority. This Privacy Policy explains how your customer ledger data, transactions, and business information are protected.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>1. Local-First Data Control</h4>
              <p>
                All your customer records, debt ledgers, and transactions are stored locally on your device using encrypted IndexedDB storage. You retain 100% ownership of your business data.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>2. Offline Confidentiality</h4>
              <p>
                KhataFlow never sells or shares customer personal details, phone numbers, or ledger balances with third-party advertisers or data brokers.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>3. Secure Cloud Backup</h4>
              <p>
                When online sync is enabled, your data is synced using TLS 1.3 encrypted connections directly to Supabase cloud vaults.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                Welcome to <strong>KhataFlow</strong>. By using our web application or services, you agree to these Terms of Service.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>1. Accurate Record Keeping</h4>
              <p>
                Store owners are responsible for ensuring accurate ledger entry records for customer credit (Udhar) and payments (Jama).
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>2. Fair Usage of Reminders</h4>
              <p>
                WhatsApp payment reminders generated via KhataFlow must be used responsibly and strictly for genuine business payment collections.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>3. Service Availability</h4>
              <p>
                KhataFlow is provided with offline-first support so you can continue managing your shop even during internet outages.
              </p>
            </div>
          )}

          {type === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                KhataFlow enforces <strong>Bank-Grade Multi-Layer Security</strong> to safeguard your financial records.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>🔒 App PIN & Biometric Lock</h4>
              <p>
                Protect your ledger from unauthorized access using custom 4-digit PIN locks and screen timeout security.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>🛡️ End-to-End Encryption</h4>
              <p>
                All data transmission between your shop device and cloud servers is secured using AES-256 and SSL/TLS encryption.
              </p>
              <h4 style={{ color: 'var(--text)', fontSize: '0.9rem' }}>💾 Automated Instant Backups</h4>
              <p>
                Never worry about lost phones or damaged devices — your data can be restored anytime with 1-click backup restoration.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.footer} style={{ marginTop: '16px' }}>
          <button type="button" onClick={onClose} className="btn btn-accent" style={{ width: '100%' }}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
