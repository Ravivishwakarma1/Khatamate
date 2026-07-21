'use client';

import React from 'react';
import { Customer, Transaction, Shop } from '@/lib/db/schema';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { X, Printer, Share2, Receipt, Store } from 'lucide-react';
import styles from './modal.module.css';

interface BillSlipModalProps {
  transaction: Transaction;
  customer: Customer;
  shop: Shop;
  onClose: () => void;
}

export default function BillSlipModal({ transaction, customer, shop, onClose }: BillSlipModalProps) {
  const items = transaction.items || [];
  const dateFormatted = new Date(transaction.transaction_at).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let itemLines = '';
    if (items.length > 0) {
      itemLines = items
        .map((i) => `• ${i.name} (x${i.qty}) @ ₹${i.price} = ₹${i.subtotal.toFixed(2)}`)
        .join('\n');
    } else {
      itemLines = `• Credit Entry: ₹${transaction.amount.toFixed(2)} ${transaction.note ? `(${transaction.note})` : ''}`;
    }

    const message = `🧾 *GROCERY BILL SLIP* - ${shop.name}
👤 *Customer:* ${customer.name}
📅 *Date:* ${dateFormatted}

${itemLines}
-----------------------------
💵 *Bill Total:* ₹${transaction.amount.toFixed(2)}
📌 *Current Outstanding Balance:* ₹${customer.outstanding_due.toFixed(2)}

Thank you for shopping at ${shop.name}!`;

    const url = buildWhatsAppUrl(customer.phone, message);
    if (url !== '#') {
      window.open(url, '_blank');
    } else {
      alert(`Customer ${customer.name} does not have a registered phone number for WhatsApp.`);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className={styles.dragHandle} />

        {/* Modal Header */}
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={22} color="var(--emerald)" />
            <h2 className={styles.title}>Grocery Bill Slip</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Slip Container */}
        <div
          id="printable-bill-slip"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Shop Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Store size={18} color="var(--gold)" /> {shop.name}
            </h3>
            {shop.address && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{shop.address}</p>}
            {shop.phone && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ph: {shop.phone}</p>}
          </div>

          {/* Customer & Transaction Meta */}
          <div style={{ fontSize: 'var(--text-xs)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <div>
              <span>Customer: </span>
              <strong style={{ color: 'var(--text)' }}>{customer.name}</strong>
            </div>
            <div>{dateFormatted}</div>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 0' }}>Item</th>
                  <th style={{ padding: '6px 0', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px 0', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '6px 0', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{item.price}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: 'var(--coral)' }}>
                      ₹{item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '12px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', borderBottom: '1px solid var(--border)', marginBottom: '14px' }}>
              Note: {transaction.note || 'Direct credit transaction'}
            </div>
          )}

          {/* Totals Summary */}
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', marginBottom: '6px' }}>
              <span>Bill Amount:</span>
              <span style={{ color: 'var(--coral)' }}>₹ {transaction.amount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 700 }}>
              <span>Current Outstanding Balance:</span>
              <span>₹ {customer.outstanding_due.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.footer} style={{ gap: '8px' }}>
          <button type="button" onClick={handlePrint} className="btn btn-secondary" style={{ flex: 1, gap: '6px', fontSize: '0.85rem' }}>
            <Printer size={16} /> Print Slip
          </button>
          <button type="button" onClick={handleWhatsAppShare} className="btn btn-emerald" style={{ flex: 1, gap: '6px', fontSize: '0.85rem' }}>
            <Share2 size={16} /> Share WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
