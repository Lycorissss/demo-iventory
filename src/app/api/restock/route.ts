import { NextResponse } from 'next/server';
import { db, Transaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json();
  const { itemId, qty } = body;

  if (!itemId || !qty || qty <= 0) {
    return NextResponse.json({ error: 'Invalid restock request' }, { status: 400 });
  }

  const transactions = db.getTransactions();
  const inventory = db.getInventory();
  
  // Generate unique transfer ID with date and random number
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const y = String(today.getFullYear()).slice(-2);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const trxId = `RESTOCK-${d}${m}${y}-${randomStr}`;

  // Create completed transaction from supplier to gudang
  const newTransaction: Transaction = {
    id: trxId,
    itemId,
    from: 'supplier',
    to: 'gudang',
    qty,
    status: 'COMPLETED',
    date: today.toISOString()
  };

  transactions.push(newTransaction);
  db.saveTransactions(transactions);

  // Add to Gudang immediately
  const gudangIdx = inventory.findIndex(i => i.itemId === itemId && i.location === 'gudang');
  if (gudangIdx > -1) {
    inventory[gudangIdx].qty += qty;
  } else {
    // If gudang somehow doesn't have this item yet, initialize it
    inventory.push({ itemId, location: 'gudang', qty });
  }
  db.saveInventory(inventory);

  return NextResponse.json(newTransaction, { status: 201 });
}
