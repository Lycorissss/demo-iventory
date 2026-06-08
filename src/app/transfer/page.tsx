'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Printer, X, Clock, CheckCircle } from 'lucide-react';
import Barcode from 'react-barcode';

type Item = {
  id: string;
  name: string;
};

type Inventory = {
  itemId: string;
  location: string;
  qty: number;
};

type Transaction = {
  id: string;
  itemId: string;
  from: string;
  to: string;
  qty: number;
  status: 'PENDING' | 'COMPLETED';
  date: string;
};

export default function TransferPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedCabang, setSelectedCabang] = useState('cabang-1');
  const [qty, setQty] = useState<number | ''>(1);
  const [message, setMessage] = useState('');

  // Print State
  const [printTrx, setPrintTrx] = useState<{ id: string, name: string } | null>(null);

  const [transferConfirm, setTransferConfirm] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/items').then(res => res.json()),
      fetch('/api/inventory').then(res => res.json()),
      fetch('/api/transfer').then(res => res.json())
    ]).then(([itemsData, inventoryData, trxData]) => {
      setItems(itemsData);
      setInventory(inventoryData);
      setTransactions(trxData);
      setLoading(false);
    });
  };

  const gudangStock = inventory.find(i => i.itemId === selectedItem && i.location === 'gudang')?.qty || 0;

  const handleTransferInit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitQty = typeof qty === 'number' ? qty : 0;
    if (submitQty <= 0) {
      alert('Jumlah tidak valid');
      return;
    }
    if (submitQty > gudangStock) {
      alert('Stok di gudang tidak mencukupi!');
      return;
    }
    setTransferConfirm(true);
  };

  const executeTransfer = async () => {
    setTransferConfirm(false);
    const submitQty = typeof qty === 'number' ? qty : 0;
    
    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: selectedItem, toLocation: selectedCabang, qty: submitQty })
    });

    if (res.ok) {
      const savedData = await res.json();
      setTransferSuccess(true);
      setMessage('Transfer berhasil diinisiasi! Jangan lupa cetak barcode resi untuk ditempel di barang.');
      setSelectedItem('');
      setQty(1);
      
      const itemDetails = items.find(i => i.id === savedData.itemId);
      setPrintTrx({ id: savedData.id, name: itemDetails?.name || 'Unknown Item' });

      fetchData();
        
      setTimeout(() => setMessage(''), 8000);
    } else {
      const data = await res.json();
      alert(data.error || 'Terjadi kesalahan');
    }
  };

  const getItemName = (itemId: string) => {
    return items.find(i => i.id === itemId)?.name || itemId;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kirim Barang ke Cabang</h1>
      </div>

      {message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 max-w-2xl">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden sticky top-6">
            <div className="p-6 border-b bg-slate-50">
              <h3 className="font-semibold text-lg">Form Pengiriman Baru</h3>
            </div>
            <form onSubmit={handleTransferInit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Barang</label>
                <select 
                  required 
                  value={selectedItem} 
                  onChange={e => setSelectedItem(e.target.value)}
                  className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="" disabled>-- Pilih Barang dari Gudang --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.id})
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <p className="text-sm text-slate-500 mt-1">
                    Stok tersedia di gudang: <span className="font-bold text-slate-900">{gudangStock} Pcs</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tujuan Cabang</label>
                <select 
                  required 
                  value={selectedCabang} 
                  onChange={e => setSelectedCabang(e.target.value)}
                  className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="cabang-1">Cabang 1</option>
                  <option value="cabang-2">Cabang 2</option>
                  <option value="cabang-3">Cabang 3</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Jumlah Dikirim</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  max={gudangStock > 0 ? gudangStock : 1}
                  value={qty} 
                  onChange={e => setQty(e.target.value === '' ? '' : parseInt(e.target.value))} 
                  className="w-full border rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                />
              </div>

              <button 
                type="submit" 
                disabled={!selectedItem || loading || (typeof qty === 'number' && gudangStock < qty)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <Send className="w-5 h-5" /> Proses Pengiriman
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50">
              <h3 className="font-semibold text-lg">Riwayat & Status Pengiriman</h3>
            </div>
            <div className="p-0 overflow-auto max-h-[600px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b text-slate-500 font-medium sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Barang</th>
                    <th className="px-6 py-4">Tujuan</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-500">Belum ada riwayat pengiriman.</td></tr>
                  ) : transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {new Date(trx.date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{getItemName(trx.itemId)}</div>
                        <div className="text-xs font-mono text-blue-600">{trx.itemId}</div>
                      </td>
                      <td className="px-6 py-4 uppercase text-xs font-semibold">{trx.to}</td>
                      <td className="px-6 py-4 text-center font-bold">{trx.qty}</td>
                      <td className="px-6 py-4 text-center">
                        {trx.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" /> Menunggu Scan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3" /> Selesai
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setPrintTrx({ id: trx.id, name: getItemName(trx.itemId) })}
                          className="text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-4 h-4" /> Print Resi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {printTrx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 text-center print:shadow-none print:w-full print:h-full print:flex print:flex-col print:items-center print:justify-center">
            <h3 className="font-bold text-xl mb-2">{printTrx.name}</h3>
            <p className="text-sm text-slate-500 mb-6 font-mono font-medium">{printTrx.id}</p>
            
            <div className="bg-white inline-block p-4 border-2 border-dashed border-slate-200 rounded-xl mb-6 max-w-full overflow-x-auto">
              <Barcode value={printTrx.id} width={1.5} height={80} fontSize={14} />
            </div>
            
            <div className="flex justify-center gap-3 print:hidden">
              <button onClick={() => setPrintTrx(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 border rounded-lg font-medium transition-colors">Tutup</button>
              <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {transferConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Pengiriman</h3>
              <p className="text-slate-500 mb-6">
                Yakin ingin mengirim <span className="font-bold text-slate-900">{typeof qty === 'number' ? qty : 0} Pcs</span> ke <span className="font-bold text-slate-900 uppercase">{selectedCabang}</span>? Stok di Gudang akan langsung dikurangi.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setTransferConfirm(false)} className="flex-1 py-3 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button onClick={executeTransfer} className="flex-1 py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/20">Ya, Kirim</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {transferSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pengiriman Berhasil!</h3>
              <p className="text-slate-500 mb-6">Data pengiriman telah tercatat dan stok Gudang berhasil dikurangi. Jangan lupa cetak resi barcodenya.</p>
              <button onClick={() => setTransferSuccess(false)} className="w-full py-3 text-white font-semibold bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-600/20">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

