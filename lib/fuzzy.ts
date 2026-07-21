import Fuse from 'fuse.js';
import { Customer } from './db/schema';

export function searchCustomers(customers: Customer[], query: string): Customer[] {
  if (!query || !query.trim()) return customers;

  const fuse = new Fuse(customers, {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'phone', weight: 0.3 },
      { name: 'room_id', weight: 0.1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });

  const results = fuse.search(query.trim());
  return results.map((res) => res.item);
}
