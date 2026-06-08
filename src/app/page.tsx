'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertCircle, Building2, Store } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

type Inventory = {
  itemId: string;
  location: string;
  qty: number;
};

export default function Home() {
  const { role } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setInventory(data);
        setLoading(false);
      });
  }, []);

  const totalGudang = inventory.filter(i => i.location === 'gudang').reduce((sum, item) => sum + item.qty, 0);
  const totalCabang1 = inventory.filter(i => i.location === 'cabang-1').reduce((sum, item) => sum + item.qty, 0);
  const totalCabang2 = inventory.filter(i => i.location === 'cabang-2').reduce((sum, item) => sum + item.qty, 0);
  const totalCabang3 = inventory.filter(i => i.location === 'cabang-3').reduce((sum, item) => sum + item.qty, 0);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div><div className="h-2 bg-slate-200 rounded"></div></div></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Selamat Datang, {role === 'gudang' ? 'Admin Gudang Utama' : role ? `Admin ${role.replace('-', ' ').toUpperCase()}` : ''}!
          </h1>
          <p className="text-slate-500 mt-1">Ringkasan inventori logistik saat ini.</p>
        </div>
        <div className={`p-4 rounded-full ${role === 'gudang' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
          {role === 'gudang' ? <Building2 className="w-8 h-8" /> : <Store className="w-8 h-8" />}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white text-slate-950 shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Stok Total Gudang Utama</h3>
            <Package className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalGudang} Pcs</div>
            <p className="text-xs text-slate-500">Total barang di Gudang Utama</p>
          </div>
        </div>

        <div className="rounded-xl border bg-white text-slate-950 shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Stok Cabang 1</h3>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalCabang1} Pcs</div>
          </div>
        </div>

        <div className="rounded-xl border bg-white text-slate-950 shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Stok Cabang 2</h3>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalCabang2} Pcs</div>
          </div>
        </div>

        <div className="rounded-xl border bg-white text-slate-950 shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Stok Cabang 3</h3>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalCabang3} Pcs</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-white text-slate-950 shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Rincian Stok Barang (Gudang vs Cabang)</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100">
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">ID Barang</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Lokasi</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">Qty</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {inventory.map((inv, idx) => (
                    <tr key={idx} className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100">
                      <td className="p-4 align-middle font-medium">{inv.itemId}</td>
                      <td className="p-4 align-middle uppercase text-xs">
                        <span className={`px-2 py-1 rounded-full font-semibold ${inv.location === 'gudang' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {inv.location}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">{inv.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="col-span-3 rounded-xl border bg-white text-slate-950 shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">System Status</h3>
            <p className="text-sm text-slate-500 mt-2">All systems operational.</p>
          </div>
          <div className="p-6 pt-0 flex flex-col gap-4">
            <div className="flex items-center gap-4 border p-4 rounded-lg bg-blue-50/50">
              <AlertCircle className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Scanner Ready</p>
                <p className="text-xs text-slate-500">Penerimaan barang di cabang via barcode aktif.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
