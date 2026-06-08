import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json();
  const { barcode, location } = body; // Cabang scans the barcode

  if (!barcode || !location) {
    return NextResponse.json({ error: 'Barcode and location required' }, { status: 400 });
  }

  // Find a pending transaction for this barcode (which is now the Transfer ID) and target location
  const transactions = db.getTransactions();
  const pendingTrxIndex = transactions.findIndex(
    tr => tr.id === barcode && tr.status === 'PENDING' && tr.to === location
  );

  if (pendingTrxIndex === -1) {
    return NextResponse.json({ error: 'No pending transfer found for this item to your location' }, { status: 404 });
  }

  const trx = transactions[pendingTrxIndex];

  // Update inventory
  const inventory = db.getInventory();
  
  // Add to Cabang
  const cabangIdx = inventory.findIndex(i => i.itemId === trx.itemId && i.location === location);
  if (cabangIdx > -1) {
    inventory[cabangIdx].qty += trx.qty;
  } else {
    // If not exists in cabang, create it
    inventory.push({ itemId: trx.itemId, location: location, qty: trx.qty });
  }

  db.saveInventory(inventory);

  // Mark transaction as completed
  transactions[pendingTrxIndex].status = 'COMPLETED';
  db.saveTransactions(transactions);

  return NextResponse.json({ message: 'Scan successful, stock updated', transaction: transactions[pendingTrxIndex] });
}
