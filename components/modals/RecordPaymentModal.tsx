'use client';

import React, { useState } from 'react';
import { Customer, Transaction } from '@/lib/db/schema';
import { recordPaymentTransaction } from '@/lib/finance';
import { useToast } from '@/components/ui/Toast';
import { X, AlertCircle } from 'lucide-react';
import styles from './modal.module.css';

import BigKeypad from '@/components/ui/BigKeypad';
import VoiceInputButton from '@/components/ui/VoiceInputButton';

interface RecordPaymentModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: (updatedCust: Customer, tx: Transaction) => void;
}

export default function RecordPaymentModal({ customer, onClose, onSuccess }: RecordPaymentModalProps) {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const payAmount = parseFloat(amount) || 0;
  const currentDue = customer.outstanding_due || 0;

  let newDue = 0;
  let excessAdvance = 0;

  if (payAmount <= currentDue) {
    newDue = currentDue - payAmount;
  } else {
    excessAdvance = payAmount - currentDue;
  }

  const handleVoiceParsed = (entry: any) => {
    if (entry.amount) setAmount(entry.amount.toString());
    if (entry.rawText) setNote(entry.rawText);
    toast.success('Voice entry parsed!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (payAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    try {
      setLoading(true);
      const { customer: updatedCust, transaction: tx } = await recordPaymentTransaction(
        customer,
        payAmount,
        note
      );
      toast.success(`Recorded ₹${payAmount.toFixed(2)} payment from ${customer.name}`);
      onSuccess(updatedCust, tx);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to record payment');
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
            <h2 className={styles.title} style={{ color: 'var(--accent)' }}>- Record Payment (Jama)</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Customer: <strong>{customer.name}</strong></p>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        {/* Voice Input & Helper bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <VoiceInputButton onParsed={handleVoiceParsed} />
          <button
            type="button"
            onClick={() => setShowKeypad(!showKeypad)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            {showKeypad ? '⌨️ Use Keyboard' : '🔢 Calculator Keypad'}
          </button>
        </div>

        {/* Current Balance Display */}
        <div style={{ background: 'var(--bg-input)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Current Total Outstanding:</span>
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>
            ₹ {currentDue.toFixed(2)}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Payment Amount Received (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              autoFocus
              className="input-field"
              placeholder="0.00"
              style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {showKeypad && (
            <BigKeypad value={amount} onChange={(val) => setAmount(val)} />
          )}

          <div className="input-group">
            <label className="input-label">Note / Payment Mode (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Cash / GPay / PhonePe"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Overpayment Notice */}
          {excessAdvance > 0 && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: 'var(--text-xs)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} />
              <span>₹{excessAdvance.toFixed(2)} overpayment will be added to customer's Advance Wallet!</span>
            </div>
          )}

          {/* Live Preview */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: 'var(--text-xs)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>
              <span>New Outstanding After Payment:</span>
              <span>₹ {newDue.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || payAmount <= 0} className="btn btn-accent" style={{ flex: 2 }}>
              {loading ? 'Recording...' : `Record Payment (₹${payAmount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
