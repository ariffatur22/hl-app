'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { useData } from '@/components/DataProvider';
import { formatRupiah } from '@/lib/utils';
import { PlusCircle, Search, Trash2, Edit3 } from 'lucide-react';
import type { ProductType } from '@/lib/types';

export default function ProdukPage() {
  const { products, saveProduct, deleteProduct } = useData();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ nama: string; tipe: ProductType; harga_jual: number; harga_modal: number }>({ nama: '', tipe: 'LM', harga_jual: 0, harga_modal: 0 });

  const visibleProducts = useMemo(
    () => products.filter((product) => product.status === 'aktif' && product.nama.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );

  function resetForm() {
    setEditingId(null);
    setForm({ nama: '', tipe: 'LM', harga_jual: 0, harga_modal: 0 });
  }

  function startEdit(id: string) {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    setEditingId(product.id);
    setForm({ nama: product.nama, tipe: product.tipe, harga_jual: product.harga_jual, harga_modal: product.harga_modal });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProduct({ id: editingId ?? undefined, ...form });
    resetForm();
  }

  return (
    <PageShell title="Produk" subtitle="Kelola produk LM dan BR." >
      <div className="grid gap-5">
        <section className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Nama Produk *</label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg"
              />
            </div>
            <div>
              <label className="field-label">Jenis Produk *</label>
              <div className="flex flex-wrap gap-3">
                {['LM', 'BR'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, tipe: type as 'LM' | 'BR' })}
                    className={`rounded-3xl px-4 py-3 text-lg ${form.tipe === type ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label">Harga Jual (Rp) *</label>
                <input
                  type="number"
                  min={0}
                  value={form.harga_jual}
                  onChange={(e) => setForm({ ...form, harga_jual: Number(e.target.value) })}
                  className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg"
                />
              </div>
              <div>
                <label className="field-label">Harga Beli / Modal *</label>
                <input
                  type="number"
                  min={0}
                  value={form.harga_modal}
                  onChange={(e) => setForm({ ...form, harga_modal: Number(e.target.value) })}
                  className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="primary-button flex-1 flex items-center justify-center gap-2">
                <PlusCircle size={18} /> Simpan Produk
              </button>
              <button type="button" onClick={resetForm} className="secondary-button flex-1">
                Batal
              </button>
            </div>
          </form>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-lg"
            />
          </div>
          <div className="mt-5 space-y-3">
            {visibleProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">Tidak ada produk aktif.</div>
            ) : (
              visibleProducts.map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{product.nama}</h2>
                      <p className="text-slate-600">{product.tipe} • {formatRupiah(product.harga_jual)} / modal {formatRupiah(product.harga_modal)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(product.id)} className="rounded-2xl border border-primary px-4 py-2 text-primary">
                        <Edit3 size={16} /> Edit
                      </button>
                      <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-2xl border border-danger px-4 py-2 text-danger">
                        <Trash2 size={16} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
