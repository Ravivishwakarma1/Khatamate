'use client';

import React, { useState } from 'react';
import { Customer, Transaction } from '@/lib/db/schema';
import { writeOffTransaction } from '@/lib/finance';
import { useToast } from '@/components/ui/Toast';
import { X, AlertTriangle } from 'lucide-react';
import styles from './modal.module.css';

interface WriteOffModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: (updatedCust: Customer, tx: Transaction) => void;
}

export default function WriteOffModal({ customer, onClose, onSuccess }: WriteOffModalProps) {
  const toast = useToast();
  const [amount, setAmount] = useState(customer.outstanding_due ? customer.outstanding_due.toString() : '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const writeOffAmt = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (writeOffAmt <= 0) {
      setErrorMsg('Please enter a valid write-off amount.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for writing off this bad debt.');
      return;
    }

    try {
      setLoading(true);
      const { customer: updatedCust, transaction: tx } = await writeOffTransaction(
        customer,
        writeOffAmt,
        reason.trim()
      );
      toast.warning(`Written off ₹${writeOffAmt.toFixed(2)} for ${customer.name}`);
      onSuccess(updatedCust, tx);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process write-off.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} style={{ color: 'var(--coral)' }}>Write Off Bad Debt</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Customer: <strong>{customer.name}</strong></p>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        {/* Warning Banner */}
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid var(--coral)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: 'var(--text-xs)',
            color: 'var(--coral)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={20} />
          <span>This will permanently deduct amount from customer dues and record it as bad debt write-off.</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Write Off Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              autoFocus
              className="input-field"
              placeholder="0.00"
              style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--coral)' }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Required Reason for Write Off *</label>
            <textarea
              required
              rows={3}
              className="input-field"
              placeholder="e.g. Uncollectible dues, customer relocated"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || writeOffAmt <= 0} className="btn btn-coral" style={{ flex: 2 }}>
              {loading ? 'Processing...' : `Confirm Write Off (₹${writeOffAmt.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
