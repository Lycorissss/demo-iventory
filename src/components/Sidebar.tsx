'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Send, ScanLine, History, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  // Hide sidebar entirely on login page
  if (pathname === '/login') return null;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['gudang', 'cabang-1', 'cabang-2', 'cabang-3'] },
    { name: 'Master Barang', href: '/items', icon: Package, roles: ['gudang', 'cabang-1', 'cabang-2', 'cabang-3'] },
    { name: 'Kirim Barang', href: '/transfer', icon: Send, roles: ['gudang'] },
    { name: 'Scan Penerimaan', href: '/scan', icon: ScanLine, roles: ['cabang-1', 'cabang-2', 'cabang-3'] },
    { name: 'Riwayat Transaksi', href: '/history', icon: History, roles: ['gudang', 'cabang-1', 'cabang-2', 'cabang-3'] },
  ];

  const visibleNavs = navItems.filter(item => role && item.roles.includes(role));

  const getRoleDisplayName = (r: string | null) => {
    if (r === 'gudang') return 'Admin Gudang';
    if (r === 'cabang-1') return 'Cabang 1';
    if (r === 'cabang-2') return 'Cabang 2';
    if (r === 'cabang-3') return 'Cabang 3';
    return 'Guest';
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-400" />
          GudangTracker
        </h1>
      </div>

      <div className="px-6 py-4 mx-4 bg-slate-800 rounded-xl mb-4 flex items-center gap-3">
        <div className="bg-slate-700 p-2 rounded-lg">
          <User className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Logged In As</p>
          <p className="font-bold text-sm text-blue-300">{getRoleDisplayName(role)}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {visibleNavs.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
