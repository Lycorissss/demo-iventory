import { NextResponse } from 'next/server';
import { db, Item } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = db.getItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, type, category } = body;

  if (!name || !type || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Generate unique barcode based on type and category
  const prefixType = type.substring(0, 3).toUpperCase();
  const prefixCat = category.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `${prefixType}-${prefixCat}-${randomNum}`;

  const newItem: Item = {
    id: newId,
    name,
    type,
    category
  };

  const items = db.getItems();
  items.push(newItem);
  db.saveItems(items);

  // Initialize inventory for new item at gudang to 0
  const inventory = db.getInventory();
  inventory.push({ itemId: newId, location: 'gudang', qty: 0 });
  db.saveInventory(inventory);

  return NextResponse.json(newItem, { status: 201 });
}
