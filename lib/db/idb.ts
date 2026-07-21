import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Customer, Transaction, Shop } from './schema';
import { saveShopToFirestore, saveCustomerToFirestore, saveTransactionToFirestore } from '../firebase/firestoreSync';


interface KhataFlowDB extends DBSchema {
  shops: {
    key: string;
    value: Shop;
  };
  customers: {
    key: string;
    value: Customer;
    indexes: {
      'by-shop': string;
      'by-name': string;
    };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      'by-customer': string;
      'by-shop': string;
      'by-date': string;
    };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'insert' | 'update' | 'delete';
      entity: 'customer' | 'transaction' | 'shop';
      data: any;
      timestamp: number;
    };
  };
}

const DB_NAME = 'khataflow_local_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<KhataFlowDB>> | null = null;

export const getDB = () => {
  if (typeof window === 'undefined') return null;

  if (!dbPromise) {
    dbPromise = openDB<KhataFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Shops Store
        if (!db.objectStoreNames.contains('shops')) {
          db.createObjectStore('shops', { keyPath: 'id' });
        }

        // Customers Store
        if (!db.objectStoreNames.contains('customers')) {
          const custStore = db.createObjectStore('customers', { keyPath: 'id' });
          custStore.createIndex('by-shop', 'shop_id');
          custStore.createIndex('by-name', 'name');
        }

        // Transactions Store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-customer', 'customer_id');
          txStore.createIndex('by-shop', 'shop_id');
          txStore.createIndex('by-date', 'transaction_at');
        }

        // Sync Queue Store
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      },
    });
  }

  return dbPromise;
};

// Shop CRUD
export async function getAllLocalShops(): Promise<Shop[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('shops');
export async function saveLocalShop(shop: Shop): Promise<void> {

  const db = await getDB();
  if (!db) return;
  await db.put('shops', shop);
  saveShopToFirestore(shop).catch(() => {});
}

export async function deleteLocalShop(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete('shops', id);
}

// Customer CRUD
export async function getAllLocalCustomers(): Promise<Customer[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('customers');
}

export async function getLocalCustomerById(id: string): Promise<Customer | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return db.get('customers', id);
}

export async function saveLocalCustomer(customer: Customer): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put('customers', customer);
  saveCustomerToFirestore(customer).catch(() => {});
}

export async function deleteLocalCustomer(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete('customers', id);
}

// Transaction CRUD
export async function getAllLocalTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  if (!db) return [];
  const all = await db.getAll('transactions');
  return all.sort((a, b) => new Date(b.transaction_at).getTime() - new Date(a.transaction_at).getTime());
}

export async function getLocalTransactionsByCustomer(customerId: string): Promise<Transaction[]> {
  const db = await getDB();
  if (!db) return [];
  const all = await db.getAllFromIndex('transactions', 'by-customer', customerId);
  return all.sort((a, b) => new Date(b.transaction_at).getTime() - new Date(a.transaction_at).getTime());
}

export async function saveLocalTransaction(transaction: Transaction): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put('transactions', transaction);
  saveTransactionToFirestore(transaction).catch(() => {});
}


// Seed Demo Data if empty (returns current local customers)
export async function seedDemoDataIfEmpty(): Promise<Customer[]> {
  const db = await getDB();
  if (!db) return [];

  return db.getAll('customers');
}

// Clear all local database data
export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.clear('shops');
  await db.clear('customers');
  await db.clear('transactions');
  await db.clear('sync_queue');
}

