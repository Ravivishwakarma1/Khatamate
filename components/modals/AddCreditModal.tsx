'use client';

import React, { useState } from 'react';
import { Customer, Transaction, TransactionItem } from '@/lib/db/schema';
import { addCreditTransaction } from '@/lib/finance';
import { useToast } from '@/components/ui/Toast';
import { X, Trash2, Plus, AlertCircle } from 'lucide-react';
import styles from './modal.module.css';
import BigKeypad from '@/components/ui/BigKeypad';
import VoiceInputButton from '@/components/ui/VoiceInputButton';

interface AddCreditModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: (updatedCust: Customer, tx: Transaction) => void;
}

export default function AddCreditModal({ customer, onClose, onSuccess }: AddCreditModalProps) {
  const toast = useToast();
  const [tab, setTab] = useState<'quick' | 'item'>('quick');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVoiceParsed = (entry: any) => {
    if (entry.amount) setAmount(entry.amount.toString());
    if (entry.rawText) setNote(entry.rawText);
    toast.success('Voice entry parsed!');
  };

  const [items, setItems] = useState<TransactionItem[]>([
    { name: '', qty: 1, price: 0, subtotal: 0 },
  ]);

  const itemTotal = items.reduce((sum, i) => sum + (i.subtotal || 0), 0);
  const finalAmount = tab === 'quick' ? parseFloat(amount) || 0 : itemTotal;

  const advanceDeducted = Math.min(customer.advance_balance || 0, finalAmount);
  const newOutstanding = (customer.outstanding_due || 0) + (finalAmount - advanceDeducted);

  const handleAddItemRow = () => {
    setItems([...items, { name: '', qty: 1, price: 0, subtotal: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof TransactionItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'qty' || field === 'price') {
      item.subtotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const GROCERY_PRESETS = [
    { name: 'Rice 1kg', price: 60 },
    { name: 'Sugar 1kg', price: 45 },
    { name: 'Milk 1L', price: 32 },
    { name: 'Cooking Oil 1L', price: 140 },
    { name: 'Atta / Wheat 5kg', price: 210 },
    { name: 'Dal / Pulses 1kg', price: 110 },
    { name: 'Tea 250g', price: 85 },
    { name: 'Soap / Detergent', price: 35 },
  ];

  const handleAddPresetItem = (preset: { name: string; price: number }) => {
    // Check if last item row is empty
    const lastIdx = items.length - 1;
    if (lastIdx >= 0 && !items[lastIdx].name.trim() && items[lastIdx].price === 0) {
      const updated = [...items];
      updated[lastIdx] = {
        name: preset.name,
        qty: 1,
        price: preset.price,
        subtotal: preset.price,
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          name: preset.name,
          qty: 1,
          price: preset.price,
          subtotal: preset.price,
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (finalAmount <= 0) {
      setErrorMsg('Please enter a valid credit amount.');
      return;
    }

    try {
      setLoading(true);
      const validItems = tab === 'item' ? items.filter((i) => i.name.trim() && i.subtotal > 0) : undefined;
      let finalNote = note.trim();
      if (!finalNote && validItems && validItems.length > 0) {
        finalNote = validItems.map((i) => `${i.name} (x${i.qty})`).join(', ');
      }

      const { customer: updatedCust, transaction: tx } = await addCreditTransaction(
        customer,
        finalAmount,
        validItems,
        finalNote
      );
      toast.success(`Added ₹${finalAmount.toFixed(2)} credit to ${customer.name}`);
      onSuccess(updatedCust, tx);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to add credit entry');
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
            <h2 className={styles.title} style={{ color: 'var(--coral)' }}>+ Add Credit (Udhar)</h2>
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setTab('quick')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'quick' ? 'var(--gradient-coral)' : 'transparent',
              color: tab === 'quick' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ⚡ Quick Amount Mode
          </button>
          <button
            type="button"
            onClick={() => setTab('item')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'item' ? 'var(--gradient-coral)' : 'transparent',
              color: tab === 'item' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📝 Itemized Grocery Mode
          </button>
        </div>

        {/* Advance Balance Deduction Preview Banner */}
        {customer.advance_balance > 0 && finalAmount > 0 && (
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
            <span>
              ₹{advanceDeducted.toFixed(2)} will be automatically deducted from customer's advance balance!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'quick' ? (
            <div>
              <div className="input-group">
                <label className="input-label">Credit Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  autoFocus
                  className="input-field"
                  placeholder="0.00"
                  style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coral)' }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {showKeypad && (
                <BigKeypad value={amount} onChange={(val) => setAmount(val)} />
              )}

              <div className="input-group">
                <label className="input-label">Note / Description (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rice 5kg, Oil 1L"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '-8px', marginBottom: '12px' }}>
                ℹ️ Note: High interest rates on informal credit may have legal restrictions in India.
              </div>
            </div>
          ) : (
            <div>
              {/* Quick Grocery Presets */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  🛒 Quick Grocery Presets (Tap to Add):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {GROCERY_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPresetItem(p)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        color: 'var(--text)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={12} color="var(--coral)" /> {p.name} (₹{p.price})
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Item name"
                      className="input-field"
                      style={{ flex: 2 }}
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="input-field"
                      style={{ width: '64px' }}
                      value={item.qty || ''}
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      className="input-field"
                      style={{ width: '90px' }}
                      value={item.price || ''}
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                    />
                    <div style={{ width: '80px', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}>
                      ₹{item.subtotal}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="btn btn-ghost"
                        style={{ padding: '6px', color: 'var(--coral)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" onClick={handleAddItemRow} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', marginBottom: '16px' }}>
                <Plus size={16} /> Add Custom Item Row
              </button>

              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '16px' }}>
                <span>Total Grocery Bill Amount:</span>
                <span style={{ color: 'var(--coral)', fontSize: '1.2rem' }}>₹ {itemTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* New Balance Preview */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--text-muted)' }}>
              <span>Current Outstanding:</span>
              <span>₹ {customer.outstanding_due.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--coral)', fontSize: '0.95rem' }}>
              <span>New Balance After Credit:</span>
              <span>₹ {newOutstanding.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || finalAmount <= 0} className="btn btn-coral" style={{ flex: 2 }}>
              {loading ? 'Saving Entry...' : `Save Credit Entry (₹${finalAmount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

