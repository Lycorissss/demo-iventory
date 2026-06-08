'use client';

import { Package, Building2, Store } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center bg-blue-600 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">GudangTracker</h1>
          <p className="text-blue-100 mt-2">Masuk ke sistem demo</p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider">
            Pilih Peran Anda
          </p>

          <div className="space-y-3">
            <button
              onClick={() => login('gudang')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Admin Gudang</h3>
                <p className="text-xs text-slate-500">Kelola master barang & kirim stok</p>
              </div>
            </button>

            <button
              onClick={() => login('cabang-1')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors text-green-700">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Admin Cabang 1</h3>
                <p className="text-xs text-slate-500">Akses khusus Cabang 1</p>
              </div>
            </button>

            <button
              onClick={() => login('cabang-2')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors text-green-700">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Admin Cabang 2</h3>
                <p className="text-xs text-slate-500">Akses khusus Cabang 2</p>
              </div>
            </button>

            <button
              onClick={() => login('cabang-3')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors text-green-700">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Admin Cabang 3</h3>
                <p className="text-xs text-slate-500">Akses khusus Cabang 3</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
