'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Store, Languages, Coins, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '../auth.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'en';
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from('shops').insert({
          owner_id: user.id,
          name: shopName || 'My Kirana Store',
          address: shopAddress,
          phone: shopPhone,
          gst_number: gstNumber,
          currency: currency,
          settings: {
            language: selectedLanguage,
            dark_mode: true,
            pin_enabled: false,
          },
        });
        if (error) console.warn('Supabase store save note:', error.message);
      }

      const shopInfo = {
        name: shopName || 'My Kirana Store',
        address: shopAddress,
        phone: shopPhone,
        currency,
        language: selectedLanguage,
      };
      localStorage.setItem('khataflow_shop', JSON.stringify(shopInfo));

      toast.success('Store setup completed!');
      router.push(`/${selectedLanguage}/dashboard`);
      router.refresh();
    } catch (err) {
      router.push(`/${selectedLanguage}/dashboard`);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div>
      {/* Step Progress Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '8px' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: 'var(--radius-full)',
              background: step >= s ? 'var(--gradient-accent)' : 'var(--bg-surface)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <div className={styles.brandHeader}>
            <div className={styles.brandIcon}>
              <Store size={28} />
            </div>
            <h2 className={styles.brandTitle}>Step 1: Shop Details</h2>
            <p className={styles.brandSub}>Enter your business details for receipts</p>
          </div>

          {validationError && (
            <div className={styles.errorBox}>{validationError}</div>
          )}

          <div className="input-group">
            <label className="input-label">Shop / Store Name *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Laxmi General Store"
              value={shopName}
              onChange={(e) => {
                setShopName(e.target.value);
                setValidationError('');
              }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Store Address / Area</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Market Road, Sector 4"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Business Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="+91 98765 43210"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              if (!shopName.trim()) {
                setValidationError('Please enter your shop name.');
                return;
              }
              setStep(2);
            }}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
          >
            Next: Language Selection <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className={styles.brandHeader}>
            <div className={styles.brandIcon} style={{ background: 'var(--gradient-accent)', color: '#0F0A1E' }}>
              <Languages size={28} />
            </div>
            <h2 className={styles.brandTitle}>Step 2: Choose Language</h2>
            <p className={styles.brandSub}>Select primary language for your ledger UI</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
              { code: 'mr', label: 'Marathi', native: 'मराठी' },
              { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
              { code: 'te', label: 'Telugu', native: 'తెలుగు' },
              { code: 'bn', label: 'Bengali', native: 'বাংলা' },
              { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
              { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
            ].map((lang) => (
              <div
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedLanguage === lang.code ? 'rgba(0, 201, 167, 0.15)' : 'var(--bg-input)',
                  border: selectedLanguage === lang.code ? '2px solid var(--accent)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', color: selectedLanguage === lang.code ? 'var(--accent)' : 'var(--text)' }}>
                  {lang.native}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lang.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
              Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}>
              Next: Currency <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <div className={styles.brandHeader}>
            <div className={styles.brandIcon} style={{ background: 'var(--gradient-gold)' }}>
              <Coins size={28} />
            </div>
            <h2 className={styles.brandTitle}>Step 3: Currency</h2>
            <p className={styles.brandSub}>Set default currency symbol for your transactions</p>
          </div>

          <div className="input-group" style={{ marginBottom: '28px' }}>
            <label className="input-label">Select Currency</label>
            <select
              className="input-field"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ appearance: 'none' }}
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="AED">د.إ AED (UAE Dirham)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>
              Back
            </button>
            <button
              onClick={handleCompleteOnboarding}
              disabled={loading}
              className="btn btn-accent"
              style={{ flex: 2 }}
            >
              {loading ? 'Launching Dashboard...' : 'Complete & Launch'}
              {!loading && <CheckCircle2 size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
