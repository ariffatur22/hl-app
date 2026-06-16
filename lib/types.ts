export type ProductType = 'LM' | 'BR';
export type Status = 'aktif' | 'dihapus';
export type BonStatus = 'Piutang' | 'Lunas';

export interface Customer {
  id: string;
  nama: string;
  diskon_LM: number[];
  diskon_BR: number[];
  batas_bonus: number;
  status: Status;
}

export interface Product {
  id: string;
  nama: string;
  harga_modal: number;
  harga_jual: number;
  tipe: ProductType;
  status: Status;
}

export interface BonItem {
  id: string;
  produk_id: string;
  qty: number;
  harga_jual: number;
  diskon_applied: number[];
  omzet_line: number;
  laba_line: number;
  tipe: ProductType;
}

export interface Bon {
  id: string;
  tanggal: string;
  nomor_bon: string;
  pelanggan_id: string;
  items: BonItem[];
  ongkir: number;
  deskripsi: string;
  is_bonus: boolean;
  status: BonStatus;
  tanggal_lunas: string | null;
  deleted?: boolean;
}
