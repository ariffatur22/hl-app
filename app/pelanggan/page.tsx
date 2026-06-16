'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { useData } from '@/components/DataProvider';
import { formatRupiah } from '@/lib/utils';
import { PlusCircle, Search, Trash2, Edit3 } from 'lucide-react';

export default function PelangganPage() {
  const { customers, saveCustomer, deleteCustomer, getCustomerBonusInfo } = useData();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: '', batas_bonus: 0, diskon_LM: [20], diskon_BR: [15] });

  const visibleCustomers = useMemo(
    () => customers.filter((customer) => customer.status === 'aktif' && customer.nama.toLowerCase().includes(search.toLowerCase())),
    [customers, search],
  );

  function resetForm() {
    setEditingId(null);
    setForm({ nama: '', batas_bonus: 0, diskon_LM: [20], diskon_BR: [15] });
  }

  function startEdit(customerId: string) {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return;
    setEditingId(customer.id);
    setForm({ nama: customer.nama, batas_bonus: customer.batas_bonus, diskon_LM: customer.diskon_LM, diskon_BR: customer.diskon_BR });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCustomer({ id: editingId ?? undefined, ...form });
    resetForm();
  }

  function updateStep(list: 'diskon_LM' | 'diskon_BR', index: number, value: number) {
    setForm((current) => {
      const copy = [...current[list]];
      copy[index] = value;
      return { ...current, [list]: copy };
    });
  }

  function addStep(list: 'diskon_LM' | 'diskon_BR') {
    setForm((current) => ({ ...current, [list]: [...current[list], 0] }));
  }

  function removeStep(list: 'diskon_LM' | 'diskon_BR', index: number) {
    setForm((current) => ({ ...current, [list]: current[list].filter((_, i) => i !== index) }));
  }

  return (
    <PageShell title="Pelanggan" subtitle="Kelola pelanggan dan diskon bertingkat." >
      <div className="grid gap-5">
        <section className="card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-slate-500">Tambah atau perbarui data pelanggan.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="field-label">Nama Pelanggan *</label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg"
              />
            </div>
            <div>
              <label className="field-label">Batas Bonus (Rp) *</label>
              <input
                type="number"
                min={0}
                value={form.batas_bonus}
                onChange={(e) => setForm({ ...form, batas_bonus: Number(e.target.value) })}
                className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold">Diskon LM</p>
                <div className="mt-3 space-y-3">
                  {form.diskon_LM.map((value, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(e) => updateStep('diskon_LM', index, Number(e.target.value))}
                        className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-lg"
                      />
                      <button type="button" onClick={() => removeStep('diskon_LM', index)} className="rounded-full bg-danger px-3 py-2 text-white">
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addStep('diskon_LM')} className="mt-4 secondary-button w-full">
                  + Tambah Langkah
                </button>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold">Diskon BR</p>
                <div className="mt-3 space-y-3">
                  {form.diskon_BR.map((value, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(e) => updateStep('diskon_BR', index, Number(e.target.value))}
                        className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-lg"
                      />
                      <button type="button" onClick={() => removeStep('diskon_BR', index)} className="rounded-full bg-danger px-3 py-2 text-white">
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addStep('diskon_BR')} className="mt-4 secondary-button w-full">
                  + Tambah Langkah
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="primary-button flex-1 flex items-center justify-center gap-2">
                <PlusCircle size={18} /> Simpan Pelanggan
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
              placeholder="Cari pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-lg"
            />
          </div>
          <div className="mt-5 space-y-3">
            {visibleCustomers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">Tidak ada pelanggan aktif.</div>
            ) : (
              visibleCustomers.map((customer) => {
                const bonusInfo = getCustomerBonusInfo(customer);
                return (
                  <div key={customer.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">{customer.nama}</h2>
                        <p className="text-slate-600">Batas bonus: {formatRupiah(customer.batas_bonus)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {bonusInfo.available > 0 ? <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">Bonus tersedia {bonusInfo.available}</span> : null}
                        <button type="button" onClick={() => startEdit(customer.id)} className="rounded-2xl border border-primary px-4 py-2 text-primary">
                          <Edit3 size={16} /> Edit
                        </button>
                        <button type="button" onClick={() => deleteCustomer(customer.id)} className="rounded-2xl border border-danger px-4 py-2 text-danger">
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
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
