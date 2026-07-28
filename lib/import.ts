import { Customer } from './db/schema';
import { saveLocalCustomer } from './db/idb';

export async function parseAndImportCustomersCSV(
  csvText: string,
  shopId: string,
  entityType: 'customer' | 'supplier' = 'customer'
): Promise<number> {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return 0;

  // Header check
  const hasHeader = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('phone');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  let importedCount = 0;

  for (const line of dataLines) {
    const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length > 0 && parts[0]) {
      const name = parts[0];
      const phone = parts[1] || '';
      const due = parseFloat(parts[2] || '0') || 0;
      const room = parts[3] || '';

      const newCustomer: Customer = {
        id: `cust_csv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        shop_id: shopId,
        name,
        phone,
        room_id: room,
        credit_limit: 0,
        advance_balance: 0,
        outstanding_due: due,
        is_active: true,
        entity_type: entityType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveLocalCustomer(newCustomer);
      importedCount++;
    }
  }

  return importedCount;
}
