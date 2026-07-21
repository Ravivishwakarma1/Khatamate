'use client';

import React from 'react';
import { Customer } from '@/lib/db/schema';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, QrCode, BookOpen } from 'lucide-react';
import styles from './modal.module.css';

interface CustomerQrModalProps {
  customer: Customer;
  shopName?: string;
  onClose: () => void;
}

export default function CustomerQrModal({
  customer,
  shopName = 'KhataMate Digital Ledger',
  onClose,
}: CustomerQrModalProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khatamate.vercel.app';
  const queryParams = new URLSearchParams();
  if (customer.name) queryParams.set('name', customer.name);
  if (customer.outstanding_due !== undefined) queryParams.set('due', customer.outstanding_due.toString());
  if (customer.advance_balance !== undefined) queryParams.set('adv', customer.advance_balance.toString());
  if (customer.phone) queryParams.set('phone', customer.phone);
  if (customer.room_id) queryParams.set('room', customer.room_id);
  if (shopName) queryParams.set('shop', shopName);

  const qrValue = `${origin}/en/passbook/${customer.id}?${queryParams.toString()}`;


  const handlePrint = () => {
    window.print();
  };


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div className={styles.dragHandle} />
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={22} color="var(--accent)" />
            <h2 className={styles.title}>Digital Pass Card</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Printable Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #241642 0%, #1A1030 100%)',
            border: '2px solid var(--primary-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>{shopName}</h3>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <QRCodeSVG value={qrValue} size={160} level="H" includeMargin />
          </div>

          <h4 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '4px' }}>{customer.name}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            {customer.phone || customer.room_id || 'Digital Customer Pass'}
          </p>

          <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scan to view account ledger
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-accent" style={{ flex: 2 }}>
            <Printer size={18} /> Print Pass Card
          </button>
        </div>
      </div>
    </div>
  );
}
