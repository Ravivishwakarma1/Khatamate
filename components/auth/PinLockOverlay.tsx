'use client';

import React, { useState } from 'react';
import { verifySecurityPin } from '@/lib/pin';
import { Lock, Delete, CheckCircle2 } from 'lucide-react';
import styles from './PinLockOverlay.module.css';

interface PinLockOverlayProps {
  onUnlock: () => void;
}

export default function PinLockOverlay({ onUnlock }: PinLockOverlayProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (verifySecurityPin(nextPin)) {
          setUnlocked(true);
          setTimeout(() => {
            onUnlock();
          }, 600);
        } else {
          setErrorMsg('Incorrect PIN. Please try again.');
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className={styles.overlay}>
      <div className={`glass-card animate-slide-up ${styles.card}`}>
        <div
          className={styles.iconWrap}
          style={{ background: unlocked ? 'var(--gradient-accent)' : 'var(--gradient-primary)' }}
        >
          {unlocked ? <CheckCircle2 size={32} /> : <Lock size={30} />}
        </div>

        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '4px' }}>
          {unlocked ? 'App Unlocked' : 'KhataFlow Security PIN'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: '24px' }}>
          {unlocked ? 'Accessing your shop ledger...' : 'Enter your 4-digit PIN to access ledger'}
        </p>

        {/* 4 Pin Indicator Dots */}
        <div className={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`${styles.dot} ${pin.length > idx ? styles.dotFilled : ''}`}
            />
          ))}
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--coral)', fontSize: 'var(--text-xs)', marginBottom: '16px', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className={`btn btn-secondary ${styles.keyBtn}`}
            >
              {num}
            </button>
          ))}
          <button onClick={handleClear} className="btn btn-ghost" style={{ height: '56px', fontSize: 'var(--text-xs)' }}>
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className={`btn btn-secondary ${styles.keyBtn}`}
          >
            0
          </button>
          <button onClick={handleDelete} className="btn btn-ghost" style={{ height: '56px', color: 'var(--coral)' }}>
            <Delete size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
