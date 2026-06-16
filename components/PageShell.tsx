'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backHref?: string;
}

export function PageShell({ title, subtitle, children, backHref }: PageShellProps) {
  return (
    <div className="min-h-screen pb-32 bg-slate-100">
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            {backHref ? (
              <Link href={backHref} className="inline-flex items-center gap-2 text-primary font-semibold">
                <ArrowLeft size={18} /> Kembali
              </Link>
            ) : null}
            <h1 className="text-3xl font-bold leading-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
          </div>
        </header>
        <div>{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
