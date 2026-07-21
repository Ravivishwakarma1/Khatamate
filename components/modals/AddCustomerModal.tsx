'use client';

import React, { useState } from 'react';
import { Customer } from '@/lib/db/schema';
import { saveLocalCustomer } from '@/lib/db/idb';
import { useShopStore } from '@/lib/shopStore';
import { searchCustomers } from '@/lib/fuzzy';
import { useToast } from '@/components/ui/Toast';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import styles from './modal.module.css';

interface AddCustomerModalProps {
  existingCustomers: Customer[];
  onClose: () => void;
  onCustomerAdded: (c: Customer) => void;
}

export default function AddCustomerModal({
  existingCustomers,
  onClose,
  onCustomerAdded,
}: AddCustomerModalProps) {
  const toast = useToast();
  const activeShop = useShopStore((state) => state.activeShop);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomId, setRoomId] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [notes, setNotes] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<Customer | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter a customer name.');
      return;
    }

    if (!duplicateWarning) {
      const matches = searchCustomers(existingCustomers, name.trim());
      if (matches.length > 0) {
        setDuplicateWarning(matches[0]);
        return;
      }
    }

    const now = new Date().toISOString();
    const newCust: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      shop_id: activeShop?.id || 'shop_main',
      name: name.trim(),
      phone: phone.trim() || undefined,
      room_id: roomId.trim() || undefined,
      credit_limit: parseFloat(creditLimit) || 0,
      advance_balance: 0,
      outstanding_due: 0,
      notes: notes.trim() || undefined,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    await saveLocalCustomer(newCust);
    toast.success(`Created customer account for ${newCust.name}`);
    onCustomerAdded(newCust);
    onClose();
  };


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F0A1E',
              }}
            >
              <UserPlus size={20} />
            </div>
            <h2 className={styles.title}>Add New Customer</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        {duplicateWarning && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--gold)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontWeight: 700, marginBottom: '4px' }}>
              <AlertCircle size={18} /> Potential Duplicate Found!
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Did you mean <strong style={{ color: 'var(--text)' }}>{duplicateWarning.name}</strong> ({duplicateWarning.phone || 'No phone'})?
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Customer Name *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDuplicateWarning(null);
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Room / Flat ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Flat 102"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Credit Limit (₹)</label>
            <input
              type="number"
              min="0"
              className="input-field"
              placeholder="0 = No limit"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Notes / Memory Tag</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="e.g. Daily milk & grocery delivery"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
