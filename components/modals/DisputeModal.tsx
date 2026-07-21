'use client';

import React, { useState } from 'react';
import { Transaction } from '@/lib/db/schema';
import { saveLocalTransaction } from '@/lib/db/idb';
import { useToast } from '@/components/ui/Toast';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './modal.module.css';

interface DisputeModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSuccess: (updatedTx: Transaction) => void;
}

export default function DisputeModal({ transaction, onClose, onSuccess }: DisputeModalProps) {
  const toast = useToast();
  const [disputeNote, setDisputeNote] = useState(transaction.dispute_note || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isCurrentlyDisputed = Boolean(transaction.is_disputed);

  const handleFlagDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!disputeNote.trim()) {
      setErrorMsg('Please enter a note explaining the dispute.');
      return;
    }

    try {
      setLoading(true);
      const updatedTx: Transaction = {
        ...transaction,
        is_disputed: true,
        dispute_note: disputeNote.trim(),
      };
      await saveLocalTransaction(updatedTx);
      toast.warning('Transaction flagged as disputed');
      onSuccess(updatedTx);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to flag dispute.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    try {
      setLoading(true);
      const updatedTx: Transaction = {
        ...transaction,
        is_disputed: false,
        dispute_note: undefined,
      };
      await saveLocalTransaction(updatedTx);
      toast.success('Dispute resolved');
      onSuccess(updatedTx);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resolve dispute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} style={{ color: 'var(--gold)' }}>
              {isCurrentlyDisputed ? 'Manage Transaction Dispute' : 'Flag Transaction as Disputed'}
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Entry Amount: <strong>₹{transaction.amount.toFixed(2)}</strong></p>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        {isCurrentlyDisputed ? (
          <div>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '16px', fontSize: 'var(--text-xs)', color: 'var(--gold)' }}>
              <strong>Dispute Note:</strong> {transaction.dispute_note}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '20px' }}>
              Has this transaction discrepancy been verified and resolved with the customer?
            </p>

            <div className={styles.footer}>
              <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Keep Disputed
              </button>
              <button onClick={handleResolveDispute} disabled={loading} className="btn btn-accent" style={{ flex: 2 }}>
                <CheckCircle2 size={18} /> Mark as Resolved
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFlagDispute}>
            <div className="input-group">
              <label className="input-label">Dispute Reason / Note *</label>
              <textarea
                required
                rows={3}
                className="input-field"
                placeholder="e.g. Customer claims payment was made via UPI on 12th July"
                value={disputeNote}
                onChange={(e) => setDisputeNote(e.target.value)}
              />
            </div>

            <div className={styles.footer}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-coral" style={{ flex: 2 }}>
                <AlertCircle size={18} /> Flag as Disputed
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
