import { Customer, Transaction } from './db/schema';
import { format } from 'date-fns';

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTransactionsCSV(transactions: Transaction[], customers: Customer[]) {
  const customerMap = new Map(customers.map((c) => [c.id, c.name]));

  const headers = ['Transaction ID', 'Date & Time', 'Customer Name', 'Type', 'Amount (₹)', 'Balance Before (₹)', 'Balance After (₹)', 'Note / Items'];
  const rows = transactions.map((t) => [
    t.id,
    format(new Date(t.transaction_at), 'yyyy-MM-dd HH:mm:ss'),
    `"${customerMap.get(t.customer_id) || 'Unknown'}"`,
    t.type,
    t.amount.toFixed(2),
    t.balance_before.toFixed(2),
    t.balance_after.toFixed(2),
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  triggerDownload(csvContent, `khataflow_transactions_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportCustomerListCSV(customers: Customer[]) {
  const headers = ['Customer ID', 'Name', 'Phone', 'Room/Flat ID', 'Outstanding Due (₹)', 'Advance Balance (₹)', 'Credit Limit (₹)', 'Status', 'Created Date'];
  const rows = customers.map((c) => [
    c.id,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.phone || ''}"`,
    `"${c.room_id || ''}"`,
    c.outstanding_due.toFixed(2),
    c.advance_balance.toFixed(2),
    c.credit_limit.toFixed(2),
    c.is_active ? 'Active' : 'Inactive',
    format(new Date(c.created_at), 'yyyy-MM-dd'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  triggerDownload(csvContent, `khataflow_customers_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportFullBackup(customers: Customer[], transactions: Transaction[]) {
  const backupData = {
    app: 'KhataFlow',
    version: '2.0',
    export_date: new Date().toISOString(),
    shop: JSON.parse(localStorage.getItem('khataflow_shop') || '{}'),
    customers,
    transactions,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const dateStr = format(new Date(), 'yyyy-MM-dd_HHmm');
  triggerDownload(jsonString, `khataflow_backup_${dateStr}.json`, 'application/json');
}
