'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { isPinEnabled, setSecurityPin, disableSecurityPin } from '@/lib/pin';
import { importFullBackup } from '@/lib/restore';
import { exportFullBackup } from '@/lib/export';
import { getAllLocalCustomers, clearAllLocalData } from '@/lib/db/idb';
import PinLockOverlay from '@/components/auth/PinLockOverlay';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  Store,
  Lock,
  Globe,
  HardDrive,
  User,
  LogOut,
  Upload,
  Download,
  CheckCircle2,
  KeyRound,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'en';
  const tSet = useTranslations('settings');
  const toast = useToast();

  const [shopName, setShopName] = useState('My Kirana Store');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // PIN security states
  const [pinActive, setPinActive] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showTestPinLock, setShowTestPinLock] = useState(false);

  // Confirm dialog state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setPinActive(isPinEnabled());
    const saved = localStorage.getItem('khataflow_shop');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setShopName(parsed.name);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.gst_number) setGstNumber(parsed.gst_number);
      } catch (e) {}
    }
  }, []);

  const handleSaveProfile = () => {
    const shopData = { name: shopName, address, phone, gst_number: gstNumber };
    localStorage.setItem('khataflow_shop', JSON.stringify(shopData));
    toast.success('Shop profile saved successfully!');
  };

  const handleTogglePin = (enabled: boolean) => {
    if (enabled) {
      setShowPinSetup(true);
    } else {
      disableSecurityPin();
      setPinActive(false);
      toast.info('PIN Lock disabled');
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    setSecurityPin(newPin);
    setPinActive(true);
    setShowPinSetup(false);
    setNewPin('');
    toast.success('Security PIN enabled successfully!');
  };

  const handleLanguageChange = (newLocale: string) => {
    const pathSegments = window.location.pathname.split('/');
    pathSegments[1] = newLocale;
    const newPath = pathSegments.join('/') || `/${newLocale}`;
    window.location.href = newPath;
  };

  const handleConfirmClearData = async () => {
    await clearAllLocalData();
    setShowClearConfirm(false);
    toast.success('All local database records cleared');
    window.location.reload();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importFullBackup(text);
      toast.success(`Restored ${result.customersCount} customers & ${result.transactionsCount} transactions!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to restore backup file');
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('khataflow_user');
    document.cookie = 'khataflow_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
    document.cookie = 'khataflow_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
    window.location.href = `/${currentLocale}/login`;
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{tSet('title')}</h1>
        <p className={styles.subtitle}>
          {tSet('subtext')}
        </p>
      </div>

      <div className={styles.grid}>
        {/* Shop Profile Card */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <Store size={22} color="var(--primary-light)" />
            <h3 className={styles.cardTitle}>{tSet('shopProfile')}</h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
            <div className="input-group">
              <label className="input-label">{tSet('shopName')}</label>
              <input
                type="text"
                required
                className="input-field"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{tSet('address')}</label>
              <input
                type="text"
                className="input-field"
                placeholder="Market Road, Sector 4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{tSet('phone')}</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{tSet('gstNumber')}</label>
              <input
                type="text"
                className="input-field"
                placeholder="22AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {tSet('saveProfile')}
            </button>
          </form>
        </div>

        {/* Security & PIN Lock Card */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <Lock size={22} color="var(--accent)" />
            <h3 className={styles.cardTitle}>{tSet('appPinSecurity')}</h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: '1.5', marginBottom: '20px' }}>
            {tSet('pinDesc')}
          </p>

          <label className={styles.switchBox}>
            <span style={{ fontWeight: 600 }}>{tSet('enablePin')}</span>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={pinActive}
              onChange={(e) => handleTogglePin(e.target.checked)}
            />
          </label>

          {pinActive && (
            <div className={styles.buttonCol}>
              <button onClick={() => setShowPinSetup(true)} className="btn btn-secondary" style={{ width: '100%' }}>
                <KeyRound size={16} /> {tSet('changePin')}
              </button>

              <button onClick={() => setShowTestPinLock(true)} className="btn btn-ghost" style={{ width: '100%', color: 'var(--accent)' }}>
                {tSet('testPin')}
              </button>
            </div>
          )}
        </div>

        {/* Language & Regional Settings */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <Globe size={22} color="var(--gold)" />
            <h3 className={styles.cardTitle}>{tSet('languageLocale')}</h3>
          </div>

          <div className="input-group">
            <label className="input-label">{tSet('selectLanguage')}</label>
            <select
              className="input-field"
              value={currentLocale}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="en">English (English)</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="mr">Marathi (मराठी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="gu">Gujarati (ગુજરાતી)</option>
              <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
            </select>
          </div>
        </div>

        {/* Data Backup & Restore Card */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <HardDrive size={22} color="var(--coral)" />
            <h3 className={styles.cardTitle}>{tSet('backupRestore')}</h3>
          </div>

          <div className={styles.buttonCol}>
            <button
              onClick={async () => {
                const custs = await getAllLocalCustomers();
                exportFullBackup(custs, []);
                toast.success('Backup file exported');
              }}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <Download size={16} /> {tSet('exportBackup')}
            </button>

            <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
              <Upload size={16} /> {tSet('importBackup')}
              <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Account & Data Reset Card */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <User size={22} color="var(--primary-light)" />
            <h3 className={styles.cardTitle}>{tSet('accountSession')}</h3>
          </div>

          <div className={styles.buttonCol}>
            <button onClick={() => setShowClearConfirm(true)} className="btn btn-secondary" style={{ width: '100%', color: 'var(--gold)' }}>
              <Trash2 size={16} /> {tSet('clearAllData')}
            </button>

            <button onClick={handleLogout} className="btn btn-coral" style={{ width: '100%' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="modal-overlay" onClick={() => setShowPinSetup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: '12px' }}>Set 4-Digit Security PIN</h2>
            <form onSubmit={handleSaveNewPin}>
              <div className="input-group">
                <label className="input-label">Enter 4 Numerical Digits</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  autoFocus
                  className="input-field"
                  placeholder="1234"
                  style={{ fontSize: '1.4rem', letterSpacing: '0.4em', textAlign: 'center' }}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowPinSetup(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Clear Data Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Local Data?"
        message="Are you sure you want to clear all local customer records and ledger transactions? This action cannot be undone unless you have a backup file."
        confirmLabel="Clear Everything"
        variant="danger"
        onConfirm={handleConfirmClearData}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Test PIN Lock Screen */}
      {showTestPinLock && (
        <PinLockOverlay onUnlock={() => setShowTestPinLock(false)} />
      )}
    </div>
  );
}
