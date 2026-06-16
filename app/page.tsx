'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/components/DataProvider';
import { Lock, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { auth, login, toast } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [auth.isAuthenticated, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = login(username.trim(), password.trim());
    if (success) {
      router.replace('/dashboard');
      return;
    }
    setError('Username atau password salah. Coba lagi.');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md bg-white rounded-[30px] p-8 shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            HL
          </div>
          <h1 className="text-3xl font-bold">Aplikasi HL</h1>
          <p className="text-slate-600 mt-2">Silakan masuk untuk melanjutkan.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="text-danger text-sm">{error}</p> : null}
          {toast.message ? <p className="text-success text-sm">{toast.message}</p> : null}
          <button type="submit" className="primary-button w-full flex items-center justify-center gap-2">
            <Lock size={18} /> Masuk
          </button>
        </form>
        <div className="mt-6 rounded-3xl bg-slate-100 p-4 text-slate-700">
          <p className="font-semibold">Petunjuk cepat</p>
          <p className="mt-2 text-sm">Gunakan username <strong>strong</strong> dan password <strong>strong1</strong>.</p>
        </div>
      </section>
    </main>
  );
}
