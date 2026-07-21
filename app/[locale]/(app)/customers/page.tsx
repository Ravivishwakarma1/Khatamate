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
import { Plus, ArrowUpDown, Users } from 'lucide-react';
import styles from './customers.module.css';

export default function CustomersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tCust = useTranslations('customers');
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'advance' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'outstanding' | 'name' | 'recent'>('outstanding');

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

  const processedCustomers = useMemo(() => {
    let result = searchCustomers(customers, searchQuery);

    if (filter === 'overdue') {
      result = result.filter((c) => c.outstanding_due > 0 && c.is_active);
    } else if (filter === 'advance') {
      result = result.filter((c) => c.advance_balance > 0 && c.is_active);
    } else if (filter === 'inactive') {
      result = result.filter((c) => !c.is_active);
    } else {
      result = result.filter((c) => c.is_active);
    }

    result.sort((a, b) => {
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
  }, [customers, searchQuery, filter, sortBy]);

  const handleTransactionSuccess = (updatedCust: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
    toast.success(`Ledger updated for ${updatedCust.name}`);
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Page Title & Add CTA */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Customer Ledger</h1>
          <p className={styles.subtitle}>
            {customers.length} total customer accounts
          </p>
        </div>

        <button onClick={() => setShowAddCustomer(true)} className="btn btn-accent">
          <Plus size={18} /> Add New Customer
        </button>
      </div>

      {/* Search & Control Bar */}
      <div className={styles.controlsWrap}>
        <CustomerSearch query={searchQuery} onChange={setSearchQuery} />

        <div className={styles.filterSortBar}>
          {/* Filter Chips */}
          <div className={styles.filterChips}>
            {[
              { id: 'all', label: 'All Active' },
              { id: 'overdue', label: '🔴 Has Udhar Dues' },
              { id: 'advance', label: '🟡 Has Advance' },
              { id: 'inactive', label: 'Inactive' },
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
              <option value="outstanding">Highest Udhar Dues</option>
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
