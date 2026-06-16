'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { applyTieredDiscount, calculateBonItem, calculateBonTotals, getCustomerBonusInfo, getYearMonth, uniqueId } from '@/lib/utils';
import type { Bon, Customer, Product, BonItem } from '@/lib/types';

const STORAGE_KEY = 'hl-app-state';

interface ToastState {
  message: string;
  type: 'success' | 'error' | '';
}

interface AuthState {
  isAuthenticated: boolean;
}

interface DataContextValue {
  auth: AuthState;
  customers: Customer[];
  products: Product[];
  bons: Bon[];
  toast: ToastState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  saveCustomer: (customer: Omit<Customer, 'id' | 'status'> & { id?: string; status?: Customer['status'] }) => void;
  deleteCustomer: (id: string) => void;
  saveProduct: (product: Omit<Product, 'id' | 'status'> & { id?: string; status?: Product['status'] }) => void;
  deleteProduct: (id: string) => void;
  saveBon: (bon: Omit<Bon, 'id' | 'items' | 'tanggal_lunas' | 'status'> & { items: { produk_id: string; qty: number }[]; status?: Bon['status'] }) => boolean;
  deleteBon: (id: string) => void;
  markBonLunas: (id: string, tanggal: string) => void;
  markMonthLunas: (pelangganId: string, yearMonth: string, tanggal: string) => void;
  getCustomerBonusInfo: (customer: Customer) => ReturnType<typeof getCustomerBonusInfo>;
  getCustomerMonthSummary: (customer: Customer, yearMonth: string) => { piutang: number; lunas: number; omzetLM: number; omzetBR: number; laba: number };
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const initialCustomers: Customer[] = [
  {
    id: 'c1',
    nama: 'Bu Ani',
    diskon_LM: [20, 20, 10],
    diskon_BR: [15],
    batas_bonus: 10000000,
    status: 'aktif',
  },
  {
    id: 'c2',
    nama: 'Pak Budi',
    diskon_LM: [15],
    diskon_BR: [10, 5],
    batas_bonus: 8000000,
    status: 'aktif',
  },
];

const initialProducts: Product[] = [
  {
    id: 'p1',
    nama: 'Produk A',
    harga_modal: 40000,
    harga_jual: 100000,
    tipe: 'LM',
    status: 'aktif',
  },
  {
    id: 'p2',
    nama: 'Produk B',
    harga_modal: 35000,
    harga_jual: 50000,
    tipe: 'BR',
    status: 'aktif',
  },
];

const initialBons: Bon[] = [];

function loadState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { auth: AuthState; customers: Customer[]; products: Product[]; bons: Bon[] };
  } catch {
    return null;
  }
}

