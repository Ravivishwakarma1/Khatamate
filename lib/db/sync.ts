import { createClient } from '../supabase/client';
import { getAllLocalCustomers, saveLocalCustomer } from './idb';

export async function syncLocalDataWithCloud(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!navigator.onLine) return false;

  const hasRealSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!hasRealSupabase) return false;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Fetch cloud customers
    const { data: cloudCustomers, error } = await supabase
      .from('customers')
      .select('*');

    if (!error && cloudCustomers) {
      for (const cust of cloudCustomers) {
        await saveLocalCustomer({
          id: cust.id,
          shop_id: cust.shop_id,
          name: cust.name,
          phone: cust.phone || '',
          room_id: cust.room_id || '',
          photo_url: cust.photo_url || '',
          credit_limit: Number(cust.credit_limit) || 0,
          advance_balance: Number(cust.advance_balance) || 0,
          outstanding_due: Number(cust.outstanding_due) || 0,
          notes: cust.notes || '',
          tags: cust.tags || [],
          family_id: cust.family_id || undefined,
          is_active: cust.is_active ?? true,
          created_at: cust.created_at,
          updated_at: cust.updated_at,
        });
      }
      return true;
    }
  } catch (err) {
    console.warn('Sync engine notice:', err);
  }

  return false;
}
