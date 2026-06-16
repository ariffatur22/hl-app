'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { useData } from '@/components/DataProvider';
import { formatRupiah, getYearMonth, calculateBonTotals } from '@/lib/utils';

const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

export default function LaporanPage() {
  const { bons, customers } = useData();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear().toString());
  const [month, setMonth] = useState(getYearMonth(today.toISOString()).slice(5));
  const [mode, setMode] = useState<'Keseluruhan' | 'Per Pelanggan' | 'Per Jenis'>('Keseluruhan');
  const selectedYearMonth = `${year}-${month}`;

  const filteredBons = useMemo(
    () => bons.filter((bon) => bon.tanggal.startsWith(selectedYearMonth) && bon.status === 'Lunas'),
    [bons, selectedYearMonth],
  );

  const totals = useMemo(() => {
    const totalOmzet = filteredBons.reduce((sum, bon) => sum + calculateBonTotals(bon).totalOmzet, 0);
    const totalLaba = filteredBons.reduce((sum, bon) => sum + calculateBonTotals(bon).totalLaba, 0);
    const totalTagihan = filteredBons.reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
    const totalPiutang = bons.filter((bon) => bon.tanggal.startsWith(selectedYearMonth) && bon.status === 'Piutang').reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
    const totalLunas = totalTagihan;
    const omzetLM = filteredBons.flatMap((bon) => bon.items).filter((item) => item.tipe === 'LM').reduce((sum, item) => sum + item.omzet_line, 0);
    const omzetBR = filteredBons.flatMap((bon) => bon.items).filter((item) => item.tipe === 'BR').reduce((sum, item) => sum + item.omzet_line, 0);
    const bonusCount = bons.filter((bon) => bon.is_bonus && bon.tanggal.startsWith(selectedYearMonth)).length;
    return { totalOmzet, totalLaba, totalPiutang, totalLunas, omzetLM, omzetBR, bonusCount };
  }, [filteredBons, bons, selectedYearMonth]);

  const perCustomer = useMemo(() => {
    return customers
      .filter((customer) => customer.status === 'aktif')
      .map((customer) => {
        const customerBons = filteredBons.filter((bon) => bon.pelanggan_id === customer.id);
        const omzet = customerBons.reduce((sum, bon) => sum + calculateBonTotals(bon).totalOmzet, 0);
        const laba = customerBons.reduce((sum, bon) => sum + calculateBonTotals(bon).totalLaba, 0);
        return { customer, omzet, laba };
      })
      .filter((item) => item.omzet > 0);
  }, [customers, filteredBons]);

  return (
    <PageShell title="Laporan" subtitle="Ringkasan omzet dan laba per periode." >
      <div className="grid gap-5">
        <section className="card p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="field-label">Tahun</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg" />
            </div>
            <div>
              <label className="field-label">Bulan</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg">
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Jenis Laporan</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg">
                <option value="Keseluruhan">Keseluruhan</option>
                <option value="Per Pelanggan">Per Pelanggan</option>
                <option value="Per Jenis">Per Jenis</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Omzet (Lunas)</p>
              <p className="mt-3 text-3xl font-bold">{formatRupiah(totals.totalOmzet)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Laba HL</p>
              <p className="mt-3 text-3xl font-bold">{formatRupiah(totals.totalLaba)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Piutang</p>
              <p className="mt-3 text-3xl font-bold text-danger">{formatRupiah(totals.totalPiutang)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Sudah Dibayar</p>
              <p className="mt-3 text-3xl font-bold text-success">{formatRupiah(totals.totalLunas)}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Omzet LM</p>
              <p className="mt-3 text-xl font-semibold">{formatRupiah(totals.omzetLM)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Omzet BR</p>
              <p className="mt-3 text-xl font-semibold">{formatRupiah(totals.omzetBR)}</p>
            </div>
          </div>
        </section>

        {mode === 'Per Pelanggan' ? (
          <section className="card p-5">
            <h2 className="text-xl font-semibold">Laporan Per Pelanggan</h2>
            <div className="mt-4 space-y-3">
              {perCustomer.length === 0 ? (
                <p className="text-slate-500">Tidak ada data pelanggan untuk periode ini.</p>
              ) : (
                perCustomer.map((item) => (
                  <div key={item.customer.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.customer.nama}</p>
                      <p className="text-slate-500">Laba {formatRupiah(item.laba)}</p>
                    </div>
                    <p className="mt-2 text-slate-600">Omzet Rp {formatRupiah(item.omzet)}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}

        {mode === 'Per Jenis' ? (
          <section className="card p-5">
            <h2 className="text-xl font-semibold">Laporan Per Jenis</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-slate-500">Omzet LM</p>
                <p className="mt-3 text-2xl font-semibold">{formatRupiah(totals.omzetLM)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-slate-500">Omzet BR</p>
                <p className="mt-3 text-2xl font-semibold">{formatRupiah(totals.omzetBR)}</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
