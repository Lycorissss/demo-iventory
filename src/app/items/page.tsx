'use client';

import { useState, useEffect } from 'react';
import { Plus, Printer, X, Box, Info } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuth } from '@/lib/AuthContext';

type Item = {
  id: string;
  name: string;
  type: string;
  category: string;
};

type Inventory = {
  itemId: string;
  location: string;
  qty: number;
};

export default function ItemsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  // Modals State
  const [printItem, setPrintItem] = useState<Item | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [createConfirm, setCreateConfirm] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  
  // Restock State
  const [restockItem, setRestockItem] = useState<Item | null>(null);
  const [restockQty, setRestockQty] = useState<number | ''>('');
  const [restockSuccess, setRestockSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/items').then(res => res.json()),
      fetch('/api/inventory').then(res => res.json())
    ]).then(([itemsData, inventoryData]) => {
      setItems(itemsData);
      setInventory(inventoryData);
      setLoading(false);
    });
  };

  const handleCreateInit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateConfirm(true);
  };

  const executeCreate = async () => {
    setCreateConfirm(false);
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, category })
    });
    if (res.ok) {
      setCreateSuccess(true);
      setIsModalOpen(false);
      setName(''); setType(''); setCategory('');
      fetchData();
    }
  };

  const handleRestockInit = (item: Item) => {
    setRestockItem(item);
    setRestockQty('');
  };

  const executeRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = typeof restockQty === 'number' ? restockQty : parseInt(restockQty as string);
    if (!qty || qty <= 0 || !restockItem) return;

    const res = await fetch('/api/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: restockItem.id, qty })
    });

    if (res.ok) {
      setRestockItem(null);
      setRestockSuccess(true);
      fetchData();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to get total stock or specific stock based on role
  const getStockDisplay = (itemId: string) => {
    if (!role) return 0;
    if (role === 'gudang') {
      // Gudang sees total everywhere
      return inventory.filter(i => i.itemId === itemId).reduce((sum, i) => sum + i.qty, 0);
    } else {
      // Cabang only sees their own stock
      return inventory.find(i => i.itemId === itemId && i.location === role)?.qty || 0;
    }
  };

  const getItemInventory = (itemId: string) => {
    return inventory.filter(i => i.itemId === itemId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Master Barang & Stok</h1>
        {role === 'gudang' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Barang
          </button>
        )}
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Kode Barang</th>
              <th className="px-6 py-4">Nama Barang</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4 text-center">Stok {role === 'gudang' ? 'Total Sistem' : 'Anda'}</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading...</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-blue-600">{item.id}</td>
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4">
                  <span className="text-slate-500">{item.type}</span> &bull; {item.category}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 font-bold border">
                    {getStockDisplay(item.id)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => setDetailItem(item)}
                    className="text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
                  >
                    <Info className="w-4 h-4" /> Detail Stok
                  </button>
                  {role === 'gudang' && (
                    <>
                      <button 
                        onClick={() => handleRestockInit(item)}
                        className="text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors font-medium"
                      >
                        <Plus className="w-4 h-4" /> Restock
                      </button>
                      <button 
                        onClick={() => setPrintItem(item)}
                        className="text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-4 h-4" /> Print Barcode
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal (Only Gudang) */}
      {isModalOpen && role === 'gudang' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Tambah Barang Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Barang</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="Misal: TV Samsung 43 Inch" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tipe</label>
                <input required value={type} onChange={e => setType(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="Misal: TV, Kulkas, Meja" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kategori</label>
                <input required value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="Misal: Elektronik, Perabotan" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20">Simpan Barang</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal (Only Gudang) */}
      {printItem && role === 'gudang' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center print:shadow-none print:w-full print:h-full print:flex print:flex-col print:items-center print:justify-center">
            <h3 className="font-bold text-xl mb-2">{printItem.name}</h3>
            <p className="text-sm text-slate-500 mb-6 font-mono font-medium">{printItem.id}</p>
            
            <div className="bg-white inline-block p-4 border-2 border-dashed border-slate-200 rounded-xl mb-6 mx-auto">
              <QRCode value={printItem.id} size={160} />
            </div>
            
            <div className="flex justify-center gap-3 print:hidden">
              <button onClick={() => setPrintItem(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Tutup</button>
              <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> Cetak QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Detail Modal (All Roles) */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Distribusi Stok Barang</h3>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-bold text-lg">{detailItem.name}</h4>
                <p className="text-sm text-slate-500 font-mono">{detailItem.id}</p>
              </div>

              <div className="space-y-3">
                {getItemInventory(detailItem.id).length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-4">Belum ada data stok untuk barang ini.</p>
                )}
                {getItemInventory(detailItem.id).map((inv, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 border rounded-lg ${inv.location === role ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    <span className="uppercase text-xs font-bold text-slate-600 flex items-center gap-2">
                      {inv.location}
                      {inv.location === role && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px]">LOKASI ANDA</span>}
                    </span>
                    <span className="font-bold text-lg">{inv.qty} Pcs</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setDetailItem(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {createConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Simpan</h3>
              <p className="text-slate-500 mb-6">
                Yakin ingin menyimpan <span className="font-bold text-slate-900">{name}</span> sebagai master barang baru?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setCreateConfirm(false)} className="flex-1 py-3 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button onClick={executeCreate} className="flex-1 py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/20">Ya, Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {createSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Barang Tersimpan!</h3>
              <p className="text-slate-500 mb-6">Master barang baru telah berhasil ditambahkan ke dalam sistem.</p>
              <button onClick={() => setCreateSuccess(false)} className="w-full py-3 text-white font-semibold bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-600/20">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Form Modal (Only Gudang) */}
      {restockItem && role === 'gudang' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Restock Supplier</h3>
              <button onClick={() => setRestockItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={executeRestock} className="p-6 space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500">Menambah stok untuk barang:</p>
                <h4 className="font-bold text-lg text-slate-900">{restockItem.name}</h4>
                <p className="text-xs font-mono text-blue-600">{restockItem.id}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Jumlah Masuk (Pcs)</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  value={restockQty} 
                  onChange={e => setRestockQty(e.target.value === '' ? '' : parseInt(e.target.value))} 
                  className="w-full text-center text-xl font-bold border-2 rounded-xl px-4 py-4 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setRestockItem(null)} className="flex-1 py-3 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={!restockQty || restockQty <= 0} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-amber-500/20">Proses Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Success Modal */}
      {restockSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Restock Berhasil!</h3>
              <p className="text-slate-500 mb-6">Stok gudang telah berhasil ditambahkan dari pembelian supplier.</p>
              <button onClick={() => setRestockSuccess(false)} className="w-full py-3 text-white font-semibold bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-600/20">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