function saveState(data: { auth: AuthState; customers: Customer[]; products: Product[]; bons: Bon[] }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false });
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [bons, setBons] = useState<Bon[]>(initialBons);
  const [toast, setToast] = useState<ToastState>({ message: '', type: '' });

  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setAuth(loaded.auth);
      setCustomers(loaded.customers);
      setProducts(loaded.products);
      setBons(loaded.bons);
    }
  }, []);

  useEffect(() => {
    saveState({ auth, customers, products, bons });
  }, [auth, customers, products, bons]);

  useEffect(() => {
    if (!auth.isAuthenticated && pathname !== '/') {
      router.replace('/');
    }
  }, [auth.isAuthenticated, pathname, router]);

  useEffect(() => {
    if (!toast.message) return;
    const timer = window.setTimeout(() => setToast({ message: '', type: '' }), 3100);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  function login(username: string, password: string) {
    if (username === 'admin' && password === 'hl123') {
      setAuth({ isAuthenticated: true });
      showToast('Berhasil masuk ke aplikasi.', 'success');
      return true;
    }
    showToast('Username atau password salah. Coba lagi.', 'error');
    return false;
  }

  function logout() {
    setAuth({ isAuthenticated: false });
    showToast('Anda telah keluar.', 'success');
    router.replace('/');
  }

  function saveCustomer(customer: Omit<Customer, 'id' | 'status'> & { id?: string; status?: Customer['status'] }) {
    if (!customer.nama.trim()) {
      showToast('Nama pelanggan wajib diisi.', 'error');
      return;
    }
    if (!Array.isArray(customer.diskon_LM) || !Array.isArray(customer.diskon_BR)) {
      showToast('Diskon pelanggan tidak valid.', 'error');
      return;
    }
    const normalized: Customer = {
      id: customer.id ?? uniqueId('pelanggan'),
      nama: customer.nama.trim(),
      diskon_LM: customer.diskon_LM.map((n) => Math.max(0, Math.min(100, Math.round(n)))),
      diskon_BR: customer.diskon_BR.map((n) => Math.max(0, Math.min(100, Math.round(n)))),
      batas_bonus: Math.max(0, Math.round(customer.batas_bonus)),
      status: customer.status ?? 'aktif',
    };

    setCustomers((current) => {
      const index = current.findIndex((item) => item.id === normalized.id);
      if (index >= 0) {
        const next = [...current];
        next[index] = normalized;
        return next;
      }
      return [...current, normalized];
    });
    showToast('Data pelanggan tersimpan.', 'success');
  }

  function deleteCustomer(id: string) {
    setCustomers((current) => current.map((customer) => (customer.id === id ? { ...customer, status: 'dihapus' } : customer)));
    showToast('Pelanggan dihapus dari daftar baru.', 'success');
  }

  function saveProduct(product: Omit<Product, 'id' | 'status'> & { id?: string; status?: Product['status'] }) {
    if (!product.nama.trim()) {
      showToast('Nama produk wajib diisi.', 'error');
      return;
    }
    if (product.harga_modal < 0 || product.harga_jual < 0) {
      showToast('Harga tidak boleh negatif.', 'error');
      return;
    }
    const normalized: Product = {
      id: product.id ?? uniqueId('produk'),
      nama: product.nama.trim(),
      harga_modal: Math.max(0, Math.round(product.harga_modal)),
      harga_jual: Math.max(0, Math.round(product.harga_jual)),
      tipe: product.tipe,
      status: product.status ?? 'aktif',
    };
    setProducts((current) => {
      const index = current.findIndex((item) => item.id === normalized.id);
      if (index >= 0) {
        const next = [...current];
        next[index] = normalized;
        return next;
      }
      return [...current, normalized];
    });
    showToast('Data produk tersimpan.', 'success');
  }

  function deleteProduct(id: string) {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, status: 'dihapus' } : product)));
    showToast('Produk dihapus dari pilihan baru.', 'success');
  }

  function saveBon(bon: Omit<Bon, 'id' | 'items' | 'status' | 'tanggal_lunas'> & { items: { produk_id: string; qty: number }[]; }) {
    if (!bon.nomor_bon.trim()) {
      showToast('Nomor bon wajib diisi.', 'error');
      return false;
    }
    if (!bon.pelanggan_id) {
      showToast('Pilih pelanggan terlebih dahulu.', 'error');
      return false;
    }
    const existing = bons.find((item) => item.nomor_bon === bon.nomor_bon);
    if (existing) {
      showToast('Nomor bon sudah dipakai, coba nomor lain.', 'error');
      return false;
    }
    const customer = customers.find((item) => item.id === bon.pelanggan_id && item.status === 'aktif');
    if (!customer) {
      showToast('Pelanggan tidak ditemukan.', 'error');
      return false;
    }
    const items: BonItem[] = bon.items.map((item) => {
      const product = products.find((p) => p.id === item.produk_id && p.status === 'aktif');
      if (!product) throw new Error('Produk tidak ditemukan.');
      return calculateBonItem(product, customer, Math.max(1, item.qty), bon.is_bonus);
    });
    const nextBon: Bon = {
      id: uniqueId('bon'),
      tanggal: bon.tanggal,
      nomor_bon: bon.nomor_bon.trim(),
      pelanggan_id: bon.pelanggan_id,
      items,
      ongkir: Math.max(0, Math.round(bon.ongkir)),
      deskripsi: bon.deskripsi || '',
      is_bonus: bon.is_bonus,
      status: 'Piutang',
      tanggal_lunas: null,
    };
    setBons((current) => [nextBon, ...current]);
    showToast('Bon tersimpan.', 'success');
    return true;
  }

  function deleteBon(id: string) {
    setBons((current) => current.filter((bon) => bon.id !== id));
    showToast('Bon dihapus.', 'success');
  }

  function markBonLunas(id: string, tanggal: string) {
    setBons((current) =>
      current.map((bon) =>
        bon.id === id && bon.status === 'Piutang'
          ? { ...bon, status: 'Lunas', tanggal_lunas: tanggal }
          : bon,
      ),
    );
    showToast('Bon sudah ditandai Lunas.', 'success');
  }

  function markMonthLunas(pelangganId: string, yearMonth: string, tanggal: string) {
    setBons((current) =>
      current.map((bon) =>
        bon.pelanggan_id === pelangganId && bon.tanggal.startsWith(yearMonth) && bon.status === 'Piutang'
          ? { ...bon, status: 'Lunas', tanggal_lunas: tanggal }
          : bon,
      ),
    );
    showToast('Semua bon bulan tersebut telah dilunasi.', 'success');
  }

  function getCustomerMonthSummary(customer: Customer, yearMonth: string) {
    const filtered = bons.filter((bon) => bon.pelanggan_id === customer.id && bon.tanggal.startsWith(yearMonth));
    const piutang = filtered
      .filter((bon) => bon.status === 'Piutang')
      .reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
    const lunas = filtered
      .filter((bon) => bon.status === 'Lunas')
      .reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
    const omzetLM = filtered
      .filter((bon) => bon.status === 'Lunas')
      .flatMap((bon) => bon.items)
      .filter((item) => item.tipe === 'LM')
      .reduce((sum, item) => sum + item.omzet_line, 0);
    const omzetBR = filtered
      .filter((bon) => bon.status === 'Lunas')
      .flatMap((bon) => bon.items)
      .filter((item) => item.tipe === 'BR')
      .reduce((sum, item) => sum + item.omzet_line, 0);
    const laba = filtered
      .filter((bon) => bon.status === 'Lunas')
      .reduce((sum, bon) => sum + calculateBonTotals(bon).totalLaba, 0);
    return { piutang, lunas, omzetLM, omzetBR, laba };
  }

  const value = useMemo(
    () => ({
      auth,
      customers,
      products,
      bons,
      toast,
      login,
      logout,
      showToast,
      saveCustomer,
      deleteCustomer,
      saveProduct,
      deleteProduct,
      saveBon,
      deleteBon,
      markBonLunas,
      markMonthLunas,
      getCustomerBonusInfo: (customer: Customer) => getCustomerBonusInfo(customer, bons),
      getCustomerMonthSummary,
    }),
    [auth, customers, products, bons, toast],
  );

  return (
    <DataContext.Provider value={value}>
      {children}
      {toast.message ? (
        <div className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-3xl px-5 py-4 text-white shadow-xl ${toast.type === 'error' ? 'bg-danger' : 'bg-success'}`}>
          {toast.message}
        </div>
      ) : null}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
