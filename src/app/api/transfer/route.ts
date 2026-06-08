import { NextResponse } from 'next/server';
import { db, Transaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const transactions = db.getTransactions();
  // Sort by date descending (newest first)
  const sorted = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { itemId, toLocation, qty } = body;

  if (!itemId || !toLocation || !qty || qty <= 0) {
    return NextResponse.json({ error: 'Invalid transfer request' }, { status: 400 });
  }

  // Check Gudang inventory
  const inventory = db.getInventory();
  const gudangStock = inventory.find(i => i.itemId === itemId && i.location === 'gudang');

  if (!gudangStock || gudangStock.qty < qty) {
    return NextResponse.json({ error: 'Insufficient stock in Gudang' }, { status: 400 });
  }

  const transactions = db.getTransactions();
  
  // Generate unique transfer ID with date and random number
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const y = String(today.getFullYear()).slice(-2);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const trxId = `${itemId}-${d}${m}${y}-${randomStr}`;

  // Create pending transaction
  const newTransaction: Transaction = {
    id: trxId,
    itemId,
    from: 'gudang',
    to: toLocation,
    qty,
    status: 'PENDING',
    date: today.toISOString()
  };

  transactions.push(newTransaction);
  db.saveTransactions(transactions);

  // Deduct from Gudang immediately
  const gudangIdx = inventory.findIndex(i => i.itemId === itemId && i.location === 'gudang');
  if (gudangIdx > -1) {
    inventory[gudangIdx].qty -= qty;
    db.saveInventory(inventory);
  }

  return NextResponse.json(newTransaction, { status: 201 });
}
