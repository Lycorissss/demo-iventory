'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

type Transaction = {
  id: string;
  itemId: string;
  from: string;
  to: string;
  qty: number;
  status: string;
  date: string;
};

type Item = {
  id: string;
  name: string;
};

export default function HistoryPage() {
  const { role } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/transfer').then(res => res.json()),
      fetch('/api/items').then(res => res.json())
    ]).then(([trxData, itemsData]) => {
      setTransactions(trxData);
      setItems(itemsData);
      setLoading(false);
    });
  }, []);

  const getItemName = (id: string) => items.find(i => i.id === id)?.name || id;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter logic based on role
  const getFilteredTransactions = () => {
    if (!role) return [];
    
    if (role === 'gudang') {
      // Gudang sees outward transfers and supplier restocks
      return transactions.filter(t => t.from === 'gudang' || t.to === 'gudang');
    } else {
      // Cabang only sees completed incoming items (from Gudang)
      return transactions.filter(t => t.to === role && t.status === 'COMPLETED');
    }
  };

  const filteredHistory = getFilteredTransactions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Waktu</th>
              <th className="px-6 py-4">No. Transaksi</th>
              <th className="px-6 py-4">Barang</th>
              <th className="px-6 py-4">Jenis Transaksi</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading...</td></tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Clock className="w-12 h-12 mb-3 opacity-20" />
                    <p>Belum ada riwayat transaksi.</p>
                  </div>
                </td>
              </tr>
            ) : filteredHistory.map((trx) => {
              const isMasuk = trx.to === role;
              
              return (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {formatDate(trx.date)}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">
                    {trx.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{getItemName(trx.itemId)}</div>
                    <div className="text-xs text-slate-500">{trx.qty} Pcs</div>
                  </td>
                  <td className="px-6 py-4">
                    {isMasuk ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                        <ArrowDownLeft className="w-4 h-4" /> 
                        Barang Masuk
                        <span className="text-xs text-green-700/60 font-normal ml-1">
                          (dari {trx.from})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                        <ArrowUpRight className="w-4 h-4" /> 
                        Barang Keluar
                        <span className="text-xs text-amber-700/60 font-normal ml-1">
                          (ke {trx.to})
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {trx.status === 'COMPLETED' ? (
                      <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">Selesai</span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">Menunggu Scan</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
