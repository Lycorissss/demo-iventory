import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export type Item = {
  id: string;
  name: string;
  type: string;
  category: string;
};

export type Inventory = {
  itemId: string;
  location: string;
  qty: number;
};

export type Transaction = {
  id: string;
  itemId: string;
  from: string;
  to: string;
  qty: number;
  status: 'PENDING' | 'COMPLETED';
  date: string;
};

export const db = {
  getItems: (): Item[] => {
    const filePath = path.join(dataDir, 'items.json');
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  },
  saveItems: (items: Item[]) => {
    const filePath = path.join(dataDir, 'items.json');
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
  },
  
  getInventory: (): Inventory[] => {
    const filePath = path.join(dataDir, 'inventory.json');
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  },
  saveInventory: (inventory: Inventory[]) => {
    const filePath = path.join(dataDir, 'inventory.json');
    fs.writeFileSync(filePath, JSON.stringify(inventory, null, 2));
  },

  getTransactions: (): Transaction[] => {
    const filePath = path.join(dataDir, 'transactions.json');
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  },
  saveTransactions: (transactions: Transaction[]) => {
    const filePath = path.join(dataDir, 'transactions.json');
    fs.writeFileSync(filePath, JSON.stringify(transactions, null, 2));
  }
};
