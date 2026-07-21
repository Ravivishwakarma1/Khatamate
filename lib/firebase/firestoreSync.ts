import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from './config';
import { Customer, Transaction, Shop } from '../db/schema';
import { getAllLocalCustomers, saveLocalCustomer, getAllLocalTransactions, saveLocalTransaction } from '../db/idb';

// Save or Update Shop in Firestore
export async function saveShopToFirestore(shop: Shop): Promise<void> {
  try {
    const ref = doc(db, 'shops', shop.id);
    await setDoc(ref, {
      ...shop,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore shop save note:', err);
  }
}

// Save or Update Customer in Firestore
export async function saveCustomerToFirestore(customer: Customer): Promise<void> {
  try {
    const ref = doc(db, 'customers', customer.id);
    await setDoc(ref, {
      ...customer,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore customer save note:', err);
  }
}

// Save or Update Transaction in Firestore
export async function saveTransactionToFirestore(transaction: Transaction): Promise<void> {
  try {
    const ref = doc(db, 'transactions', transaction.id);
    await setDoc(ref, transaction, { merge: true });
  } catch (err) {
    console.warn('Firestore transaction save note:', err);
  }
}

// Fetch Customer from Firestore
export async function getCustomerFromFirestore(customerId: string): Promise<Customer | null> {
  try {
    const ref = doc(db, 'customers', customerId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as Customer;
    }
  } catch (err) {
    console.warn('Firestore getCustomer note:', err);
  }
  return null;
}

// Fetch Transactions for a Customer from Firestore
export async function getTransactionsFromFirestore(customerId: string): Promise<Transaction[]> {
  try {
    const q = query(collection(db, 'transactions'), where('customer_id', '==', customerId));
    const snap = await getDocs(q);
    const list: Transaction[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Transaction);
    });
    return list;
  } catch (err) {
    console.warn('Firestore getTransactions note:', err);
  }
  return [];
}

// Fetch Shop from Firestore
export async function getShopFromFirestore(shopId: string): Promise<Shop | null> {
  try {
    const ref = doc(db, 'shops', shopId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as Shop;
    }
  } catch (err) {
    console.warn('Firestore getShop note:', err);
  }
  return null;
}

// Sync Local IndexedDB Data to Cloud Firestore
export async function syncIndexedDBToFirestore(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!navigator.onLine) return false;

  try {
    // 1. Sync Local Customers to Firestore & Fetch Cloud Updates
    const localCustomers = await getAllLocalCustomers();
    for (const cust of localCustomers) {
      await saveCustomerToFirestore(cust);
    }

    // 2. Sync Local Transactions to Firestore
    const localTransactions = await getAllLocalTransactions();
    for (const tx of localTransactions) {
      await saveTransactionToFirestore(tx);
    }

    return true;
  } catch (err) {
    console.warn('Firestore sync engine notice:', err);
    return false;
  }
}

