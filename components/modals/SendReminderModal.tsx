'use client';

import React, { useState } from 'react';
import { Customer } from '@/lib/db/schema';
import { REMINDER_TEMPLATES, ReminderTemplateType, buildWhatsAppUrl } from '@/lib/whatsapp';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import styles from './modal.module.css';

interface SendReminderModalProps {
  customer: Customer;
  shopName?: string;
  onClose: () => void;
}

export default function SendReminderModal({
  customer,
  shopName = 'KhataFlow Store',
  onClose,
}: SendReminderModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplateType>('hindi');
  const templateObj = REMINDER_TEMPLATES.find((t) => t.id === selectedTemplate) || REMINDER_TEMPLATES[0];

  const [customMessage, setCustomMessage] = useState(
    templateObj.getText(customer.name, customer.outstanding_due, shopName)
  );

  const handleTemplateSelect = (id: ReminderTemplateType) => {
    setSelectedTemplate(id);
    const tmpl = REMINDER_TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setCustomMessage(tmpl.getText(customer.name, customer.outstanding_due, shopName));
    }
  };

  const handleSendWhatsApp = () => {
    const url = buildWhatsAppUrl(customer.phone, customMessage);
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#25D366',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageCircle size={20} />
            </div>
            <h2 className={styles.title}>Send WhatsApp Reminder</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Customer & Due Summary */}
        <div
          style={{
            background: 'var(--bg-input)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>{customer.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{customer.phone || 'No phone'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>
              ₹ {customer.outstanding_due.toFixed(2)}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Amount Due</span>
          </div>
        </div>

        {/* Template Selector */}
        <div className="input-group">
          <label className="input-label">Select Message Template</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {REMINDER_TEMPLATES.map((tmpl) => (
              <label
                key={tmpl.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedTemplate === tmpl.id ? 'rgba(37, 211, 102, 0.15)' : 'var(--bg-surface)',
                  border: selectedTemplate === tmpl.id ? '1px solid #25D366' : '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <input
                  type="radio"
                  name="reminderTemplate"
                  checked={selectedTemplate === tmpl.id}
                  onChange={() => handleTemplateSelect(tmpl.id)}
                  style={{ accentColor: '#25D366' }}
                />
                <span style={{ fontWeight: selectedTemplate === tmpl.id ? 700 : 500 }}>{tmpl.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Message Editor */}
        <div className="input-group">
          <label className="input-label">Edit Message Text</label>
          <textarea
            className="input-field"
            rows={4}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="btn"
            style={{ flex: 2, background: '#25D366', color: '#0F0A1E', fontWeight: 700 }}
          >
            Send via WhatsApp <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
