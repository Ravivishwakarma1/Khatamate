'use client';

import React, { useState } from 'react';
import { useShopStore } from '@/lib/shopStore';
import { useToast } from '@/components/ui/Toast';
import { X, Store, Building, Phone, FileText } from 'lucide-react';
import styles from './modal.module.css';

interface AddShopModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddShopModal({ onClose, onSuccess }: AddShopModalProps) {
  const toast = useToast();
  const addShop = useShopStore((state) => state.addShop);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Store name is required.');
      return;
    }

    try {
      setLoading(true);
      const created = await addShop({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        gst_number: gstNumber.trim() || undefined,
      });

      toast.success(`Store "${created.name}" created & activated!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create shop store');
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
            <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={22} color="var(--gold)" /> Add New Store / Branch
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Create a new store profile to manage separate customer ledgers.
            </p>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={14} /> Store / Shop Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              className="input-field"
              placeholder="e.g. City Supermarket, Branch 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} /> Store Address (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Shop #12, Market Yard"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} /> Contact Phone (Optional)
            </label>
            <input
              type="tel"
              className="input-field"
              placeholder="+91 98765 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> GST / Registration # (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="27AAAAA0000A1Z5"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()} className="btn btn-emerald" style={{ flex: 2 }}>
              {loading ? 'Creating Store...' : 'Create & Switch Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
