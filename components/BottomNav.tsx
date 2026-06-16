'use client';

import Link from 'next/link';
import { Home, Users2, PackagePlus, FileText, LogOut } from 'lucide-react';
import { useData } from './DataProvider';

const items = [
  { href: '/dashboard', label: 'Beranda', icon: Home },
  { href: '/pelanggan', label: 'Pelanggan', icon: Users2 },
  { href: '/produk', label: 'Produk', icon: PackagePlus },
  { href: '/bon', label: 'Bon', icon: FileText },
  { href: '/laporan', label: 'Laporan', icon: FileText },
];

export function BottomNav() {
  const { auth, logout } = useData();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white z-30">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1 rounded-3xl px-3 py-2 text-center text-slate-600 hover:bg-slate-100">
              <div className="mx-auto inline-flex items-center justify-center gap-1">
                <Icon size={18} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            </Link>
          );
        })}
        {auth.isAuthenticated ? (
          <button onClick={logout} className="flex-1 rounded-3xl px-3 py-2 text-slate-600 hover:bg-slate-100">
            <div className="mx-auto inline-flex items-center justify-center gap-1">
              <LogOut size={18} />
              <span className="text-xs font-semibold">Keluar</span>
            </div>
          </button>
        ) : null}
      </div>
    </nav>
  );
}
