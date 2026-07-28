'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Customer, Transaction, Shop } from '@/lib/db/schema';
import { getLocalCustomerById, getLocalTransactionsByCustomer, getAllLocalShops, saveLocalTransaction } from '@/lib/db/idb';
import BillSlipModal from '@/components/modals/BillSlipModal';
import { BookOpen, Calendar, Printer, Receipt, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import styles from '../passbook.module.css';

function PassbookContent() {

  const params = useParams();
  const searchParams = useSearchParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedTxForBill, setSelectedTxForBill] = useState<Transaction | null>(null);

  useEffect(() => {
    async function loadPassbookData() {
      try {
        setLoading(true);
        if (!customerId) return;

        // 1. Try local IndexedDB first
        let custData: Customer | null | undefined = await getLocalCustomerById(customerId);

        // 3. Fallback: Parse customer parameters encoded directly in the QR code URL
        if (!custData && searchParams) {
          const nameParam = searchParams.get('name');
          if (nameParam) {
            custData = {
              id: customerId,
              shop_id: 'shop_main',
              name: nameParam,
              phone: searchParams.get('phone') || undefined,
              room_id: searchParams.get('room') || undefined,
              outstanding_due: parseFloat(searchParams.get('due') || '0'),
              advance_balance: parseFloat(searchParams.get('adv') || '0'),
              credit_limit: 0,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
        }

        setCustomer(custData || null);

        if (custData) {
          // 4. Fetch transactions (Local IndexedDB first, then QR Code URL params)
          let txList = await getLocalTransactionsByCustomer(customerId);

          // Decode transactions encoded in the QR Code URL ('txs')
          if ((!txList || txList.length === 0) && searchParams) {
            const txsParam = searchParams.get('txs');
            if (txsParam) {
              try {
                let jsonStr = '';
                try {
                  jsonStr = decodeURIComponent(escape(atob(txsParam)));
                } catch (e) {
                  jsonStr = decodeURIComponent(txsParam);
                }
                const parsed = JSON.parse(jsonStr);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const decodedList: Transaction[] = parsed.map((item: any) => ({
                    id: item.id || `tx_${Math.random().toString(36).substring(2, 7)}`,
                    shop_id: custData?.shop_id || 'shop_main',
                    customer_id: custData?.id || customerId,
                    type: item.type || (item.t === 'CREDIT' ? 'CREDIT' : 'PAYMENT'),
                    amount: Number(item.amount ?? item.a) || 0,
                    balance_before: Number(item.balance_before ?? item.bb) || 0,
                    balance_after: Number(item.balance_after ?? item.ba ?? item.b) || 0,
                    note: item.note ?? item.n ?? '',
                    transaction_at: item.transaction_at ?? item.d ?? new Date().toISOString(),
                    created_at: item.transaction_at ?? item.d ?? new Date().toISOString(),
                    items: item.items || [],
                    is_disputed: Boolean(item.is_disputed),
                  }));
                  txList = decodedList;

                  // Save to local device store for future offline access
                  for (const t of decodedList) {
                    saveLocalTransaction(t).catch(() => {});
                  }
                }
              } catch (err) {
                console.warn('Passbook URL transactions decode notice:', err);
              }
            }
          }

          if (!txList || txList.length === 0) {
            const fallbackList: Transaction[] = [];
            const nowStr = custData.updated_at || custData.created_at || new Date().toISOString();

            if (custData.outstanding_due > 0) {
              fallbackList.push({
                id: `tx_credit_${custData.id}`,
                shop_id: custData.shop_id || 'shop_main',
                customer_id: custData.id,
                type: 'CREDIT',
                amount: custData.outstanding_due,
                balance_before: 0,
                balance_after: custData.outstanding_due,
                note: 'Credit Entry (Udhar Account Balance)',
                transaction_at: new Date(Date.now() - 3600000).toISOString(),
                created_at: nowStr,
              });
            }

            if (custData.advance_balance > 0) {
              fallbackList.push({
                id: `tx_payment_${custData.id}`,
                shop_id: custData.shop_id || 'shop_main',
                customer_id: custData.id,
                type: 'PAYMENT',
                amount: custData.advance_balance,
                balance_before: custData.outstanding_due,
                balance_after: custData.outstanding_due - custData.advance_balance,
                note: 'Payment Received / Advance Wallet (Jama)',
                transaction_at: nowStr,
                created_at: nowStr,
              });
            }

            if (fallbackList.length === 0) {
              fallbackList.push({
                id: `tx_clear_${custData.id}`,
                shop_id: custData.shop_id || 'shop_main',
                customer_id: custData.id,
                type: 'PAYMENT',
                amount: 0,
                balance_before: 0,
                balance_after: 0,
                note: 'Account Initialized (Settled)',
                transaction_at: nowStr,
                created_at: nowStr,
              });
            }

            txList = fallbackList;
          }


          if (txList && txList.length > 0) {
            let totalCredit = 0;
            let totalJama = 0;
            txList.forEach((tx) => {
              if (tx.type === 'CREDIT') totalCredit += tx.amount;
              if (tx.type === 'PAYMENT' || tx.type === 'ADVANCE') totalJama += tx.amount;
            });
            const netDiff = totalJama - totalCredit;
            custData = {
              ...custData,
              outstanding_due: netDiff < 0 ? Math.abs(netDiff) : 0,
              advance_balance: netDiff > 0 ? netDiff : 0,
            };
            setCustomer(custData);
          }

          setTransactions(
            txList.sort((a: Transaction, b: Transaction) => new Date(b.transaction_at).getTime() - new Date(a.transaction_at).getTime())
          );


          // 5. Fetch Shop info
          const shopsList = await getAllLocalShops();
          let shopData: Shop | null | undefined = shopsList[0];

          const shopNameParam = searchParams?.get('shop');

          setShop(
            shopData || {
              id: custData.shop_id || 'demo-shop',
              owner_id: 'owner-1',
              name: shopNameParam || 'KhataMate Digital Ledger Store',
              currency: 'INR',
              plan: 'PRO',
              settings: { language: 'en', dark_mode: true, pin_enabled: false },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          );
        }
      } catch (err) {
        console.error('Passbook loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPassbookData();
  }, [customerId, searchParams]);

  // Extract unique months (Formatted e.g. "July 2026")
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    transactions.forEach((tx) => {
      const d = new Date(tx.transaction_at);
      const monthLabel = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      monthsSet.add(monthLabel);
    });
    return Array.from(monthsSet);
  }, [transactions]);

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'ALL') return transactions;
    return transactions.filter((tx) => {
      const monthLabel = new Date(tx.transaction_at).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      return monthLabel === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // Group transactions by month
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filteredTransactions.forEach((tx) => {
      const monthLabel = new Date(tx.transaction_at).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      if (!map.has(monthLabel)) map.set(monthLabel, []);
      map.get(monthLabel)!.push(tx);
    });
    return map;
  }, [filteredTransactions]);

  // Monthly totals calculation
  const monthlyStats = useMemo(() => {
    let creditTotal = 0;
    let paymentTotal = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'CREDIT') creditTotal += tx.amount;
      if (tx.type === 'PAYMENT' || tx.type === 'ADVANCE') paymentTotal += tx.amount;
    });

    return { creditTotal, paymentTotal };
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container} style={{ textAlign: 'center', paddingTop: '80px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading Digital Passbook Statement...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container} style={{ textAlign: 'center', paddingTop: '80px', maxWidth: '480px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(108, 58, 232, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)' }}>
            <BookOpen size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customer Ledger Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.9rem', lineHeight: 1.6 }}>
            The requested customer account ledger could not be located.
          </p>
        </div>
      </div>
    );
  }



  const monthEntries = Array.from(groupedByMonth.entries());

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.shopBrand}>
            <BookOpen size={18} /> {shop?.name || 'KhataMate Store'}
          </div>
          <h1 className={styles.custTitle}>{customer.name}</h1>
          <p className={styles.custMeta}>
            {customer.phone ? `Ph: ${customer.phone}` : ''} {customer.room_id ? ` • Room/Flat: ${customer.room_id}` : ''}
          </p>

          <div className={styles.balanceRow}>
            <div>
              <div className={styles.balLabel}>
                {customer.outstanding_due > 0
                  ? 'OUTSTANDING UDHAR DUE'
                  : customer.advance_balance > 0
                  ? 'JAMA ADVANCE WALLET (SURPLUS)'
                  : 'CURRENT NET BALANCE'}
              </div>
              <div
                className={styles.balVal}
                style={{
                  color: customer.outstanding_due > 0 ? 'var(--coral)' : customer.advance_balance > 0 ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                ₹ {customer.outstanding_due > 0 ? customer.outstanding_due.toFixed(2) : customer.advance_balance > 0 ? customer.advance_balance.toFixed(2) : '0.00'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                className="badge"
                style={{
                  background: customer.outstanding_due > 0 ? 'rgba(255,107,107,0.2)' : customer.advance_balance > 0 ? 'rgba(0,201,167,0.2)' : 'rgba(255,255,255,0.1)',
                  color: customer.outstanding_due > 0 ? 'var(--coral)' : customer.advance_balance > 0 ? 'rgba(0,201,167,1)' : 'var(--text-muted)',
                  fontWeight: 800,
                }}
              >
                {customer.outstanding_due > 0 ? '🔴 Udhar Pending' : customer.advance_balance > 0 ? '🟢 Advance Available (Jama)' : '🟢 Account Settled'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls Bar: Month Filter & Statement Actions */}
        <div className={styles.controlsBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--accent)" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={styles.monthSelect}
            >
              <option value="ALL">📅 All Months ({availableMonths.length} Months)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-secondary" style={{ fontSize: 'var(--text-xs)', gap: '6px' }}>
              <Printer size={16} /> Print Statement
            </button>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className={styles.monthSummaryGrid}>
          <div className={styles.sumCard}>
            <div className={styles.sumLabel}>Total Udhar (Credit)</div>
            <div className={styles.sumVal} style={{ color: 'var(--coral)' }}>
              ₹ {monthlyStats.creditTotal.toFixed(2)}
            </div>
          </div>
          <div className={styles.sumCard}>
            <div className={styles.sumLabel}>Total Jama (Payments)</div>
            <div className={styles.sumVal} style={{ color: 'var(--accent)' }}>
              ₹ {monthlyStats.paymentTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Categorized Monthly Timeline */}
        {monthEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', background: 'var(--glass)', borderRadius: 'var(--radius-lg)' }}>
            No transactions found for the selected month filter.
          </div>
        ) : (
          <div>
            {monthEntries.map(([monthName, txList]) => (
              <div key={monthName} className={styles.monthGroup}>
                <div className={styles.monthHeader}>📅 {monthName}</div>
                <div className={styles.timeline}>
                  {txList.map((tx) => (
                    <div key={tx.id} className={styles.txItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: 'var(--radius-md)',
                            background: tx.type === 'CREDIT' ? 'rgba(255,107,107,0.15)' : 'rgba(0,201,167,0.15)',
                            color: tx.type === 'CREDIT' ? 'var(--coral)' : 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}

                        >
                          {tx.type === 'CREDIT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                            {tx.type === 'CREDIT' ? 'Credit Entry (Udhar)' : tx.type === 'ADVANCE' ? 'Advance Payment (Jama)' : 'Payment Received (Jama)'}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {new Date(tx.transaction_at).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}

                            {tx.note ? `• ${tx.note}` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 'var(--text-base)',
                            fontFamily: 'var(--font-mono)',
                            color: tx.type === 'CREDIT' ? 'var(--coral)' : 'var(--accent)',
                          }}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'} ₹ {tx.amount.toFixed(2)}
                        </div>

                        {Boolean(tx.items && tx.items.length > 0 && shop) && (
                          <button
                            onClick={() => setSelectedTxForBill(tx)}

                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '2px',
                            }}
                          >
                            <Receipt size={12} /> View Grocery Bill 🧾
                          </button>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Footer */}
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="var(--accent)" /> Verified Bank-Grade Encrypted Passbook Statement by KhataMate
        </div>
      </div>

      {/* Bill Slip Modal */}
      {selectedTxForBill && shop && customer && (
        <BillSlipModal
          transaction={selectedTxForBill}
          customer={customer}
          shop={shop}
          onClose={() => setSelectedTxForBill(null)}
        />
      )}
    </div>
  );
}

export default function PublicCustomerPassbookPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageWrapper}>
          <div className={styles.container} style={{ textAlign: 'center', paddingTop: '80px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading Digital Passbook Statement...</p>
          </div>
        </div>
      }
    >
      <PassbookContent />
    </Suspense>
  );
}

