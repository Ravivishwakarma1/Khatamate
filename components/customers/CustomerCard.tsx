'use client';

import React from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/db/schema';
import { Phone, Home, PlusCircle, MinusCircle, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './CustomerCard.module.css';

interface CustomerCardProps {
  customer: Customer;
  locale: string;
  onAddCredit: (c: Customer) => void;
  onRecordPayment: (c: Customer) => void;
  onSendReminder: (c: Customer) => void;
}

export default function CustomerCard({
  customer,
  locale,
  onAddCredit,
  onRecordPayment,
  onSendReminder,
}: CustomerCardProps) {
  const isOverdue = customer.outstanding_due > 0;
  const hasAdvance = customer.advance_balance > 0;

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const borderLeftColor = isOverdue
    ? 'var(--coral)'
    : hasAdvance
    ? 'var(--gold)'
    : 'var(--text-dim)';

  const formattedDate = customer.last_transaction_at
    ? formatDistanceToNow(new Date(customer.last_transaction_at), { addSuffix: true })
    : 'No activity';

  return (
    <div
      className={`glass-card ${styles.card}`}
      style={{ borderLeft: `5px solid ${borderLeftColor}` }}
    >
      {/* Left Customer Info */}
      <Link href={`/${locale}/customers/${customer.id}`} className={styles.leftInfo}>
        <div
          className={`${styles.avatar} ${
            isOverdue
              ? styles.avatarOverdue
              : hasAdvance
              ? styles.avatarAdvance
              : styles.avatarNormal
          }`}
        >
          {initials}
        </div>

        <div>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{customer.name}</h3>
            {customer.is_regular && (
              <span className="badge" style={{ background: 'rgba(108, 58, 232, 0.2)', color: 'var(--accent)', fontSize: '0.65rem' }}>
                ⭐ Regular
              </span>
            )}
            {customer.room_id && (
              <span className={styles.roomBadge}>
                <Home size={10} />
                {customer.room_id}
              </span>
            )}
          </div>

          <div className={styles.metaRow}>
            {customer.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {customer.phone}
              </span>
            )}
            <span className="text-dim">• {formattedDate}</span>
          </div>
        </div>
      </Link>

      {/* Right Balance Badge & Quick Actions */}
      <div className={styles.rightSection}>
        {/* Balance Display */}
        <div className={styles.balanceBox}>
          {isOverdue ? (
            <div>
              <div className={`${styles.balanceVal} text-coral`}>
                ₹ {customer.outstanding_due.toFixed(2)}
              </div>
              <span className="badge badge-credit">UDHAR DUES</span>
            </div>
          ) : hasAdvance ? (
            <div>
              <div className={`${styles.balanceVal} text-gold`}>
                ₹ {customer.advance_balance.toFixed(2)}
              </div>
              <span className="badge badge-advance">ADVANCE WALLET</span>
            </div>
          ) : (
            <div>
              <div className={`${styles.balanceVal} text-muted`}>
                ₹ 0.00
              </div>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                ALL CLEAR
              </span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className={styles.actionGroup}>
          <button
            onClick={() => onAddCredit(customer)}
            className={`btn btn-secondary ${styles.actionBtnCoral}`}
            title="Add Credit (+ Udhar)"
          >
            <PlusCircle size={18} />
          </button>

          <button
            onClick={() => onRecordPayment(customer)}
            className={`btn btn-secondary ${styles.actionBtnAccent}`}
            title="Record Payment (- Jama)"
          >
            <MinusCircle size={18} />
          </button>

          {customer.outstanding_due > 0 && customer.phone && (
            <button
              onClick={() => onSendReminder(customer)}
              className={`btn btn-secondary ${styles.actionBtnWhatsApp}`}
              title="Send WhatsApp Reminder"
            >
              <MessageCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
