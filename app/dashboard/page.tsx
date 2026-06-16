'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { PageShell } from '@/components/PageShell';
import { useData } from '@/components/DataProvider';
import { formatRupiah, getYearMonth, calculateBonTotals } from '@/lib/utils';
import { Gift, PlusCircle, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { bons, customers, getCustomerBonusInfo } = useData();
  const currentMonth = getYearMonth(new Date().toISOString());

  const totals = useMemo(() => {
    const piutang = bons
      .filter((bon) => bon.status === 'Piutang' && bon.tanggal.startsWith(currentMonth))
      .reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
    const lunas = bons
      .filter((bon) => bon.status === 'Lunas' && bon.tanggal.startsWith(currentMonth))
      .reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
    return { piutang, lunas };
  }, [bons, currentMonth]);

  const bonusCustomers = useMemo(() => customers.filter((customer) => getCustomerBonusInfo(customer).available > 0), [customers, getCustomerBonusInfo]);
  const bonusCount = bonusCustomers.reduce((sum, customer) => sum + getCustomerBonusInfo(customer).available, 0);

  return (
    <PageShell title="Beranda" subtitle="Ringkasan bisnis bulan ini." >
      <div className="grid gap-4">
        <section className="card p-5">
          <p className="text-slate-500">Halo! Selamat datang ✨</p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Piutang Bulan Ini</p>
              <p className="mt-3 text-3xl font-bold text-danger">{formatRupiah(totals.piutang)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Lunas Bulan Ini</p>
              <p className="mt-3 text-3xl font-bold text-success">{formatRupiah(totals.lunas)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Pelanggan Ada Bonus</p>
                <p className="mt-3 text-3xl font-bold text-warning">{bonusCount}</p>
              </div>
              <Gift size={34} className="text-warning" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/bon" className="primary-button flex items-center justify-center gap-2">
              <PlusCircle size={18} /> Buat Bon Baru
            </Link>
            <Link href="/laporan" className="secondary-button flex items-center justify-center gap-2">
              <FileText size={18} /> Laporan
            </Link>
          </div>
        </section>

        {bonusCustomers.length > 0 ? (
          <section className="card p-5">
            <h2 className="text-xl font-semibold">Bonus Tersedia</h2>
            <div className="mt-4 space-y-3">
              {bonusCustomers.map((customer) => {
                const info = getCustomerBonusInfo(customer);
                return (
                  <div key={customer.id} className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-semibold">{customer.nama}</p>
                    <p className="mt-1 text-sm text-slate-700">Bonus tersedia: {info.available} bonus</p>
                    <p className="mt-2 text-sm text-slate-600">Akumulasi Rp {formatRupiah(info.lunasOmzet)} / batas Rp {formatRupiah(customer.batas_bonus)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
