'use client';

import { useState, useRef, useEffect } from 'react';
import { ScanLine, CheckCircle, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '@/lib/AuthContext';

export default function ScanPage() {
  const { role } = useAuth();
  const [barcode, setBarcode] = useState('');
  
  // Set location from role (cabang-1, cabang-2, etc). Fallback to empty if not a cabang.
  const initialLocation = role && role.startsWith('cabang') ? role : 'cabang-1';
  const [location, setLocation] = useState(initialLocation);
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // If role changes (though rare on this page), update location
  useEffect(() => {
    if (role && role.startsWith('cabang')) {
      setLocation(role);
    }
  }, [role]);

  useEffect(() => {
    if (!showCamera) {
      inputRef.current?.focus();
    }
  }, [showCamera]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showCamera) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 250, height: 100} },
        false
      );

      scanner.render(
        (decodedText) => {
          // On success
          setBarcode(decodedText);
          setShowCamera(false); // Close camera after scan
        },
        (error) => {
          // ignore error for continuous scanning
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [showCamera]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode, location })
    });

    const data = await res.json();
    
    if (res.ok) {
      setMessage({ type: 'success', text: `Berhasil menerima barang: ${data.transaction?.qty || ''} Pcs` });
      setBarcode('');
    } else {
      setMessage({ type: 'error', text: data.error || 'Terjadi kesalahan saat scan' });
    }
    
    setLoading(false);
    if (!showCamera) inputRef.current?.focus();
    
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pt-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <ScanLine className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Scan Penerimaan</h1>
        <p className="text-slate-500">Gunakan scanner barcode fisik, ketik manual, atau gunakan kamera HP</p>
      </div>

      <div className="rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 block mb-2">Lokasi Anda (Terkunci Sesuai Login)</label>
            <select 
              value={location} 
              disabled // Locked to the user's role
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-slate-100 font-bold uppercase text-slate-600"
            >
              <option value="cabang-1">Cabang 1</option>
              <option value="cabang-2">Cabang 2</option>
              <option value="cabang-3">Cabang 3</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleScan} className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700">Kode Barcode</label>
              <button 
                type="button"
                onClick={() => setShowCamera(!showCamera)}
                className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700 transition-colors"
              >
                {showCamera ? <><X className="w-4 h-4"/> Tutup Kamera</> : <><Camera className="w-4 h-4"/> Buka Kamera HP</>}
              </button>
            </div>

            {showCamera && (
              <div className="mb-4 border-2 border-dashed border-blue-200 rounded-xl overflow-hidden">
                <div id="reader" className="w-full bg-slate-100"></div>
              </div>
            )}

            <input 
              ref={inputRef}
              type="text" 
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="KODE BARCODE..."
              className="w-full text-center text-2xl tracking-widest font-mono border-2 rounded-xl px-4 py-6 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase placeholder:text-slate-300" 
              disabled={loading || showCamera}
            />
          </div>

          <button 
            type="submit" 
            disabled={!barcode || loading || showCamera}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Memproses...' : 'Proses Scan Barang'}
          </button>
        </form>
      </div>

      {/* Inline Error Message */}
      {message && message.type === 'error' && (
        <div className="p-6 border rounded-2xl flex items-center justify-center gap-3 text-lg animate-in slide-in-from-bottom-4 bg-red-50 border-red-200 text-red-700">
          <p className="font-bold text-center">{message.text}</p>
        </div>
      )}

      {/* Success Modal */}
      {message && message.type === 'success' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Scan Berhasil!</h3>
              <p className="text-slate-500 mb-6">{message.text}</p>
              <button onClick={() => setMessage(null)} className="w-full py-3 text-white font-semibold bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-600/20">Lanjutkan Scan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
