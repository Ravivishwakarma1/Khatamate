'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Customer, Transaction } from '@/lib/db/schema';
import { getLocalCustomerById, getLocalTransactionsByCustomer } from '@/lib/db/idb';
import { useShopStore } from '@/lib/shopStore';
import AddCreditModal from '@/components/modals/AddCreditModal';
import RecordPaymentModal from '@/components/modals/RecordPaymentModal';
import SendReminderModal from '@/components/modals/SendReminderModal';
import WriteOffModal from '@/components/modals/WriteOffModal';
import DisputeModal from '@/components/modals/DisputeModal';
import CustomerQrModal from '@/components/modals/CustomerQrModal';
import BillSlipModal from '@/components/modals/BillSlipModal';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft,
  Phone,
  Home,
  PlusCircle,
  MinusCircle,
  MessageCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  QrCode,
  ShieldAlert,
  Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import styles from './customerDetail.module.css';

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const customerId = params?.id as string;
  const toast = useToast();
  const activeShop = useShopStore((state) => state.activeShop);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded transaction row state
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Active modal triggers
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showSendReminder, setShowSendReminder] = useState(false);
  const [showWriteOff, setShowWriteOff] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [disputeTx, setDisputeTx] = useState<Transaction | null>(null);
  const [selectedSlipTx, setSelectedSlipTx] = useState<Transaction | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');

  // Available unique months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      set.add(format(new Date(t.transaction_at), 'MMMM yyyy'));
    });
    return Array.from(set);
  }, [transactions]);

  // Filtered & grouped transactions by month
  const groupedTransactions = useMemo(() => {
    const filtered = selectedMonthFilter === 'ALL'
      ? transactions
      : transactions.filter((t) => format(new Date(t.transaction_at), 'MMMM yyyy') === selectedMonthFilter);

    const map = new Map<string, Transaction[]>();
    filtered.forEach((t) => {
      const mKey = format(new Date(t.transaction_at), 'MMMM yyyy');
      if (!map.has(mKey)) map.set(mKey, []);
      map.get(mKey)!.push(t);
    });
    return map;
  }, [transactions, selectedMonthFilter]);


  useEffect(() => {
    async function loadProfile() {
      try {
        const cust = await getLocalCustomerById(customerId);
        if (cust) {
          setCustomer(cust);
          const txs = await getLocalTransactionsByCustomer(customerId);
          setTransactions(txs);
        }
      } catch (err) {
        console.error('Error loading customer profile:', err);
        toast.error('Error loading customer details');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [customerId]);

  // Aggregate monthly data from real transactions
  const monthlyData = useMemo(() => {
    const monthsMap: { [key: string]: { month: string; credit: number; payment: number } } = {};
    const monthsOrder: string[] = [];

    // Pre-fill last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mKey = format(d, 'MMM yyyy');
      const label = format(d, 'MMM');
      monthsMap[mKey] = { month: label, credit: 0, payment: 0 };
      monthsOrder.push(mKey);
    }

    transactions.forEach((tx) => {
      const mKey = format(new Date(tx.transaction_at), 'MMM yyyy');
      if (monthsMap[mKey]) {
        if (tx.type === 'CREDIT') {
          monthsMap[mKey].credit += tx.amount;
        } else if (tx.type === 'PAYMENT') {
          monthsMap[mKey].payment += tx.amount;
        }
      }
    });

    return monthsOrder.map((key) => monthsMap[key]);
  }, [transactions]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Skeleton height={200} />
        <Skeleton height={250} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Customer Not Found</h2>
        <Link href={`/${locale}/customers`} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Customer List
        </Link>
      </div>
    );
  }

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleTransactionSuccess = (updatedCust: Customer, newTx: Transaction) => {
    setCustomer(updatedCust);
    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Transaction recorded successfully`);
  };

  const handleDisputeSuccess = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
    toast.info(`Dispute status updated`);
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <Link href={`/${locale}/customers`} className="btn btn-ghost" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className={styles.pageTitle}>Customer Profile</h1>
      </div>

      {/* Customer Header Card */}
      <div className={`glass-card ${styles.headerCard}`}>
        <div className={styles.headerMain}>
          <div className={styles.profileInfo}>
            <div
              className={`${styles.avatar} ${
                customer.advance_balance > 0
                  ? styles.avatarAdvance
                  : customer.outstanding_due > 0
                  ? styles.avatarOverdue
                  : styles.avatarNormal
              }`}
            >
              {initials}
            </div>

            <div>
              <h2 className={styles.custName}>{customer.name}</h2>
              <div className={styles.custMeta}>
                {customer.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} /> {customer.phone}
                  </span>
                )}
                {customer.room_id && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Home size={14} /> {customer.room_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Balance Cards */}
          <div className={styles.balanceGrid}>
            <div className={styles.balanceWidget}>
              <span className={styles.balanceLabel}>OUTSTANDING DUE</span>
              <div className={`${styles.balanceAmount} text-coral`}>
                ₹ {customer.outstanding_due.toFixed(2)}
              </div>
            </div>

            {customer.advance_balance > 0 && (
              <div className={styles.balanceWidget}>
                <span className={styles.balanceLabel}>ADVANCE WALLET</span>
                <div className={`${styles.balanceAmount} text-gold`}>
                  ₹ {customer.advance_balance.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Button Bar */}
        <div className={styles.actionBar}>
          <button onClick={() => setShowAddCredit(true)} className={`btn btn-coral ${styles.actionBtnFlex}`}>
            <PlusCircle size={18} /> Add Credit
          </button>

          <button onClick={() => setShowRecordPayment(true)} className={`btn btn-accent ${styles.actionBtnFlex}`}>
            <MinusCircle size={18} /> Record Payment
          </button>

          {customer.outstanding_due > 0 && customer.phone && (
            <button onClick={() => setShowSendReminder(true)} className={`btn ${styles.whatsappBtn}`}>
              <MessageCircle size={18} /> Send WhatsApp
            </button>
          )}

          {customer.outstanding_due > 0 && (
            <button onClick={() => setShowWriteOff(true)} className="btn btn-secondary" style={{ color: 'var(--coral)' }}>
              <ShieldAlert size={18} /> Write Off
            </button>
          )}

          <button onClick={() => setShowQrModal(true)} className="btn btn-secondary">
            <QrCode size={18} /> QR Card
          </button>

          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* Monthly Chart & Analytics Summary */}
      <div className={`glass-card ${styles.timelineCard}`}>
        <h3 className={styles.timelineTitle}>6-Month Credit vs. Payment Trend</h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#FFF' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="credit" name="Credit (Udhar)" fill="var(--coral)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="payment" name="Payment (Jama)" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Timeline */}
      <div className={`glass-card ${styles.timelineCard}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className={styles.timelineTitle} style={{ margin: 0 }}>Transaction Ledger Timeline</h3>
          {availableMonths.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Month:</span>
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">📅 All Months ({availableMonths.length})</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {groupedTransactions.size === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recorded transactions found for the selected month filter.
          </div>
        ) : (
          <div className={styles.txList}>
            {Array.from(groupedTransactions.entries()).map(([monthName, monthTxs]) => (
              <div key={monthName} style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'var(--accent)',
                    background: 'rgba(108, 58, 232, 0.15)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '10px',
                    display: 'inline-block',
                  }}
                >
                  📅 {monthName}
                </div>
                {monthTxs.map((tx) => {

              const isExpanded = expandedTxId === tx.id;
              const isCredit = tx.type === 'CREDIT';
              const isWriteOff = tx.type === 'WRITEOFF';
              const color = isWriteOff ? '#A89BC2' : isCredit ? 'var(--coral)' : tx.type === 'PAYMENT' ? 'var(--accent)' : 'var(--gold)';

              return (
                <div
                  key={tx.id}
                  className={styles.txRow}
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div
                    onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                    className={styles.txHeader}
                  >
                    <div className={styles.txLeft}>
                      <span className={`badge ${isCredit ? 'badge-credit' : tx.type === 'PAYMENT' ? 'badge-payment' : 'badge-advance'}`}>
                        {tx.type}
                      </span>

                      {tx.is_disputed && (
                        <span className={styles.disputeBadge}>
                          ⚠️ DISPUTED
                        </span>
                      )}

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tx.note || (isCredit ? 'Credit Entry' : 'Payment Received')}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {format(new Date(tx.transaction_at), 'dd MMM yyyy, hh:mm a')}
                        </div>
                      </div>
                    </div>

                    <div className={styles.txRight}>
                      <div style={{ textAlign: 'right' }}>
                        <div className={styles.txAmount} style={{ color }}>
                          {isCredit ? `+ ₹${tx.amount.toFixed(2)}` : `- ₹${tx.amount.toFixed(2)}`}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Balance: ₹{tx.balance_after.toFixed(2)}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded Itemized & Dispute Controls View */}
                  {isExpanded && (
                    <div className={styles.txExpanded}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <span>Balance Before: ₹{tx.balance_before.toFixed(2)}</span>
                        <span>Balance After: ₹{tx.balance_after.toFixed(2)}</span>
                      </div>

                      {tx.items && tx.items.length > 0 && (
                        <div className={styles.itemsBox}>
                          <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>Purchased Items:</div>
                          {tx.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
                              <span>{item.name} ({item.qty}x @ ₹{item.price})</span>
                              <span style={{ fontWeight: 600, color: 'var(--text)' }}>₹{item.subtotal}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlipTx(tx);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Receipt size={14} color="var(--emerald)" /> View / Share Bill Slip
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDisputeTx(tx);
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', color: tx.is_disputed ? 'var(--accent)' : 'var(--gold)' }}
                        >
                          <AlertTriangle size={14} /> {tx.is_disputed ? 'Manage Dispute' : 'Flag as Disputed'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Active Modals */}
      {showAddCredit && (
        <AddCreditModal
          customer={customer}
          onClose={() => setShowAddCredit(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {showRecordPayment && (
        <RecordPaymentModal
          customer={customer}
          onClose={() => setShowRecordPayment(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {showSendReminder && (
        <SendReminderModal
          customer={customer}
          onClose={() => setShowSendReminder(false)}
        />
      )}

      {showWriteOff && (
        <WriteOffModal
          customer={customer}
          onClose={() => setShowWriteOff(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {showQrModal && (
        <CustomerQrModal
          customer={customer}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {disputeTx && (
        <DisputeModal
          transaction={disputeTx}
          onClose={() => setDisputeTx(null)}
          onSuccess={handleDisputeSuccess}
        />
      )}

      {selectedSlipTx && (
        <BillSlipModal
          transaction={selectedSlipTx}
          customer={customer}
          shop={activeShop}
          onClose={() => setSelectedSlipTx(null)}
        />
      )}
    </div>
  );
}

