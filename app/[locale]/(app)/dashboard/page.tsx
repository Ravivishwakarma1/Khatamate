'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Customer } from '@/lib/db/schema';
import { getAllLocalCustomers } from '@/lib/db/idb';
import { useShopStore } from '@/lib/shopStore';
import AddCreditModal from '@/components/modals/AddCreditModal';
import RecordPaymentModal from '@/components/modals/RecordPaymentModal';
import AddCustomerModal from '@/components/modals/AddCustomerModal';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  ArrowRight,
  Search,
  X,
  UserPlus,
  Sparkles
} from 'lucide-react';
import styles from '../dashboard.module.css';

import VoiceTutorialModal from '@/components/ui/VoiceTutorialModal';

export default function DashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tDash = useTranslations('dashboard');
  const toast = useToast();
  const activeShop = useShopStore((state) => state.activeShop);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Quick Action Modal States
  const [selectMode, setSelectMode] = useState<'credit' | 'payment' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCreditCustomer, setActiveCreditCustomer] = useState<Customer | null>(null);
  const [activePaymentCustomer, setActivePaymentCustomer] = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getAllLocalCustomers();
        const filtered = list.filter(
          (c) => !c.shop_id || c.shop_id === activeShop?.id || c.shop_id === 'shop_demo' || c.shop_id === 'shop_main'
        );
        setCustomers(filtered);

        // First-open tutorial check
        if (typeof window !== 'undefined' && !localStorage.getItem('khataflow_tutorial_seen')) {
          setShowTutorial(true);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        toast.error('Failed to load local database records');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeShop]);

  const shopName = activeShop?.name || 'My Shop';

  // 3-Number Display Calculations (Aaj: X liya, Y diya, Z bacha)
  const todayCustList = customers.filter((c) => (c.entity_type || 'customer') === 'customer');
  const todaySuppList = customers.filter((c) => c.entity_type === 'supplier');

  const totalCollectedToday = todayCustList.reduce((sum, c) => sum + (c.advance_balance || 0), 0);
  const totalGivenToday = todayCustList.reduce((sum, c) => sum + (c.outstanding_due || 0), 0);
  const netBalanceLeft = totalCollectedToday - totalGivenToday;

  const supplierDebtTotal = todaySuppList.reduce((sum, s) => sum + (s.outstanding_due || 0), 0);

  // Overdue Reminders Surfaced Automatically
  const overdueReminders = todayCustList.filter(
    (c) => c.outstanding_due > 0 && (c.promise_date ? new Date(c.promise_date) <= new Date() : true)
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.room_id && c.room_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectCustomer = (customer: Customer) => {
    if (selectMode === 'credit') {
      setActiveCreditCustomer(customer);
    } else if (selectMode === 'payment') {
      setActivePaymentCustomer(customer);
    }
    setSelectMode(null);
    setSearchQuery('');
  };

  const handleTransactionSuccess = (updatedCust: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
    toast.success(`Ledger updated for ${updatedCust.name}`);
  };

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h1 className={styles.greeting}>
            KhataMate Home • {shopName} <Sparkles size={20} className="text-accent" />
          </h1>
          <p className={styles.subtext}>
            Simple Kirana Ledger Companion
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowTutorial(true)} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
            🔊 Voice Guide
          </button>
          <button onClick={() => setShowAddCustomer(true)} className="btn btn-secondary">
            <UserPlus size={16} /> Add Account
          </button>
        </div>
      </div>

      {/* 3-NUMBER DISPLAY (Aaj: X liya, Y diya, Z bacha) */}
      <div
        style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(108, 58, 232, 0.25)',
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          📊 Aaj Ka Daily Ledger Display:
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ background: 'rgba(0, 201, 167, 0.15)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>Aaj Liya (Received)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
              ₹ {totalCollectedToday.toFixed(0)}
            </div>
          </div>

          <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--coral)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--coral)' }}>Aaj Diya (Udhar)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--coral)', marginTop: '4px' }}>
              ₹ {totalGivenToday.toFixed(0)}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 184, 0, 0.15)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)' }}>Net Customer Balance</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)', marginTop: '4px' }}>
              ₹ {Math.abs(netBalanceLeft).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Supplier Total Debt Badge */}
        {supplierDebtTotal > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px border var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>🚚 You Owe Suppliers (Distributors):</span>
            <span style={{ fontWeight: 800, color: 'var(--coral)', fontSize: '1.1rem' }}>₹ {supplierDebtTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Auto-surfaced Overdue Reminders Banner */}
      {overdueReminders.length > 0 && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid var(--gold)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 800, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={18} /> {overdueReminders.length} Payment Reminders Due Today
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {overdueReminders.slice(0, 3).map((rem) => (
              <a
                key={rem.id}
                href={`https://wa.me/${rem.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Namaste ${rem.name} ji, KhataMate app se aapka total pending udhar ₹${rem.outstanding_due.toFixed(
                    2
                  )} hai. Kripya payment karein.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px', background: 'rgba(0,201,167,0.2)', color: 'var(--emerald)' }}
              >
                📲 WhatsApp {rem.name} (₹{rem.outstanding_due.toFixed(0)})
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Hub */}
      <div className={styles.quickActionCard}>
        <h3 className={styles.quickActionTitle}>Quick Ledger Entry</h3>
        <p className={styles.quickActionSub}>Record transaction in 2 taps</p>

        <div className={styles.actionGrid}>
          <button
            onClick={() => setSelectMode('credit')}
            className={`btn btn-coral ${styles.bigActionBtn}`}
          >
            <PlusCircle size={22} />
            <span>Give Credit (Udhar)</span>
          </button>

          <button
            onClick={() => setSelectMode('payment')}
            className={`btn btn-accent ${styles.bigActionBtn}`}
          >
            <MinusCircle size={22} />
            <span>Accept Payment (Jama)</span>
          </button>
        </div>
      </div>

      {/* Quick Customer Picker Modal Overlay */}
      {selectMode && (
        <div className={styles.pickerOverlay} onClick={() => setSelectMode(null)}>
          <div className={styles.pickerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pickerHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Select Customer to {selectMode === 'credit' ? 'Give Credit' : 'Record Payment'}
              </h3>
              <button onClick={() => setSelectMode(null)} className="btn btn-ghost" style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                autoFocus
                className="input-field"
                placeholder="Search by name, phone, or room..."
                style={{ paddingLeft: '36px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.pickerList}>
              {filteredCustomers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching customers found.
                </div>
              ) : (
                filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className={styles.pickerItem}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {c.phone || 'No phone'} {c.room_id ? `• ${c.room_id}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: c.outstanding_due > 0 ? 'var(--coral)' : 'var(--accent)' }}>
                        ₹ {c.outstanding_due.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Due balance</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity List preview */}
      <div className={styles.recentSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className={styles.quickActionTitle} style={{ marginBottom: 0 }}>Top Accounts Requiring Attention</h3>
          <Link href={`/${locale}/customers`} className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
            View All Customers <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.customerGrid}>
          {customers
            .filter((c) => c.outstanding_due > 0)
            .slice(0, 4)
            .map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/customers/${c.id}`}
                className={styles.miniCard}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {c.phone || 'No phone'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="amount-negative" style={{ fontWeight: 800 }}>
                    ₹ {c.outstanding_due.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Tap for ledger</div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Modals */}
      {activeCreditCustomer && (
        <AddCreditModal
          customer={activeCreditCustomer}
          onClose={() => setActiveCreditCustomer(null)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {activePaymentCustomer && (
        <RecordPaymentModal
          customer={activePaymentCustomer}
          onClose={() => setActivePaymentCustomer(null)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {showAddCustomer && (
        <AddCustomerModal
          existingCustomers={customers}
          onClose={() => setShowAddCustomer(false)}
          onCustomerAdded={(newCust) => setCustomers((prev) => [newCust, ...prev])}
        />
      )}

      {showTutorial && (
        <VoiceTutorialModal onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
