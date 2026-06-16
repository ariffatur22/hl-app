import { Customer, Bon, BonItem, Product } from './types';

export function formatRupiah(value: number) {
  const amount = Math.max(0, Math.round(value));
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function applyTieredDiscount(price: number, discounts: number[]) {
  return discounts.reduce((current, discount) => {
    const valid = Number.isFinite(discount) ? discount : 0;
    return current * (1 - Math.min(100, Math.max(0, valid)) / 100);
  }, price);
}

export function calculateBonItem(product: Product, customer: Customer, qty: number, isBonus: boolean): BonItem {
  const discounts = product.tipe === 'LM' ? customer.diskon_LM : customer.diskon_BR;
  const unitPrice = applyTieredDiscount(product.harga_jual, discounts);
  const lineOmzet = isBonus ? 0 : unitPrice * qty;
  const lineLaba = isBonus ? 0 : (unitPrice - product.harga_modal) * qty;

  return {
    id: `${product.id}-${Date.now()}`,
    produk_id: product.id,
    qty,
    harga_jual: Math.round(unitPrice),
    diskon_applied: discounts,
    omzet_line: Math.round(lineOmzet),
    laba_line: Math.round(lineLaba),
    tipe: product.tipe,
  };
}

export function calculateBonTotals(bon: Bon) {
  const totalOmzet = bon.items.reduce((sum, item) => sum + item.omzet_line, 0);
  const totalLaba = bon.items.reduce((sum, item) => sum + item.laba_line, 0);
  const totalTagihan = totalOmzet + bon.ongkir;
  return { totalOmzet, totalLaba, totalTagihan };
}

export function getCustomerBonusInfo(customer: Customer, bons: Bon[]) {
  const lunasOmzet = bons.filter((bon) => bon.pelanggan_id === customer.id && bon.status === 'Lunas' && !bon.is_bonus)
    .reduce((sum, bon) => sum + bon.items.reduce((lineSum, item) => lineSum + item.omzet_line, 0), 0);
  const bonusGranted = bons.filter((bon) => bon.pelanggan_id === customer.id && bon.status === 'Lunas' && bon.is_bonus).length;
  const available = customer.batas_bonus > 0 ? Math.floor(lunasOmzet / customer.batas_bonus) - bonusGranted : 0;
  return {
    lunasOmzet,
    bonusGranted,
    available: Math.max(0, available),
  };
}

export function getCustomerMonthSummary(customer: Customer, bons: Bon[], yearMonth: string) {
  const filtered = bons.filter((bon) => bon.pelanggan_id === customer.id && bon.tanggal.startsWith(yearMonth));
  const piutang = filtered.filter((bon) => bon.status === 'Piutang').reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
  const lunas = filtered.filter((bon) => bon.status === 'Lunas').reduce((sum, bon) => sum + calculateBonTotals(bon).totalTagihan, 0);
  const omzetLM = filtered.filter((bon) => bon.status === 'Lunas').flatMap((bon) => bon.items).filter((item) => item.tipe === 'LM').reduce((sum, item) => sum + item.omzet_line, 0);
  const omzetBR = filtered.filter((bon) => bon.status === 'Lunas').flatMap((bon) => bon.items).filter((item) => item.tipe === 'BR').reduce((sum, item) => sum + item.omzet_line, 0);
  const laba = filtered.filter((bon) => bon.status === 'Lunas').reduce((sum, bon) => sum + calculateBonTotals(bon).totalLaba, 0);
  return { piutang, lunas, omzetLM, omzetBR, laba };
}

export function getYearMonth(dateString: string) {
  return dateString.slice(0, 7);
}

export function uniqueId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}-${Date.now()}`;
}
