'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BookOpen, Globe, LogOut, Store, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useShopStore } from '@/lib/shopStore';
import { signOutUser } from '@/lib/firebase/auth';
import AddShopModal from '@/components/modals/AddShopModal';
import styles from './Header.module.css';

export default function Header() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'en';
  const tCommon = useTranslations('common');

  const { activeShop, shops, loadShops, setActiveShop } = useShopStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (e) {}
    window.location.href = `/${locale}/login`;
  };


  const handleShopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setShowAddModal(true);
    } else {
      const selected = shops.find((s) => s.id === val);
      if (selected) {
        setActiveShop(selected);
      }
    }
  };

  return (
    <>
      <header className={styles.header}>
        {/* Left Title / Store Switcher */}
        <div className={styles.leftSection}>
          <div className={styles.logoIcon}>
            <BookOpen size={20} />
          </div>
          <div className={styles.shopInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={14} color="var(--gold)" />
              <select
                value={activeShop?.id || ''}
                onChange={handleShopChange}
                style={{
                  background: 'transparent',
                  color: 'var(--text)',
                  border: 'none',
                  fontSize: 'var(--text-base)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  outline: 'none',
                  paddingRight: '4px',
                }}
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id} className={styles.langOption}>
                    {s.name}
                  </option>
                ))}
                <option value="__ADD_NEW__" className={styles.langOption} style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  + Add New Store / Branch
                </option>

              </select>
            </div>
            <span className={styles.syncBadge}>
              <span className="status-dot status-dot-active" /> {tCommon('onlineSync')}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className={styles.rightSection}>
          {/* Quick Add Store Button (Desktop) */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Add New Store"
          >
            <Plus size={14} color="var(--emerald)" />
            <span>New Store</span>
          </button>

          {/* Language dropdown */}
          <div className={styles.langDropdown}>
            <Globe size={16} color="var(--gold)" />
            <select
              className={styles.langSelect}
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value;
                const newPath = pathname ? pathname.replace(`/${locale}`, `/${newLocale}`) : `/${newLocale}`;
                window.location.href = newPath;
              }}
            >
              <option value="en" className={styles.langOption}>English</option>
              <option value="hi" className={styles.langOption}>हिन्दी (Hindi)</option>
              <option value="mr" className={styles.langOption}>मराठी (Marathi)</option>
              <option value="ta" className={styles.langOption}>தமிழ் (Tamil)</option>
              <option value="te" className={styles.langOption}>తెలుగు (Telugu)</option>
              <option value="bn" className={styles.langOption}>বাংলা (Bengali)</option>
              <option value="gu" className={styles.langOption}>ગુજરાતી (Gujarati)</option>
              <option value="pa" className={styles.langOption}>ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>

          {/* User profile / Logout */}
          <button
            onClick={handleLogout}
            className={styles.actionIconBtn}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {showAddModal && (
        <AddShopModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

