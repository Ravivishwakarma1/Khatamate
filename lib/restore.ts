import { Customer, Transaction } from './db/schema';
import { saveLocalCustomer, saveLocalTransaction } from './db/idb';

export async function importFullBackup(jsonText: string): Promise<{ customersCount: number; transactionsCount: number }> {
  try {
    const data = JSON.parse(jsonText);

    const customers: Customer[] = data.customers || [];
    const transactions: Transaction[] = data.transactions || [];

    if (!Array.isArray(customers)) {
      throw new Error('Invalid backup file format: Customers array missing');
    }

    let cCount = 0;
    for (const c of customers) {
      if (c.id && c.name) {
        await saveLocalCustomer(c);
        cCount++;
      }
    }

    let tCount = 0;
    for (const t of transactions) {
      if (t.id && t.customer_id) {
        await saveLocalTransaction(t);
        tCount++;
      }
    }

    if (data.shop) {
      localStorage.setItem('khataflow_shop', JSON.stringify(data.shop));
    }

    return { customersCount: cCount, transactionsCount: tCount };
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to parse backup JSON file');
  }
}
