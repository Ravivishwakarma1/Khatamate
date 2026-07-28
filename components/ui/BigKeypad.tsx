'use client';

import React from 'react';
import { Delete } from 'lucide-react';

interface BigKeypadProps {
  value: string;
  onChange: (val: string) => void;
}

export default function BigKeypad({ value, onChange }: BigKeypadProps) {
  const handleDigit = (digit: string) => {
    if (digit === '.' && value.includes('.')) return;
    if (value === '0' && digit !== '.') {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (value.length <= 1) {
      onChange('');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'];

  return (
    <div style={{ marginTop: '12px', userSelect: 'none' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          maxWidth: '360px',
          margin: '0 auto',
        }}
      >
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleDigit(k)}
            style={{
              padding: '16px 0',
              fontSize: '1.4rem',
              fontWeight: 800,
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s ease, background 0.1s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {k}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <button
          type="button"
          onClick={handleBackspace}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 700,
            background: 'rgba(255, 107, 107, 0.15)',
            color: 'var(--coral)',
            border: '1px solid var(--coral)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Delete size={20} /> Clear Last Digit
        </button>
      </div>
    </div>
  );
}
