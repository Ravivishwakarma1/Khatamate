export type TransactionType = 'CREDIT' | 'PAYMENT' | 'ADVANCE' | 'WRITEOFF' | 'ADJUSTMENT' | 'NOTE';
export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  address?: string;
  phone?: string;
  gst_number?: string;
  currency: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  settings: {
    language: string;
    dark_mode: boolean;
    pin_enabled: boolean;
  };
  created_at: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone?: string;
  room_id?: string;
  photo_url?: string;
  credit_limit: number;
  advance_balance: number;
  outstanding_due: number;
  notes?: string;
  tags?: string[];
  family_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_transaction_at?: string;
}

export interface TransactionItem {
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  customer_id: string;
  shop_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  items?: TransactionItem[];
  note?: string;
  recorded_by?: string;
  transaction_at: string;
  created_at: string;
  is_disputed?: boolean;
  dispute_note?: string;
  sync_status?: 'synced' | 'pending';
}

export interface ReminderLog {
  id: string;
  customer_id: string;
  shop_id: string;
  amount_due: number;
  message: string;
  sent_at: string;
  sent_by?: string;
}
