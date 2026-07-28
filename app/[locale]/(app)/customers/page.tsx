'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Customer } from '@/lib/db/schema';
import { getAllLocalCustomers } from '@/lib/db/idb';
import { searchCustomers } from '@/lib/fuzzy';
import CustomerSearch from '@/components/customers/CustomerSearch';
import CustomerCard from '@/components/customers/CustomerCard';
import AddCustomerModal from '@/components/modals/AddCustomerModal';
import AddCreditModal from '@/components/modals/AddCreditModal';
import RecordPaymentModal from '@/components/modals/RecordPaymentModal';
import SendReminderModal from '@/components/modals/SendReminderModal';
import { SkeletonList } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { parseAndImportCustomersCSV } from '@/lib/import';
import { calculateCollectionPriorityScore } from '@/lib/finance';
import { Plus, ArrowUpDown, Users, Upload, Truck } from 'lucide-react';
import styles from './customers.module.css';

export default function CustomersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tCust = useTranslations('customers');
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'advance' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'outstanding' | 'priority' | 'name' | 'recent'>('outstanding');

  // Modal active states
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [activeCreditCustomer, setActiveCreditCustomer] = useState<Customer | null>(null);
  const [activePaymentCustomer, setActivePaymentCustomer] = useState<Customer | null>(null);
  const [activeReminderCustomer, setActiveReminderCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getAllLocalCustomers();
        setCustomers(list);
      } catch (err) {
        console.error('Failed to load customers from IndexedDB:', err);
        toast.error('Failed to load customer list');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCsvFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const csvText = evt.target?.result as string;
      if (csvText) {
        const count = await parseAndImportCustomersCSV(csvText, 'shop_main', activeTab);
        toast.success(`Imported ${count} ${activeTab} records!`);
        const updated = await getAllLocalCustomers();
        setCustomers(updated);
      }
    };
    reader.readAsText(file);
  };

  const processedCustomers = useMemo(() => {
    let result = searchCustomers(customers, searchQuery);

    // Filter by tab type
    result = result.filter((c) => (c.entity_type || 'customer') === activeTab);

    if (filter === 'overdue') {
      result = result.filter((c) => c.outstanding_due > 0 && c.is_active);
    } else if (filter === 'advance') {
      result = result.filter((c) => c.advance_balance > 0 && c.is_active);
    } else if (filter === 'regular') {
      result = result.filter((c) => c.is_regular);
    } else {
      result = result.filter((c) => c.is_active);
    }

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        return calculateCollectionPriorityScore(b) - calculateCollectionPriorityScore(a);
      }
      if (sortBy === 'outstanding') {
        return b.outstanding_due - a.outstanding_due;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'recent') {
        const timeA = a.last_transaction_at ? new Date(a.last_transaction_at).getTime() : 0;
        const timeB = b.last_transaction_at ? new Date(b.last_transaction_at).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [customers, searchQuery, filter, sortBy, activeTab]);

  const handleTransactionSuccess = (updatedCust: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
    toast.success(`Ledger updated for ${updatedCust.name}`);
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* 2-Tab Switcher: Customers vs Suppliers */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className="btn"
          style={{
            background: activeTab === 'customer' ? 'var(--gradient-coral)' : 'var(--bg-card)',
            color: activeTab === 'customer' ? '#FFF' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          👥 Customers (Grahak)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('supplier')}
          className="btn"
          style={{
            background: activeTab === 'supplier' ? 'var(--gradient-coral)' : 'var(--bg-card)',
            color: activeTab === 'supplier' ? '#FFF' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          🚚 Suppliers (Wholesalers)
        </button>
      </div>

      {/* Page Title & Add CTA */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>
            {activeTab === 'customer' ? 'Customer Udhar Ledger' : 'Supplier Credit Ledger'}
          </h1>
          <p className={styles.subtitle}>
            {processedCustomers.length} registered {activeTab} accounts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} /> Import CSV
            <input type="file" accept=".csv" onChange={handleCsvFileImport} style={{ display: 'none' }} />
          </label>
          <button onClick={() => setShowAddCustomer(true)} className="btn btn-accent">
            <Plus size={18} /> Add {activeTab === 'customer' ? 'Customer' : 'Supplier'}
          </button>
        </div>
      </div>

      {/* Search & Control Bar */}
      <div className={styles.controlsWrap}>
        <CustomerSearch query={searchQuery} onChange={setSearchQuery} />

        <div className={styles.filterSortBar}>
          {/* Filter Chips */}
          <div className={styles.filterChips}>
            {[
              { id: 'all', label: 'All Accounts' },
              { id: 'overdue', label: activeTab === 'customer' ? '🔴 Udhar Pending' : '🔴 You Owe Dues' },
              { id: 'advance', label: '🟡 Has Advance' },
              { id: 'regular', label: '⭐ Regular Customer' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`${styles.filterChip} ${filter === f.id ? styles.filterChipActive : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className={styles.sortBox}>
            <ArrowUpDown size={14} />
            <span>Sort by:</span>
            <select
              className={`input-field ${styles.sortSelect}`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="outstanding">Highest Balance</option>
              <option value="priority">🚨 Highest Priority to Call</option>
              <option value="name">Name (A–Z)</option>
              <option value="recent">Most Recent Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List Container */}
      {loading ? (
        <SkeletonList count={5} />
      ) : processedCustomers.length === 0 ? (
        <div className={`glass-card ${styles.emptyState}`}>
          <Users size={48} style={{ opacity: 0.4 }} />
          <h3 className={styles.emptyTitle}>No Customers Found</h3>
          <p className={styles.emptyDesc}>
            {searchQuery ? `No matching results for "${searchQuery}".` : 'Get started by adding your first customer account.'}
          </p>
          <button onClick={() => setShowAddCustomer(true)} className="btn btn-accent">
            <Plus size={18} /> Add New Customer
          </button>
        </div>
      ) : (
        <div className={styles.listContainer}>
          {processedCustomers.map((cust) => (
            <CustomerCard
              key={cust.id}
              customer={cust}
              locale={locale}
              onAddCredit={(c) => setActiveCreditCustomer(c)}
              onRecordPayment={(c) => setActivePaymentCustomer(c)}
              onSendReminder={(c) => setActiveReminderCustomer(c)}
            />
          ))}
        </div>
      )}

      {/* Modal Triggers */}
      {showAddCustomer && (
        <AddCustomerModal
          existingCustomers={customers}
          onClose={() => setShowAddCustomer(false)}
          onCustomerAdded={(newC) => {
            setCustomers((prev) => [newC, ...prev]);
            toast.success(`Added customer ${newC.name}`);
          }}
        />
      )}

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

      {activeReminderCustomer && (
        <SendReminderModal
          customer={activeReminderCustomer}
          onClose={() => setActiveReminderCustomer(null)}
        />
      )}
    </div>
  );
}
