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

export default function DashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tDash = useTranslations('dashboard');
  const toast = useToast();
  const activeShop = useShopStore((state) => state.activeShop);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Filter by active shop or include legacy customers
        const filtered = list.filter(
          (c) => !c.shop_id || c.shop_id === activeShop?.id || c.shop_id === 'shop_demo' || c.shop_id === 'shop_main'
        );
        setCustomers(filtered);
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

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Financial Metrics Calculation
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding_due || 0), 0);
  const activeCount = customers.filter((c) => c.is_active).length;
  const overdueCount = customers.filter((c) => c.outstanding_due > 0).length;

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
            {getGreeting()}, {shopName}! <Sparkles size={20} className="text-accent" />
          </h1>
          <p className={styles.subtext}>
            {tDash('summarySubtext')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAddCustomer(true)} className="btn btn-secondary">
            <UserPlus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {/* Total Receivables */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>TOTAL RECEIVABLES</span>
            <div className={styles.kpiIconBox} style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--coral)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className={`${styles.kpiValue} text-coral`}>
            ₹ {totalOutstanding.toFixed(2)}
          </div>
          <p className={styles.kpiSub}>
            Total outstanding credit (Udhar) across {overdueCount} accounts
          </p>
        </div>

        {/* Active Accounts */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>ACTIVE CUSTOMERS</span>
            <div className={styles.kpiIconBox} style={{ background: 'rgba(0, 201, 167, 0.15)', color: 'var(--accent)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {activeCount}
          </div>
          <p className={styles.kpiSub}>
            Registered customer accounts in local database
          </p>
        </div>

        {/* Overdue Accounts Warning */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>OVERDUE DUES</span>
            <div className={styles.kpiIconBox} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className={`${styles.kpiValue} text-gold`}>
            {overdueCount}
          </div>
          <p className={styles.kpiSub}>
            Customers with pending balances requiring reminder
          </p>
        </div>
      </div>

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
    </div>
  );
}
