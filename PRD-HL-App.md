# PRD — Aplikasi Penjualan & Piutang HL

**Versi:** 1.0  
**Dibuat:** Juni 2025  
**Pengguna:** Pemilik bisnis HL (1 orang, tidak terbiasa teknologi)  
**Mata Uang:** Rupiah (Rp) — tanpa pajak/PPN  
**Platform:** Web app (mobile-first, bisa dibuka di HP)
**Next.js**Framework utama (halaman, routing, logika)
**Tailwind CSS** Tampilan / styling
**Supabase** Database + Auth (login)
**next-pwa** Supaya bisa "diinstal" di HP seperti aplikasi

---

## Daftar Isi

1. [Tujuan Aplikasi](#1-tujuan-aplikasi)
2. [Kamus Istilah](#2-kamus-istilah)
3. [Prinsip Desain — Ramah Orang Tua](#3-prinsip-desain--ramah-orang-tua)
4. [Arsitektur Halaman](#4-arsitektur-halaman)
5. [Fitur: Login](#5-fitur-login)
6. [Fitur: Beranda / Dashboard](#6-fitur-beranda--dashboard)
7. [Fitur: Kelola Pelanggan](#7-fitur-kelola-pelanggan)
8. [Fitur: Kelola Produk](#8-fitur-kelola-produk)
9. [Fitur: Buat & Kelola Bon](#9-fitur-buat--kelola-bon)
10. [Fitur: Sistem Bonus](#10-fitur-sistem-bonus)
11. [Fitur: Detail Pelanggan & Pelunasan](#11-fitur-detail-pelanggan--pelunasan)
12. [Fitur: Laporan](#12-fitur-laporan)
13. [Rumus Perhitungan](#13-rumus-perhitungan-sumber-kebenaran-tunggal)
14. [Keputusan Desain yang Sudah Final](#14-keputusan-desain-yang-sudah-final)
15. [Contoh Skenario Nyata](#15-contoh-skenario-nyata)
16. [Checklist Developer](#16-checklist-developer)

---

## 1. Tujuan Aplikasi

Aplikasi ini membantu pemilik bisnis HL mencatat penjualan, memantau siapa yang belum bayar, dan melihat laporan keuntungan — **tanpa perlu keahlian komputer khusus.**

### Masalah yang Diselesaikan

| Masalah Saat Ini | Solusi di Aplikasi |
|---|---|
| Catat bon manual di buku/kertas | Buat bon digital, tersimpan otomatis |
| Hitung diskon manual, sering salah | Diskon dihitung otomatis sesuai pelanggan |
| Susah tahu siapa yang belum bayar | Daftar piutang langsung terlihat |
| Rekap bulanan makan waktu lama | Laporan tinggal klik, bisa diunduh PDF |
| Bonus pelanggan sering terlupa | Notifikasi bonus otomatis |

---

## 2. Kamus Istilah

> **Catatan Developer:** Gunakan kata-kata ini secara konsisten di seluruh UI. Jangan campur bahasa Inggris dan Indonesia untuk label yang sama.

| Istilah di UI | Artinya |
|---|---|
| **Bon** | Satu nota/struk penjualan |
| **Nomor Bon** | Nomor unik tiap nota (tidak boleh sama) |
| **Piutang** | Belum dibayar. Status awal setiap bon baru |
| **Lunas** | Sudah dibayar penuh |
| **Omzet** | Total nilai penjualan (hanya dari bon Lunas) |
| **Laba HL** | Keuntungan bersih (hanya dari bon Lunas) |
| **LM / BR** | Dua kategori produk — masing-masing punya diskon berbeda per pelanggan |
| **Harga Modal** | Harga beli barang (modal HL). Tidak pernah ditampilkan ke pelanggan |
| **Harga Jual** | Harga normal sebelum diskon |
| **Diskon Bertingkat** | Diskon diterapkan satu per satu, bukan dijumlah (lihat contoh di §13) |
| **Ongkir** | Biaya kirim. Dibebankan ke pelanggan, tidak menambah laba |
| **Bon Bonus** | Nota khusus untuk produk gratis bagi pelanggan yang sudah mencapai target |
| **jt** | Singkatan juta. Contoh: 10jt = Rp 10.000.000 |

---

## 3. Prinsip Desain — Ramah Orang Tua

> **Ini adalah prioritas nomor satu.** Setiap keputusan UI harus melewati pertanyaan: *"Apakah orang yang tidak pernah pakai smartphone bisa mengerti ini?"*

### 3.1 Tipografi & Ukuran

- Font body minimal **16px**, idealnya 18px
- Label dan tombol penting minimal **18px bold**
- Hindari teks abu-abu muda atau tipis — gunakan kontras tinggi
- Spasi antar baris (line-height) minimal 1.6

### 3.2 Tombol & Interaksi

- Tombol aksi utama (Simpan, Lunas, Buat Bon) tinggi minimal **52px**, lebar penuh di mobile
- Jarak antar tombol minimal 12px agar tidak salah klik
- Gunakan **ikon + teks** bersamaan — jangan ikon saja
- Tidak ada aksi penting yang tersembunyi di dropdown atau gesture geser

### 3.3 Warna Status (Konsisten di Seluruh App)

| Status | Warna | Keterangan |
|---|---|---|
| Piutang / Belum Bayar | 🔴 Merah atau Oranye | `#E53E3E` atau `#DD6B20` |
| Lunas / Sudah Bayar | 🟢 Hijau | `#38A169` |
| Bonus | 🟡 Kuning/Emas | `#D69E2E` |
| Informasi / Netral | 🔵 Biru | `#3182CE` |

### 3.4 Pesan & Konfirmasi

- **Setiap penghapusan** wajib tampil modal konfirmasi dengan 2 tombol jelas: `Hapus` (merah) dan `Batal` (abu-abu)
- **Pesan error** ditulis bahasa sehari-hari:
  - ✅ `"Nomor bon sudah dipakai, coba nomor lain"`
  - ❌ `"Duplicate key constraint violation: nomor_bon"`
- **Pesan sukses** selalu ditampilkan (toast/snackbar) setelah simpan, hapus, atau lunas
- Konfirmasi sebelum pelunasan massal (satu bulan)

### 3.5 Navigasi

- Menu utama selalu terlihat (bottom navigation di mobile, sidebar di desktop)
- Setiap halaman punya **judul besar** di atas sehingga pengguna selalu tahu di mana mereka berada
- Tombol **Kembali** selalu ada, bukan hanya tombol back browser
- Tidak ada halaman yang membutuhkan lebih dari **3 klik** dari beranda

### 3.6 Form & Input

- Label ada **di atas** kolom isian (bukan di dalam)
- Kolom wajib diberi tanda `*` dan warna border merah jika kosong
- Keyboard angka otomatis muncul untuk kolom harga/jumlah (input type `number` atau `tel`)
- Tanggal pakai **date picker visual**, bukan ketik manual

---

## 4. Arsitektur Halaman

```
[Login]
    │
    ▼
[Beranda / Dashboard]
    ├── [Daftar Pelanggan]
    │       ├── [Tambah Pelanggan]
    │       ├── [Edit Pelanggan]
    │       └── [Detail Pelanggan]
    │               ├── [Detail Bon]
    │               └── [Pelunasan]
    ├── [Daftar Produk]
    │       ├── [Tambah Produk]
    │       └── [Edit Produk]
    ├── [Bon]
    │       ├── [Buat Bon Baru]
    │       ├── [Daftar Semua Bon]
    │       └── [Detail Bon]
    └── [Laporan]
            ├── [Per Pelanggan]
            ├── [Per Jenis (LM/BR)]
            └── [Keseluruhan]
```

---

## 5. Fitur: Login

### Tampilan

- Halaman penuh dengan logo/nama "HL" di tengah atas
- Dua kolom: Username dan Password
- Satu tombol besar: **"Masuk"**
- Tidak ada link "Lupa Password" atau "Daftar Akun Baru"

### Ketentuan

| Kode | Ketentuan |
|---|---|
| AC-1.1 | Semua fitur terkunci sebelum login |
| AC-1.2 | Hanya 1 akun, tidak ada registrasi |
| AC-1.3 | Login benar → masuk ke Beranda |
| AC-1.4 | Login salah → pesan merah: `"Username atau password salah. Coba lagi."` |
| AC-1.5 | Sesi tetap aktif sampai pengguna klik "Keluar". Tombol Keluar ada di menu utama |

---

## 6. Fitur: Beranda / Dashboard

### Tujuan

Halaman pertama setelah login. Menampilkan ringkasan kondisi bisnis hari ini **dalam sekali pandang** — tanpa scroll.

### Konten Wajib

```
┌─────────────────────────────┐
│  Halo! Selamat datang ✨     │
├─────────────────────────────┤
│  💰 Total Piutang Bulan Ini  │
│     Rp 45.500.000           │ ← merah
├─────────────────────────────┤
│  ✅ Total Lunas Bulan Ini    │
│     Rp 30.000.000           │ ← hijau
├─────────────────────────────┤
│  🎁 Pelanggan Ada Bonus: 2  │ ← kuning/emas, klik langsung ke daftar
├─────────────────────────────┤
│  [+ Buat Bon Baru]  [Laporan]│ ← 2 tombol besar
└─────────────────────────────┘
```

### Ketentuan

- Angka di beranda hanya menampilkan bulan berjalan secara default
- Notifikasi bonus menampilkan jumlah pelanggan yang punya bonus menunggu
- Klik notifikasi bonus → diarahkan ke daftar pelanggan dengan filter bonus tersedia

---

## 7. Fitur: Kelola Pelanggan

### Data yang Disimpan per Pelanggan

```
Pelanggan {
  nama           : string (wajib)
  diskon_LM      : array angka % (contoh: [20, 20, 10])
  diskon_BR      : array angka % (contoh: [15, 10])
  batas_bonus    : number (Rupiah, contoh: 10000000)
  status         : aktif | dihapus (soft-delete)
}
```

### Tampilan Daftar Pelanggan

- Kartu/baris per pelanggan: Nama + jumlah piutang aktif + badge bonus jika ada
- Tombol **[+ Tambah Pelanggan]** di atas daftar, besar dan terlihat
- Search bar di atas untuk cari nama pelanggan
- Urutan: A-Z atau yang punya piutang di atas

### Form Tambah / Edit Pelanggan

```
Nama Pelanggan *
[___________________________]

Diskon LM (bertingkat)
[20%] [20%] [10%] [+ Tambah Langkah]

Diskon BR (bertingkat)
[15%] [10%] [+ Tambah Langkah]

Batas Bonus (Rp) *
[10.000.000]

[Simpan]  [Batal]
```

### Ketentuan

| Kode | Ketentuan |
|---|---|
| AC-2.1 | Nama wajib diisi. Tidak bisa simpan jika kosong |
| AC-2.2 | Semua field bisa diedit kapan saja |
| AC-2.3 | Hapus = soft-delete. Pelanggan hilang dari pilihan baru, riwayat bon tetap ada |
| AC-2.4 | Diskon LM dan BR terpisah sepenuhnya |
| AC-2.5 | Diskon bertingkat adalah array terurut. Urutan menentukan hasil |
| AC-2.6 | Tiap langkah diskon bisa ditambah, diubah, dihapus secara individual |
| AC-2.7 | Nilai diskon harus 0–100. Di luar itu ditolak dengan pesan error |
| AC-2.8 | Batas bonus wajib diisi dalam Rupiah |
| AC-2.9 | **Rumus diskon bertingkat** — lihat §13 |

---

## 8. Fitur: Kelola Produk

### Data yang Disimpan per Produk

```
Produk {
  nama         : string (wajib)
  harga_modal  : number (≥ 0) — tidak pernah tampil ke pelanggan
  harga_jual   : number (≥ 0) — harga sebelum diskon
  tipe         : "LM" | "BR"
  status       : aktif | dihapus (soft-delete)
}
```

### Tampilan Daftar Produk

- List dengan nama, tipe (badge LM/BR), dan harga jual
- Tombol **[+ Tambah Produk]** di atas
- Filter: Semua | LM | BR

### Form Tambah / Edit Produk

```
Nama Produk *
[___________________________]

Jenis Produk *
( ) LM    ( ) BR

Harga Jual (Rp) *
[___________________________]

Harga Modal (Rp) *  ← label: "Harga Beli / Modal (tidak terlihat pelanggan)"
[___________________________]

[Simpan]  [Batal]
```

### Ketentuan

| Kode | Ketentuan |
|---|---|
| AC-3.1 | Bisa tambah, edit, hapus produk |
| AC-3.2 | Tipe hanya LM atau BR (radio button, bukan teks bebas) |
| AC-3.3 | Harga modal dan harga jual ≥ 0, harus angka |
| AC-3.4 | Harga modal **tidak pernah ditampilkan** di bon atau laporan pelanggan |
| AC-3.5 | Hapus = soft-delete. Produk hilang dari pilihan baru, riwayat bon tetap ada |

---

## 9. Fitur: Buat & Kelola Bon

### Data yang Disimpan per Bon

```
Bon {
  tanggal       : date (default: hari ini)
  nomor_bon     : string (unik, wajib)
  pelanggan_id  : ref Pelanggan (wajib)
  items         : array {
                    produk_id, qty, harga_jual, diskon_applied, omzet_line, laba_line
                  }
  ongkir        : number (≥ 0, default: 0)
  deskripsi     : string (opsional)
  is_bonus      : boolean (default: false)
  status        : "Piutang" | "Lunas"
  tanggal_lunas : date | null
}
```

### Tampilan Form Buat Bon Baru

```
╔══════════════════════════════════╗
║        BUAT BON BARU             ║
╠══════════════════════════════════╣
║ Tanggal *         [📅 07/06/2025]║
║ Nomor Bon *       [______________]║
║ Pelanggan *       [Pilih ▼      ]║
╠══════════════════════════════════╣
║ DAFTAR PRODUK                    ║
║ ┌────────────────────────────┐   ║
║ │ [Pilih Produk ▼]  Qty:[__] │   ║
║ │ Jenis: LM  Harga: Rp 57.600│   ║
║ │ Omzet: Rp 57.600           │   ║
║ └────────────────────────────┘   ║
║ [+ Tambah Produk Lagi]           ║
╠══════════════════════════════════╣
║ Ongkir (Rp)       [0           ] ║
║ Keterangan        [____________] ║
╠══════════════════════════════════╣
║ RINGKASAN                        ║
║ Total Omzet:      Rp 57.600      ║
║ Ongkir:           Rp 0           ║
║ TOTAL TAGIHAN:    Rp 57.600      ║
╠══════════════════════════════════╣
║      [Simpan Bon]                ║
╚══════════════════════════════════╝
```

### Perilaku Form

- Saat pelanggan dipilih, diskon pelanggan langsung dimuat di background
- Saat produk dipilih, langsung tampil: jenis (LM/BR), harga setelah diskon, dan omzet
- Qty default 1, bisa diubah
- Harga di setiap baris **tidak bisa diedit manual** — dihitung otomatis
- Ringkasan di bawah **update real-time** saat produk atau qty diubah

### Tampilan Daftar Bon

- Urutan: terbaru di atas
- Setiap baris: nomor bon, nama pelanggan, tanggal, total tagihan, badge status (Piutang merah / Lunas hijau)
- Filter: Semua | Piutang | Lunas | Bonus
- Search: cari nomor bon atau nama pelanggan

### Ketentuan

| Kode | Ketentuan |
|---|---|
| AC-4.1 | Tanggal default hari ini, bisa diubah |
| AC-4.2 | Nomor bon wajib unik. Jika duplikat: `"Nomor bon sudah dipakai, coba nomor lain"` |
| AC-4.3 | Pelanggan dipilih dari dropdown daftar (tidak bisa ketik bebas) |
| AC-4.4 | Produk dipilih dari dropdown katalog (tidak bisa ketik bebas) |
| AC-4.5 | Satu bon bisa berisi banyak produk. Qty minimal 1 |
| AC-4.6 | Setiap baris produk tampil: tipe (LM/BR) dan harga setelah diskon pelanggan |
| AC-4.7 | Diskon **tidak diketik manual** — otomatis dari data pelanggan |
| AC-4.8 | Ongkir ≥ 0, satu nilai per bon (bukan per produk) |
| AC-4.9 | Status default: Piutang |
| AC-4.10 | Bisa lihat detail, edit, dan hapus bon. Edit menghitung ulang semua angka |
| AC-4.11 | Bon menampilkan: omzet per baris, total omzet, ongkir, total tagihan |

---

## 10. Fitur: Sistem Bonus

### Cara Kerja Singkat

1. Setiap pelanggan punya **batas bonus** (misal Rp 10jt)
2. Sistem akumulasi omzet **Lunas** per pelanggan secara otomatis
3. Ketika akumulasi ≥ batas bonus → muncul notifikasi bonus
4. Pengguna membuat **Bon Bonus** untuk memberikan produk gratis
5. Produk bonus tidak menambah omzet dan tidak memotong laba

### Tampilan Notifikasi Bonus

```
┌─────────────────────────────────────┐
│ 🎁  BONUS TERSEDIA                  │
│                                      │
│  Pelanggan: Bu Ani                  │
│  Bonus tersedia: 2 bonus            │
│  (Akumulasi Rp 25jt ÷ Rp 10jt = 2) │
│                                      │
│  [Buat Bon Bonus]  [Nanti]          │
└─────────────────────────────────────┘
```

### Form Bon Bonus

- Sama seperti form bon biasa, tapi ada toggle **"Bon Bonus: ON"** yang terlihat jelas (kuning)
- Saat toggle ON: label berubah jadi "BON BONUS — Produk Gratis"
- Total tagihan otomatis Rp 0 untuk semua item di bon bonus
- Ongkir tetap bisa diisi jika ada biaya kirim

### Ketentuan

| Kode | Ketentuan |
|---|---|
| AC-5.1 | Setiap pelanggan punya batas bonus dalam Rupiah (diatur di data pelanggan) |
| AC-5.2 | Sistem hitung akumulasi omzet Lunas per pelanggan secara real-time |
| AC-5.3 | Bonus tersedia = `floor(akumulasi / batas) - bonus sudah diberikan` |
| AC-5.4 | Jika ada bonus menunggu → tampil notifikasi/badge di kartu pelanggan dan di beranda |
| AC-5.5 | Bonus dicatat lewat bon dengan `is_bonus = true`. Bisa masukkan lebih dari 1 bonus |
| AC-5.6 | Setiap bonus yang diberikan memotong 1x batas dari akumulasi. Sisa carry-over |
| AC-5.7 | Item di bon bonus: omzet = 0, laba = 0 (gratis) |
| AC-5.8 | Bon bonus tampil dengan label/badge **BONUS** yang berbeda dari bon biasa |

---

## 11. Fitur: Detail Pelanggan & Pelunasan

### Tampilan Halaman Detail Pelanggan

```
╔══════════════════════════════════════╗
║  ← Kembali                           ║
║  Bu Ani                              ║
║  Batas Bonus: Rp 10jt                ║
╠══════════════════════════════════════╣
║  [Juni 2025 ▼]  [Tandai Bulan Lunas] ║ ← tombol merah/oranye
╠══════════════════════════════════════╣
║  RINGKASAN BULAN INI                 ║
║  Piutang:        Rp 15.000.000  🔴   ║
║  Sudah Bayar:    Rp 30.000.000  🟢   ║
║  Omzet LM:       Rp 20.000.000       ║
║  Omzet BR:       Rp 10.000.000       ║
║  Total Omzet:    Rp 30.000.000       ║
║  Total Laba HL:  Rp  6.000.000       ║
╠══════════════════════════════════════╣
║  DAFTAR BON                [📥 PDF]  ║
║  ┌──────────────────────────────┐    ║
║  │ 01/06 | BON-001 | Rp 5jt 🔴│    ║  ← klik untuk detail
║  │ 05/06 | BON-002 | Rp 8jt 🟢│    ║
║  │ 10/06 | BON-003 | Rp 7jt 🔴│    ║
║  └──────────────────────────────┘    ║
╚══════════════════════════════════════╝
```

### Alur Pelunasan Satu Bon

```
Klik bon → [Lunas] →

┌────────────────────────────────┐
│  Tandai Bon BON-001 sebagai    │
│  LUNAS?                        │
│                                │
│  Tanggal Pelunasan:            │
│  [📅 07/06/2025              ] │
│                                │
│  [✅ Ya, Sudah Lunas]          │
│  [❌ Batal]                    │
└────────────────────────────────┘
```

### Alur Pelunasan Satu Bulan

```
[Tandai Bulan Lunas] →

┌────────────────────────────────┐
│  Tandai SEMUA bon Juni 2025    │
│  untuk Bu Ani sebagai LUNAS?   │
│                                │
│  Total: 2 bon, Rp 12.000.000   │
│                                │
│  Tanggal Pelunasan:            │
│  [📅 07/06/2025              ] │
│                                │
│  [✅ Ya, Lunaskan Semua]       │
│  [❌ Batal]                    │
└────────────────────────────────┘
```

### Ketentuan

| Kode | Ketentuan |
|---|---|
| AC-6.1 | Bon dikelompokkan per bulan. Ada dropdown pilih bulan/tahun |
| AC-6.2 | Ringkasan bulan: piutang, sudah bayar, omzet (LM & BR), laba |
| AC-6.3 | Omzet ditampilkan kolom LM, kolom BR, dan total |
| AC-6.4 | Ada tombol unduh PDF untuk daftar bon & piutang |
| AC-6.5 | Pelunasan sebulan: modal konfirmasi dengan tanggal pelunasan, semua bon di bulan itu jadi Lunas |
| AC-6.6 | Pelunasan satu bon: modal konfirmasi dengan tanggal pelunasan |
| AC-6.7 | Setelah lunas: total piutang turun, total bayar naik, omzet & laba diakui, akumulasi bonus naik — semua real-time |
| AC-6.8 | Bon Lunas tidak bisa dilunasi lagi. Tampil dengan background hijau muda atau ikon centang |
| AC-6.9 | Klik bon → halaman detail dengan: produk, qty, harga, ongkir, omzet, status, tanggal lunas |

---

## 12. Fitur: Laporan

### Jenis Laporan

| Jenis | Isi |
|---|---|
| Per Pelanggan | Semua transaksi satu pelanggan, bisa filter bulan/tahun |
| Per Jenis Produk | Omzet & laba LM vs BR, bisa filter bulan/tahun |
| Keseluruhan | Semua pelanggan digabung, bisa filter bulan/tahun |

### Konten Laporan (Minimal)

```
Periode: Juni 2025

Total Omzet (Lunas):      Rp 80.000.000
  - LM:                   Rp 50.000.000
  - BR:                   Rp 30.000.000

Total Laba HL:            Rp 16.000.000

Total Piutang:            Rp 25.000.000
Total Sudah Dibayar:      Rp 80.000.000

[Catatan Bonus]
  2 bon bonus diberikan (tidak termasuk omzet di atas)
```

### Ketentuan

| Kode | Ketentuan |
|---|---|
| AC-7.1 | Laporan per pelanggan tersedia |
| AC-7.2 | Laporan per jenis produk (LM/BR) tersedia |
| AC-7.3 | Laporan keseluruhan tersedia |
| AC-7.4 | Semua laporan bisa filter per bulan dan per tahun |
| AC-7.5 | Konten minimal: omzet lunas, laba, piutang, sudah bayar — dipisah LM/BR |
| AC-7.6 | Laporan keseluruhan tampilkan total laba HL semua pelanggan |
| AC-7.7 | Bon bonus **tidak masuk** omzet/laba. Ditampilkan terpisah sebagai log bonus |
| AC-7.8 | Semua laporan bisa diunduh sebagai PDF |

---

## 13. Rumus Perhitungan (Sumber Kebenaran Tunggal)

> **Penting untuk Developer:** Semua kalkulasi harus mengacu ke sini. Tidak ada rumus lain.

### 13.1 Diskon Bertingkat

```
Harga Akhir = Harga Jual × (1 - d1/100) × (1 - d2/100) × ... × (1 - dn/100)
```

**Contoh:**
```
Harga Jual = Rp 100.000
Diskon LM  = [20%, 20%, 10%]

Langkah 1: 100.000 × (1 - 0,20) = 100.000 × 0,80 = 80.000
Langkah 2:  80.000 × (1 - 0,20) =  80.000 × 0,80 = 64.000
Langkah 3:  64.000 × (1 - 0,10) =  64.000 × 0,90 = 57.600

Harga akhir = Rp 57.600
⚠️ BUKAN Rp 50.000 (20+20+10 = 50% — ini SALAH)
```

### 13.2 Tabel Rumus Lengkap

| Yang Dihitung | Rumus |
|---|---|
| Harga per unit (setelah diskon) | `Harga Jual × ∏(1 - dᵢ/100)` untuk setiap langkah diskon |
| Omzet per baris | `Harga per unit × qty` |
| Total omzet bon | `Σ omzet per baris` (ongkir **tidak** termasuk) |
| Total tagihan pelanggan | `Total omzet + ongkir` |
| Laba per baris | `(Harga per unit - harga modal) × qty` |
| Total laba bon | `Σ laba per baris` (ongkir tidak mempengaruhi laba) |
| Omzet diakui (laporan) | `Σ total omzet bon` yang statusnya `Lunas` |
| Laba diakui (laporan) | `Σ total laba bon` yang statusnya `Lunas` |
| Total sudah dibayar | `Σ (total omzet + ongkir)` dari bon `Lunas` |
| Total piutang | `Σ (total omzet + ongkir)` dari bon `Piutang` |
| Akumulasi bonus pelanggan | `Σ total omzet` dari bon `Lunas` milik pelanggan (bon bonus dikecualikan) |
| Bonus tersedia | `floor(akumulasi / batas_bonus) - jumlah_bonus_sudah_diberikan` |
| Item di bon bonus | omzet = 0, laba = 0 (gratis sepenuhnya) |

---

## 14. Keputusan Desain yang Sudah Final

> Semua keputusan di bawah sudah dikonfirmasi. Tidak perlu didiskusikan lagi.

| # | Topik | Keputusan |
|---|---|---|
| D1 | Ongkir & Laba | Ongkir diteruskan ke pelanggan, tidak menambah laba HL |
| D2 | Tagihan vs Omzet | Tagihan = omzet + ongkir. Omzet sendiri tidak termasuk ongkir |
| D3 | Dasar Pengakuan | **Cash basis** — hanya bon `Lunas` yang dihitung sebagai omzet, laba, dan akumulasi bonus |
| D4 | Mekanisme Bonus | Bonus bisa ditumpuk. Bisa berikan beberapa bonus dalam satu bon |
| D5 | Biaya Bonus | Harga modal produk bonus diabaikan — tidak mengurangi laba HL |
| D6 | Hapus Data | Semua penghapusan = **soft-delete**. Data lama tetap ada untuk riwayat |
| D7 | Nomor Bon | Harus unik. Sistem menolak nomor bon yang sudah digunakan |
| D8 | Format Ekspor | Laporan diunduh sebagai **PDF** |
| D9 | Mata Uang & Pajak | IDR (Rupiah) saja. Tidak ada PPN atau pajak apapun |

---

## 15. Contoh Skenario Nyata

### Skenario A: Buat Bon Biasa

```
Pelanggan : Bu Siti
Diskon LM  : [20%, 20%, 10%]
Diskon BR  : [15%]

Produk yang dibeli:
  1. Produk X (LM), Harga Jual Rp 100.000, Qty 3
     → Harga per unit = 100.000 × 0,8 × 0,8 × 0,9 = Rp 57.600
     → Omzet baris   = 57.600 × 3 = Rp 172.800
     → Laba baris    = (57.600 - 40.000) × 3 = Rp 52.800

  2. Produk Y (BR), Harga Jual Rp 50.000, Qty 2
     → Harga per unit = 50.000 × 0,85 = Rp 42.500
     → Omzet baris   = 42.500 × 2 = Rp 85.000
     → Laba baris    = (42.500 - 35.000) × 2 = Rp 15.000

Ongkir: Rp 20.000

RINGKASAN BON:
  Total Omzet  = 172.800 + 85.000          = Rp 257.800
  Total Laba   = 52.800 + 15.000            = Rp 67.800
  Total Tagihan = 257.800 + 20.000          = Rp 277.800
```

### Skenario B: Hitung Bonus

```
Pelanggan  : Pak Budi
Batas Bonus: Rp 10.000.000
Akumulasi Lunas: Rp 25.000.000
Bonus Sudah Diberikan: 0

Bonus Tersedia = floor(25.000.000 / 10.000.000) - 0 = 2 bonus

Saat 2 bonus diberikan sekaligus:
  Akumulasi terpakai = 2 × Rp 10.000.000 = Rp 20.000.000
  Sisa carry-over   = Rp 25.000.000 - Rp 20.000.000 = Rp 5.000.000
  Produk bonus      = gratis (omzet 0, laba 0)
```

---

## 16. Checklist Developer

Gunakan checklist ini sebelum menganggap fitur selesai:

### UI / UX
- [ ] Semua teks minimal 16px
- [ ] Tombol utama minimal 52px tinggi
- [ ] Setiap halaman punya judul besar di atas
- [ ] Ada tombol Kembali di setiap halaman
- [ ] Status Piutang = merah, Lunas = hijau, Bonus = kuning — konsisten
- [ ] Tidak ada aksi penting yang tersembunyi
- [ ] Konfirmasi tampil sebelum hapus & sebelum pelunasan massal
- [ ] Pesan error pakai bahasa Indonesia sehari-hari
- [ ] Toast/snackbar sukses setelah simpan, lunas, atau hapus

### Logika Bisnis
- [ ] Diskon dihitung bertingkat (bukan dijumlah)
- [ ] Omzet dan laba hanya diakui dari bon `Lunas`
- [ ] Ongkir tidak masuk laba, hanya masuk tagihan
- [ ] Bon bonus: omzet = 0, laba = 0
- [ ] Nomor bon unik — duplicate ditolak
- [ ] Hapus = soft-delete, riwayat tetap ada
- [ ] Akumulasi bonus naik saat bon dilunasi
- [ ] Notifikasi bonus muncul jika `floor(akumulasi/batas) - granted > 0`

### Data
- [ ] Semua angka disimpan dalam satuan Rupiah penuh (bukan ribuan)
- [ ] Tanggal disimpan dalam format standar (ISO 8601: `YYYY-MM-DD`)
- [ ] Tidak ada kalkulasi yang dibuat ulang berbeda di tempat berbeda
- [ ] PDF bisa diunduh untuk laporan dan daftar piutang

Pengguna buka web di HP Chrome
→ Muncul notif "Tambahkan ke layar utama"
→ Klik install
→ Selesai — ikon aplikasi muncul di homescreen HP
→ Saat dibuka, tidak ada bar browser, full screen
→ Rasanya persis seperti aplikasi biasa
