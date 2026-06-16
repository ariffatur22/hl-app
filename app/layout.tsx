import '@/styles/globals.css';
import type { Metadata } from 'next';
import { DataProvider } from '@/components/DataProvider';

export const metadata: Metadata = {
  title: 'HL App',
  description: 'Aplikasi penjualan dan piutang HL untuk pemilik bisnis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
