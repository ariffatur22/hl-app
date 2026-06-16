'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { useData } from '@/components/DataProvider';
import { formatRupiah, getYearMonth, calculateBonTotals, uniqueId } from '@/lib/utils';
import { PlusCircle, Search, Plus, Trash2, CheckCircle } from 'lucide-react';

const statusTabs = ['Semua', 'Piutang', 'Lunas', 'Bonus'] as const;

export default function BonPage() {
  const { bons, customers, products, saveBon, deleteBon, markBonLunas } = useData();
  const [filter, setFilter] = useState<(typeof statusTabs)[number]>('Semua');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ tanggal: new Date().toISOString().slice(0, 10), nomor_bon: '', pelanggan_id: '', ongkir: 0, deskripsi: '', is_bonus: false, items: [{ produk_id: '', qty: 1 }] });

  const filteredBons = useMemo(() => {
    return bons.filter((bon) => {
      if (filter === 'Piutang' && bon.status !== 'Piutang') return false;
      if (filter === 'Lunas' && bon.status !== 'Lunas') return false;
      if (filter === 'Bonus' && !bon.is_bonus) return false;
      if (filter === 'Semua' && !bon) return true;
      const query = search.toLowerCase();
      const pelanggan = customers.find((customer) => customer.id === bon.pelanggan_id);
      return bon.nomor_bon.toLowerCase().includes(query) || pelanggan?.nama.toLowerCase().includes(query);
    });
  }, [bons, filter, search, customers]);

  function updateItem(index: number, field: 'produk_id' | 'qty', value: string | number) {
    setForm((current) => {
      const items = [...current.items];
      items[index] = { ...items[index], [field]: field === 'qty' ? Number(value) : value };
      return { ...current, items };
    });
  }

  function addItem() {
    setForm((current) => ({ ...current, items: [...current.items, { produk_id: '', qty: 1 }] }));
  }

  function removeItem(index: number) {
    setForm((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!saveBon({ ...form, items: form.items.filter((item) => item.produk_id) })) {
      return;
    }
    setForm({ tanggal: new Date().toISOString().slice(0, 10), nomor_bon: '', pelanggan_id: '', ongkir: 0, deskripsi: '', is_bonus: false, items: [{ produk_id: '', qty: 1 }] });
    setFormOpen(false);
  }

  const statusCount = useMemo(() => {
    return {
      piutang: bons.filter((bon) => bon.status === 'Piutang').length,
      lunas: bons.filter((bon) => bon.status === 'Lunas').length,
      bonus: bons.filter((bon) => bon.is_bonus).length,
    };
  }, [bons]);

  return (
    <PageShell title="Bon" subtitle="Buat, lihat, dan kelola bon." >
      <div className="grid gap-5">
        <section className="card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-slate-500">Kelola bon penjualan dan catat status piutang.</p>
            </div>
            <button type="button" onClick={() => setFormOpen((open) => !open)} className="primary-button flex items-center justify-center gap-2 w-full sm:w-auto">
              <PlusCircle size={18} /> {formOpen ? 'Sembunyikan Form' : 'Buat Bon Baru'}
            </button>
          </div>

          {formOpen ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Tanggal *</label>
                  <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg" />
                </div>
                <div>
                  <label className="field-label">Nomor Bon *</label>
                  <input type="text" value={form.nomor_bon} onChange={(e) => setForm({ ...form, nomor_bon: e.target.value })} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg" />
                </div>
              </div>
              <div>
                <label className="field-label">Pelanggan *</label>
                <select value={form.pelanggan_id} onChange={(e) => setForm({ ...form, pelanggan_id: e.target.value })} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg">
                  <option value="">Pilih pelanggan</option>
                  {customers.filter((c) => c.status === 'aktif').map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.nama}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-3xl border border-slate-300 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Daftar Produk</p>
                  <button type="button" onClick={addItem} className="secondary-button">
                    <Plus size={16} /> Tambah Produk Lagi
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {form.items.map((item, index) => (
                    <div key={index} className="rounded-3xl border border-slate-200 p-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <select value={item.produk_id} onChange={(e) => updateItem(index, 'produk_id', e.target.value)} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg">
                          <option value="">Pilih produk</option>
                          {products.filter((product) => product.status === 'aktif').map((product) => (
                            <option key={product.id} value={product.id}>{product.nama} ({product.tipe})</option>
                          ))}
                        </select>
                        <input type="number" min={1} value={item.qty} onChange={(e) => updateItem(index, 'qty', Number(e.target.value))} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg" />
                        <button type="button" onClick={() => removeItem(index)} className="rounded-3xl bg-danger px-4 py-4 text-white">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Ongkir (Rp)</label>
                  <input type="number" min={0} value={form.ongkir} onChange={(e) => setForm({ ...form, ongkir: Number(e.target.value) })} className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg" />
                </div>
                <div>
                  <label className="field-label">Bon Bonus</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setForm((current) => ({ ...current, is_bonus: !current.is_bonus }))} className={`rounded-3xl px-4 py-4 text-lg ${form.is_bonus ? 'bg-warning text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {form.is_bonus ? 'BON BONUS: ON' : 'BON BONUS: OFF'}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="field-label">Keterangan</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full min-h-[100px] rounded-3xl border border-slate-300 px-4 py-4 text-lg" />
              </div>
              <button type="submit" className="primary-button w-full">
                Simpan Bon
              </button>
            </form>
          ) : null}
        </section>

        <section className="card p-5">
          <div className="flex flex-wrap items-center gap-3">
            {statusTabs.map((tab) => (
              <button key={tab} type="button" onClick={() => setFilter(tab)} className={`rounded-3xl px-4 py-3 text-sm font-semibold ${filter === tab ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
                {tab} {tab === 'Piutang' ? `(${statusCount.piutang})` : tab === 'Lunas' ? `(${statusCount.lunas})` : tab === 'Bonus' ? `(${statusCount.bonus})` : ''}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Search size={18} />
            <input placeholder="Cari nomor bon atau pelanggan" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-lg" />
          </div>
          <div className="mt-5 space-y-3">
            {filteredBons.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">Tidak ada bon pada filter ini.</div>
            ) : (
              filteredBons.map((bon) => {
                const totals = calculateBonTotals(bon);
                const pelanggan = customers.find((customer) => customer.id === bon.pelanggan_id);
                return (
                  <div key={bon.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{bon.tanggal}</p>
                        <h2 className="text-lg font-semibold">{bon.nomor_bon}</h2>
                        <p className="text-slate-600">{pelanggan?.nama ?? 'Pelanggan tidak ditemukan'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatRupiah(totals.totalTagihan)}</p>
                        <p className={`text-sm font-semibold ${bon.status === 'Piutang' ? 'text-danger' : 'text-success'}`}>{bon.status}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {bon.is_bonus ? <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">BONUS</span> : null}
                      {bon.status === 'Piutang' ? (
                        <button type="button" onClick={() => markBonLunas(bon.id, new Date().toISOString().slice(0, 10))} className="rounded-3xl bg-success px-4 py-2 text-white">
                          <CheckCircle size={16} /> Tandai Lunas
                        </button>
                      ) : null}
                      <button type="button" onClick={() => deleteBon(bon.id)} className="rounded-3xl bg-danger px-4 py-2 text-white">
                        <Trash2 size={16} /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
