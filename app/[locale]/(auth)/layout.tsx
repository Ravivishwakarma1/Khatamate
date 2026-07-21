import React from 'react';
import styles from './auth.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authLayout}>
      <div className={`glass-card animate-slide-up ${styles.authCard}`}>
        {children}
      </div>
    </div>
  );
}
