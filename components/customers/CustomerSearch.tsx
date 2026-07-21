'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './CustomerSearch.module.css';

interface CustomerSearchProps {
  query: string;
  onChange: (q: string) => void;
}

export default function CustomerSearch({ query, onChange }: CustomerSearchProps) {
  return (
    <div className={styles.wrap}>
      <input
        type="text"
        className={`input-field ${styles.input} ${query ? styles.inputWithClear : ''}`}
        placeholder="Search customer by name, phone (+91), or room ID..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      <Search size={18} className={styles.searchIcon} />
      {query && (
        <button
          onClick={() => onChange('')}
          className={styles.clearBtn}
          aria-label="Clear search query"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
