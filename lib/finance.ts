import { Customer, Transaction, TransactionItem, TransactionType } from './db/schema';
import { saveLocalCustomer, saveLocalTransaction } from './db/idb';

/**
 * Calculates new balances and records a Credit (Udhar) entry.
 * Advance Wallet Logic:
 * If customer has an advance_balance > 0:
 * Deduct from advance_balance first.
 * Any remaining credit amount increases outstanding_due.
 */
export async function addCreditTransaction(
  customer: Customer,
  amount: number,
  items?: TransactionItem[],
  note?: string
): Promise<{ customer: Customer; transaction: Transaction }> {
  if (amount <= 0) throw new Error('Credit amount must be greater than zero');

  let advanceBalance = customer.advance_balance || 0;
  let outstandingDue = customer.outstanding_due || 0;
  let remainingCreditToApply = amount;

  // 1. Advance balance deduction logic
  if (advanceBalance > 0) {
    const deductFromAdvance = Math.min(advanceBalance, remainingCreditToApply);
    advanceBalance -= deductFromAdvance;
    remainingCreditToApply -= deductFromAdvance;
  }

  // 2. Add remaining amount to outstanding due
  outstandingDue += remainingCreditToApply;

  const balanceBefore = customer.outstanding_due - customer.advance_balance;
  const balanceAfter = outstandingDue - advanceBalance;

  const updatedCustomer: Customer = {
    ...customer,
    outstanding_due: outstandingDue,
    advance_balance: advanceBalance,
    updated_at: new Date().toISOString(),
    last_transaction_at: new Date().toISOString(),
  };

  const transaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    customer_id: customer.id,
    shop_id: customer.shop_id,
    type: 'CREDIT',
    amount: amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    items,
    note: note || (items && items.length > 0 ? `${items.length} items purchased` : 'Credit entry'),
    transaction_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  await saveLocalCustomer(updatedCustomer);
  await saveLocalTransaction(transaction);

  return { customer: updatedCustomer, transaction };
}

/**
 * Calculates new balances and records a Payment (Jama) entry.
 * Overpayment Logic:
 * Payment clears outstanding_due first.
 * Any excess payment amount increases advance_balance.
 */
export async function recordPaymentTransaction(
  customer: Customer,
  amount: number,
  note?: string
): Promise<{ customer: Customer; transaction: Transaction }> {
  if (amount <= 0) throw new Error('Payment amount must be greater than zero');

  let advanceBalance = customer.advance_balance || 0;
  let outstandingDue = customer.outstanding_due || 0;

  const balanceBefore = outstandingDue - advanceBalance;

  if (amount <= outstandingDue) {
    outstandingDue -= amount;
  } else {
    // Overpayment
    const excess = amount - outstandingDue;
    outstandingDue = 0;
    advanceBalance += excess;
  }

  const balanceAfter = outstandingDue - advanceBalance;

  const updatedCustomer: Customer = {
    ...customer,
    outstanding_due: outstandingDue,
    advance_balance: advanceBalance,
    updated_at: new Date().toISOString(),
    last_transaction_at: new Date().toISOString(),
  };

  const transaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    customer_id: customer.id,
    shop_id: customer.shop_id,
    type: 'PAYMENT',
    amount: amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    note: note || 'Payment received (Jama)',
    transaction_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  await saveLocalCustomer(updatedCustomer);
  await saveLocalTransaction(transaction);

  return { customer: updatedCustomer, transaction };
}

/**
 * Writes off bad debt for a customer.
 */
export async function writeOffTransaction(
  customer: Customer,
  amount: number,
  reason: string
): Promise<{ customer: Customer; transaction: Transaction }> {
  if (amount <= 0) throw new Error('Write-off amount must be greater than zero');

  const balanceBefore = customer.outstanding_due - customer.advance_balance;
  const newOutstanding = Math.max(0, customer.outstanding_due - amount);
  const balanceAfter = newOutstanding - customer.advance_balance;

  const updatedCustomer: Customer = {
    ...customer,
    outstanding_due: newOutstanding,
    updated_at: new Date().toISOString(),
  };

  const transaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    customer_id: customer.id,
    shop_id: customer.shop_id,
    type: 'WRITEOFF',
    amount: amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    note: `Bad debt write-off: ${reason}`,
    transaction_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  await saveLocalCustomer(updatedCustomer);
  await saveLocalTransaction(transaction);

  return { customer: updatedCustomer, transaction };
}
