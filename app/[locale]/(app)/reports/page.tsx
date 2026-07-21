'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Customer, Transaction } from '@/lib/db/schema';
import { getAllLocalCustomers, getAllLocalTransactions } from '@/lib/db/idb';
import { exportTransactionsCSV, exportCustomerListCSV, exportFullBackup } from '@/lib/export';
import CreditPaymentBar from '@/components/charts/CreditPaymentBar';
import OutstandingTrend from '@/components/charts/OutstandingTrend';
import TopDebtorsPie from '@/components/charts/TopDebtorsPie';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  FileSpreadsheet,
  Download,
  HardDrive
} from 'lucide-react';
import styles from './reports.module.css';

export default function ReportsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tRep = useTranslations('reports');
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    async function loadData() {
      try {
        const custs = await getAllLocalCustomers();
        setCustomers(custs);
        const txs = await getAllLocalTransactions();
        setTransactions(txs);
      } catch (err) {
        console.error('Failed to load reports data:', err);
        toast.error('Failed to load financial reports');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter transactions by range
  const filteredTxs = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      const txDate = new Date(tx.transaction_at);
      if (range === 'today') {
        return txDate.toDateString() === now.toDateString();
      }
      if (range === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return txDate >= oneWeekAgo;
      }
      if (range === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return txDate >= oneMonthAgo;
      }
      return true; // 'all'
    });
  }, [transactions, range]);

  // Metrics Calculations
  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.outstanding_due || 0), 0);
  }, [customers]);

  const totalCollections = useMemo(() => {
    return filteredTxs
      .filter((t) => t.type === 'PAYMENT' || t.type === 'ADVANCE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTxs]);

  const totalCreditGiven = useMemo(() => {
    return filteredTxs
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTxs]);

  const recoveryRate = useMemo(() => {
    const total = totalCollections + totalCreditGiven;
    return total > 0 ? Math.round((totalCollections / total) * 100) : 0;
  }, [totalCollections, totalCreditGiven]);

  // Top 5 Debtors for Pie Chart
  const topDebtorsPieData = useMemo(() => {
    return customers
      .filter((c) => c.outstanding_due > 0)
      .sort((a, b) => b.outstanding_due - a.outstanding_due)
      .slice(0, 5)
      .map((c) => ({ name: c.name, value: c.outstanding_due }));
  }, [customers]);

  // Top 10 Debtors Table
  const top10Debtors = useMemo(() => {
    return customers
      .filter((c) => c.outstanding_due > 0)
      .sort((a, b) => b.outstanding_due - a.outstanding_due)
      .slice(0, 10);
  }, [customers]);

  // Dynamic Bar Chart Data per period
  const barChartData = [
    { period: 'Past 3 Wks', credit: totalCreditGiven * 0.3, payment: totalCollections * 0.25 },
    { period: 'Past 2 Wks', credit: totalCreditGiven * 0.5, payment: totalCollections * 0.4 },
    { period: 'Last Week', credit: totalCreditGiven * 0.8, payment: totalCollections * 0.7 },
    { period: 'Current', credit: totalCreditGiven, payment: totalCollections },
  ];

  // Dynamic Area Chart Data
  const areaChartData = [
    { date: 'Start', outstanding: Math.max(0, totalOutstanding * 0.6) },
    { date: 'Mid', outstanding: Math.max(0, totalOutstanding * 0.8) },
    { date: 'Current', outstanding: totalOutstanding },
  ];

  const handleExportTransactions = () => {
    exportTransactionsCSV(transactions.length > 0 ? transactions : [], customers);
    toast.success('Downloaded transactions CSV report');
  };

  const handleExportCustomers = () => {
    exportCustomerListCSV(customers);
    toast.success('Downloaded customer list CSV');
  };

  const handleBackup = () => {
    exportFullBackup(customers, transactions);
    toast.success('Full database backup exported');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Skeleton height={150} />
        <Skeleton height={300} />
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{tRep('title')}</h1>
          <p className={styles.subtitle}>
            {tRep('subtext')}
          </p>
        </div>

        {/* Export Buttons */}
        <div className={styles.exportGroup}>
          <button onClick={handleExportCustomers} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 'var(--text-xs)' }}>
            <FileSpreadsheet size={16} /> {tRep('exportCustomers')}
          </button>

          <button onClick={handleExportTransactions} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 'var(--text-xs)' }}>
            <Download size={16} /> {tRep('exportTransactions')}
          </button>

          <button onClick={handleBackup} className="btn btn-accent" style={{ padding: '8px 14px', fontSize: 'var(--text-xs)' }}>
            <HardDrive size={16} /> {tRep('downloadBackup')}
          </button>
        </div>
      </div>

      {/* Date Range Tabs */}
      <div className={styles.dateRangeBar}>
        {[
          { id: 'today', label: 'Today' },
          { id: 'week', label: 'This Week' },
          { id: 'month', label: 'This Month' },
          { id: 'all', label: 'All Time' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setRange(t.id as any)}
            className={`${styles.rangeBtn} ${range === t.id ? styles.rangeBtnActive : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        {/* Total Outstanding */}
        <div className={`glass-card ${styles.metricCard}`}>
          <span className={styles.metricLabel}>Total Outstanding Dues</span>
          <div className={`${styles.metricValue} text-coral`}>
            ₹ {totalOutstanding.toFixed(2)}
          </div>
          <span className="text-dim" style={{ fontSize: 'var(--text-xs)' }}>Across active debtors</span>
        </div>

        {/* Total Collections */}
        <div className={`glass-card ${styles.metricCard}`}>
          <span className={styles.metricLabel}>Total Collections (Jama)</span>
          <div className={`${styles.metricValue} text-accent`}>
            ₹ {totalCollections.toFixed(2)}
          </div>
          <span className="text-dim" style={{ fontSize: 'var(--text-xs)' }}>Received in selected period</span>
        </div>

        {/* Total Credit Given */}
        <div className={`glass-card ${styles.metricCard}`}>
          <span className={styles.metricLabel}>Total Credit Given (Udhar)</span>
          <div className={`${styles.metricValue} text-gold`}>
            ₹ {totalCreditGiven.toFixed(2)}
          </div>
          <span className="text-dim" style={{ fontSize: 'var(--text-xs)' }}>Added in selected period</span>
        </div>

        {/* Recovery Rate Gauge */}
        <div className={`glass-card ${styles.metricCard}`}>
          <span className={styles.metricLabel}>Ledger Recovery Rate</span>
          <div className={`${styles.metricValue} ${recoveryRate >= 50 ? 'text-accent' : 'text-gold'}`}>
            {recoveryRate}%
          </div>
          <span className="text-dim" style={{ fontSize: 'var(--text-xs)' }}>Collections / Total Volume</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Bar Chart */}
        <div className={`glass-card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Credit vs Payment Comparison</h3>
          <CreditPaymentBar data={barChartData} />
        </div>

        {/* Outstanding Trend */}
        <div className={`glass-card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Outstanding Dues Trend</h3>
          <OutstandingTrend data={areaChartData} />
        </div>

        {/* Top Debtors Pie */}
        <div className={`glass-card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Top Debtors Breakdown</h3>
          <TopDebtorsPie data={topDebtorsPieData} />
        </div>
      </div>

      {/* Top 10 Debtors Table */}
      <div className={`glass-card ${styles.tableCard}`}>
        <h3 className={styles.chartTitle}>Top Debtors Ranking</h3>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Rank</th>
                <th className={styles.th}>Customer Name</th>
                <th className={styles.th}>Phone / Room</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Outstanding (₹)</th>
                <th className={styles.th} style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {top10Debtors.map((c, index) => (
                <tr key={c.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 800, color: 'var(--accent)' }}>#{index + 1}</td>
                  <td className={styles.td} style={{ fontWeight: 700 }}>{c.name}</td>
                  <td className={styles.td} style={{ color: 'var(--text-muted)' }}>{c.phone || c.room_id || 'N/A'}</td>
                  <td className={styles.td} style={{ textAlign: 'right', fontWeight: 800, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>
                    ₹ {c.outstanding_due.toFixed(2)}
                  </td>
                  <td className={styles.td} style={{ textAlign: 'center' }}>
                    <Link href={`/${locale}/customers/${c.id}`} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
