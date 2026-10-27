# 👛 DompetKu - Aplikasi Manajemen Keuangan Pribadi (PWA 100% Offline-First)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-success.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![No Tracking](https://img.shields.io/badge/Privacy-Zero%20Tracking-blue.svg)](PRIVACY.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)

**DompetKu** adalah Progressive Web App (PWA) manajemen keuangan pribadi offline-first yang gratis, bebas iklan, tanpa registrasi akun, tanpa pelacak, dan 100% data tersimpan di perangkat lokal pengguna menggunakan **IndexedDB**. 

---

## 🌟 Prinsip Utama (Non-Negotiable)

1. **Gratis & Open Source:** Dilisensikan di bawah lisensi MIT tanpa batasan.
2. **100% Offline-First:** Setelah dibuka pertama kali, seluruh fitur (catat transaksi, transfer dompet, grafik analitik, set budget) berjalan tanpa butuh koneksi internet.
3. **Tanpa Iklan, Tanpa Akun, Tanpa Langganan:** Buka dan langsung gunakan tanpa login atau syarat tersembunyi.
4. **Zero-Tracking (Anti-Pelacak):** Tidak ada Google Analytics, Firebase, Sentry, Mixpanel, CDN eksternal, atau koneksi jaringan ke pihak ketiga mana pun.
5. **Data Lokal di Perangkat:** Seluruh transaksi dan konfigurasi disimpan di IndexedDB browser Anda via Dexie.js. Tidak ada backend server.
6. **Murni Static Site:** Dapat dihosting di GitHub Pages, Netlify, Vercel, atau dibuka langsung dari file lokal.
7. **Semua Dependensi Di-bundle Lokal:** Tidak ada pemanggilan `<script src="https://...">` eksternal.

---

## 🚀 Fitur Utama

### 1. 💵 Catat Pemasukan, Pengeluaran & Transfer
- **Form Cepat & Responsif:** Input nominal dengan format Rupiah otomatis saat mengetik (`1.000.000`).
- **Transfer Antar Dompet:** Pindahkan saldo antar rekening, uang tunai, dan e-wallet secara instan.
- **Kategori Fleksibel:** Kategori default lengkap (Gaji, Makan, Transport, Belanja, Tagihan, Hiburan, Kesehatan, dll) serta kemampuan menambah/mengubah/menghapus kategori kustom dengan ikon dan palet warna bebas.
- **Floating Action Button (FAB):** Tombol tambah mengambang di pojok bawah untuk memudahkan akses jari satu tangan di HP.

### 2. 🎯 Anggaran & Metode 50/30/20
- **Formula 50/30/20 Cerdas:**
  - 🛒 **50% Kebutuhan Pokok (Needs):** Pangan, tempat tinggal, transportasi, tagihan/utilitas, kesehatan, pendidikan.
  - 🎉 **30% Keinginan (Wants):** Hiburan, hobi, belanja gaya hidup, kafe, rekreasi.
  - 💎 **20% Tabungan & Investasi (Savings):** Dana darurat, celengan impian, instrumen investasi.
- **Kalkulator & Generator Otomatis:** Masukkan nominal pendapatan bulanan Anda (atau gunakan pemasukan riil), dan sistem akan langsung menghitung alokasi serta menyediakan opsi **"Terapkan Template 50/30/20"** ke semua kategori pengeluaran hanya dengan 1 klik.
- **Visualisasi Real-Time:** Stacked bar pembagian arus kas, insight evaluasi kesehatan finansial bulanan, dan pelacakan sisa batas aman per pilar.
- **Batas Kategori Individual:**
  - Atur batas pengeluaran bulanan per kategori dengan penanda kelompok 50/30/20.
  - Progress bar dinamis yang berubah warna secara intuitif:
    - 🟢 **Hijau:** Pemakaian aman (< 80%).
    - 🟡 **Kuning:** Peringatan mendekati batas (80% - 99%).
    - 🔴 **Merah:** Peringatan visual darurat saat mencapai atau melebihi 100%.
  - Tampilan sisa anggaran dan **estimasi pengeluaran harian yang aman** (`sisa budget / sisa hari dalam bulan`).
  - Anggaran berulang secara otomatis setiap awal bulan.

### 3. 🐷 Target Tabungan & Celengan (Savings Goals)
- **Rencanakan Impian Finansial:** Buat target tabungan untuk berbagai tujuan (Dana Darurat, Liburan, Beli Gadget, Rumah, dll).
- **Kustomisasi Lengkap:** Tentukan target nominal, tanggal target (deadline), ikon, warna pembeda, dan hubungkan dengan dompet penyimpanan.
- **Setor & Tarik Cepat:** Tambah atau tarik saldo celengan kapan saja dengan opsi pencatatan otomatis ke transaksi dompet terkait agar saldo selalu sinkron.
- **Rekomendasi Nabung Bulanan:** Perhitungan otomatis nominal tabungan per bulan yang harus disisihkan untuk mencapai target tepat waktu.
- **Indikator Progres Interaktif:** Tampilan persentase terkumpul, sisa hari, dan kartu ucapan selamat saat target berhasil dicapai (100%+).

### 4. 📊 Grafik & Statistik Analitik
- **Donut Chart:** Proporsi pengeluaran per kategori beserta persentasenya.
- **Bar Chart:** Komparasi pemasukan vs pengeluaran per bulan.
- **Line Chart:** Tren pergerakan arus kas bersih (surplus/defisit).
- **Filter Periode Lengkap:** Minggu ini, Bulan ini, 3 Bulan, Tahun ini, atau Rentang Tanggal Kustom.
- **Kartu Ringkasan Finansial:** Total pemasukan, total pengeluaran, selisih bersih, rata-rata belanja harian, dan kategori terboros.

### 4. 💾 Backup & Restore (Cadangan Data)
- **Ekspor JSON Lokal:** Unduh seluruh database ke file JSON di komputer atau ponsel Anda.
- **Opsi Enkripsi Password (AES-GCM):** Lindungi file backup dengan password menggunakan algoritma standar industri Web Crypto API.
- **Impor & Pemulihan Fleksibel:** Deteksi otomatis file terenkripsi, validasi skema data, dan pilihan untuk **"Timpa Seluruh Data"** atau **"Gabungkan Data"**.
- **Ekspor CSV untuk Excel:** Unduh riwayat transaksi ke format CSV dengan UTF-8 BOM agar rapi saat dibuka di Microsoft Excel.
- **Pengingat Backup Berkala:** Notifikasi dalam aplikasi jika sudah lebih dari 7 hari atau lebih dari 10 transaksi belum di-backup.

### 5. 🔐 Kunci PIN & Biometrik (WebAuthn)
- **Kunci PIN 4-6 Digit:** Di-hash dengan PBKDF2 (100.000 iterasi) + random salt unik. Tidak pernah disimpan dalam bentuk plaintext.
- **Biometrik WebAuthn:** Buka aplikasi dengan Sidik Jari (Touch ID / Fingerprint), Face ID, atau Windows Hello jika perangkat mendukung.
- **Auto-Lock:** Otomatis terkunci saat aplikasi ditutup, diminimalkan, atau setelah durasi idle tertentu (dapat diatur: segera, 1m, 5m, 15m).
- **Rate Limiting:** Proteksi brute-force dengan penundaan 30 detik setelah 5 kali percobaan PIN salah.
- **Peringatan Transparan:** Jika PIN lupa, data hanya dapat dipulihkan lewat file backup lokal Anda.

### 6. 🗂️ Multi Dompet (Wallets)
- Buat banyak dompet: Uang Tunai, Rekening Bank, E-Wallet, Investasi, dll.
- Kustomisasi nama, ikon, warna, dan saldo awal.
- Ringkasan total saldo gabungan dan rincian saldo per dompet.
- **Fitur Arsip Dompet:** Dompet yang memiliki transaksi tidak dapat dihapus permanen agar pembukuan tidak rusak, melainkan dapat diarsipkan dengan aman.

### 7. 📜 Riwayat Transaksi Lengkap
- Dikelompokkan rapi per tanggal (*Hari Ini*, *Kemarin*, *Tanggal Spesifik*).
- Pencarian teks cepat berdasarkan catatan.
- Filter multi-dimensi (tipe, dompet, kategori, periode tanggal, nominal min/max).
- Pengurutan (terbaru, terlama, nominal tertinggi, nominal terendah).
- Sistem paginasi chunk berkinerja tinggi yang tetap responsif pada puluhan ribu data.

### 8. 🌓 Mode Tema Terang & Gelap
- Pilihan: Terang (Light), Gelap (Dark), atau Ikuti Sistem (System).
- Kontras warna dirancang memenuhi standar aksesibilitas WCAG AA.
- Mendukung preferensi pengurangan animasi (`prefers-reduced-motion`).

### 9. 📱 Progressive Web App (PWA)
- Manifest lengkap dengan ikon adaptif 192px dan 512px.
- Service Worker dengan strategi caching *Cache-First* untuk seluruh aset.
- Dapat diinstal langsung ke Home Screen HP (Android/iOS) dan Desktop (Windows/macOS/Linux).
- Permintaan izin penyimpanan permanen (`navigator.storage.persist()`) agar browser tidak membersihkan IndexedDB saat memori perangkat menipis.

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | UI deklaratif, cepat, dan type-safe |
| **Build Tool** | Vite 8 | Waktu build super cepat & bundle optimal |
| **CSS Styling** | Tailwind CSS v4 | Desain modern, responsif, dan ringan |
| **Database Lokal** | Dexie.js (`dexie-react-hooks`) | Abstraksi IndexedDB reaktif & aman |
| **Visualisasi Data** | Chart.js (`react-chartjs-2`) | Grafik donut, bar, dan line lokal |
| **PWA & Offline Cache**| `vite-plugin-pwa` + Workbox | Service Worker generateSW precaching |
| **Kriptografi & Hash** | Web Crypto API asli browser | PBKDF2 (SHA-256) & AES-GCM 256-bit |
| **Biometrik** | WebAuthn API asli browser | Autentikasi sidik jari / Face ID perangkat |
| **Ikonografi** | Lucide React | Ikon SVG lokal tanpa CDN eksternal |

---

## 📂 Struktur Proyek

```
DompetKu/
├── public/
│   ├── favicon.svg                # Ikon favicon SVG
│   ├── apple-touch-icon.png       # Ikon Apple Touch (180x180)
│   ├── pwa-192x192.png            # Ikon PWA standar (192x192)
│   └── pwa-512x512.png            # Ikon PWA high-res (512x512)
├── scripts/
│   └── generate-icons.js          # Generator ikon PNG & SVG mandiri
├── src/
│   ├── components/
│   │   ├── analytics/             # Chart & KPI components
│   │   │   ├── AnalyticsSummaryCards.tsx
│   │   │   ├── CategoryExpensePie.tsx
│   │   │   ├── IncomeExpenseBar.tsx
│   │   │   ├── TrendLineChart.tsx
│   │   │   └── chartConfig.ts
│   │   ├── budget/                # Budget components
│   │   │   ├── BudgetCard.tsx
│   │   │   └── BudgetFormModal.tsx
│   │   ├── common/                # UI components dasar
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── IconRenderer.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/                # Navigasi & Shell
│   │   │   ├── BottomNav.tsx
│   │   │   ├── DesktopSidebar.tsx
│   │   │   ├── FloatingActionButton.tsx
│   │   │   └── Header.tsx
│   │   ├── onboarding/            # First-run experience
│   │   │   └── OnboardingWizard.tsx
│   │   ├── security/              # Layar Kunci & PIN
│   │   │   ├── PinLockScreen.tsx
│   │   │   └── PinSetupModal.tsx
│   │   ├── transaction/           # Transaksi & Kategori
│   │   │   ├── CategoryFormModal.tsx
│   │   │   ├── TransactionFormModal.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   └── TransactionList.tsx
│   │   └── wallet/                # Dompet
│   │       ├── WalletCard.tsx
│   │       └── WalletFormModal.tsx
│   ├── db/
│   │   ├── database.ts            # Definisi Dexie database class
│   │   ├── defaultData.ts         # Data awal kategori & dompet
│   │   └── services.ts            # Service layer seluruh operasi DB
│   ├── hooks/
│   │   ├── useAuthLock.ts         # Hook status kunci PIN
│   │   ├── useDebounce.ts         # Hook debounce pencarian
│   │   └── useTheme.ts            # Hook tema terang/gelap
│   ├── i18n/
│   │   ├── id.ts                  # Kamus Bahasa Indonesia
│   │   └── index.ts               # Loader lokalisasi i18n
│   ├── pages/
│   │   ├── AnalyticsPage.tsx      # Halaman Statistik
│   │   ├── BudgetsPage.tsx        # Halaman Anggaran
│   │   ├── HomePage.tsx           # Halaman Beranda
│   │   ├── SettingsPage.tsx       # Halaman Pengaturan & Privasi
│   │   ├── TransactionsPage.tsx   # Halaman Riwayat Transaksi
│   │   └── WalletsPage.tsx        # Halaman Kelola Dompet
│   ├── security/
│   │   ├── crypto.ts              # Web Crypto API PBKDF2 & AES-GCM
│   │   ├── lockManager.ts         # Idle timer & auto-lock logic
│   │   └── webauthn.ts            # WebAuthn biometrik
│   ├── types/
│   │   └── index.ts               # Interface TypeScript
│   ├── utils/
│   │   ├── currency.ts            # Format & parsing Rupiah
│   │   ├── date.ts                # Format tanggal Indonesia
│   │   ├── exportImport.ts        # Backup JSON & CSV Excel
│   │   ├── pwa.ts                 # Persistent storage helper
│   │   └── sanitize.ts            # Sanitasi input
│   ├── App.tsx                    # Shell aplikasi utama
│   ├── index.css                  # CSS dasar Tailwind & tema
│   └── main.tsx                   # Entrypoint React
├── index.html                     # HTML utama dengan CSP ketat
├── package.json                   # Dependensi & script proyek
├── tsconfig.json                  # Konfigurasi TypeScript
├── vite.config.ts                 # Konfigurasi Vite & PWA Service Worker
├── LICENSE                        # Lisensi MIT
├── CONTRIBUTING.md                # Panduan kontribusi
├── TESTING.md                     # Daftar uji manual offline
└── README.md                      # Dokumentasi ini
```

---

## 🗄️ Skema Database (IndexedDB: `DompetKuDB`)

Database dibangun menggunakan IndexedDB melalui Dexie.js dengan tabel-tabel berikut:

### 1. `wallets`
| Kolom | Tipe | Indeks | Keterangan |
|---|---|---|---|
| `id` | `string` | Primary Key | ID unik dompet (`wlt_...`) |
| `name` | `string` | Indexed | Nama dompet (misal: "BCA Tabungan", "Uang Tunai") |
| `type` | `string` | Indexed | Jenis: `'cash'`, `'bank'`, `'ewallet'`, `'investment'`, `'other'` |
| `icon` | `string` | - | Nama ikon Lucide (misal: `'Landmark'`) |
| `color` | `string` | - | Kode warna Hex (misal: `'#10b981'`) |
| `initialBalance` | `number` | - | Saldo awal dompet saat dibuat |
| `isArchived` | `boolean` | Indexed | Status pengarsipan (`true` / `false`) |
| `createdAt` | `string` | Indexed | Timestamp ISO pembuatan |
| `updatedAt` | `string` | - | Timestamp ISO pembaruan |

### 2. `categories`
| Kolom | Tipe | Indeks | Keterangan |
|---|---|---|---|
| `id` | `string` | Primary Key | ID unik kategori (`cat_...`) |
| `name` | `string` | Indexed | Nama kategori (misal: "Makan & Minum", "Gaji Pokok") |
| `type` | `string` | Indexed | Tipe: `'income'` atau `'expense'` |
| `icon` | `string` | - | Nama ikon Lucide |
| `color` | `string` | - | Kode warna Hex |
| `isDefault` | `boolean` | Indexed | Penanda apakah kategori bawaan sistem |
| `createdAt` | `string` | Indexed | Timestamp ISO pembuatan |

### 3. `transactions`
| Kolom | Tipe | Indeks | Keterangan |
|---|---|---|---|
| `id` | `string` | Primary Key | ID unik transaksi (`tx_...`) |
| `amount` | `number` | Indexed | Nominal dalam Rupiah (integer positif) |
| `type` | `string` | Indexed | Tipe: `'income'`, `'expense'`, atau `'transfer'` |
| `categoryId` | `string` | Indexed | Relasi ke `categories.id` atau `'transfer'` |
| `walletId` | `string` | Indexed | Dompet asal / sumber dana |
| `toWalletId` | `string` | Indexed | Dompet tujuan (khusus transaksi transfer) |
| `date` | `string` | Indexed | Tanggal transaksi format `YYYY-MM-DD` |
| `notes` | `string` | - | Catatan / deskripsi tambahan (opsional) |
| `createdAt` | `string` | Indexed | Timestamp ISO pembuatan |
| `updatedAt` | `string` | - | Timestamp ISO perubahan |

### 4. `budgets`
| Kolom | Tipe | Indeks | Keterangan |
|---|---|---|---|
| `id` | `string` | Primary Key | ID unik anggaran (`bgt_...`) |
| `categoryId` | `string` | Indexed | Kategori yang dibatasi anggarannya |
| `monthlyLimit` | `number` | - | Batas nominal per bulan dalam Rupiah |
| `period` | `string` | Indexed | Periode anggaran: `'monthly'` |
| `createdAt` | `string` | Indexed | Timestamp ISO |

### 5. `savings`
| Kolom | Tipe | Indeks | Keterangan |
|---|---|---|---|
| `id` | `string` | Primary Key | ID unik target tabungan (`svg_...`) |
| `name` | `string` | Indexed | Nama target (misal: "Dana Darurat", "Beli Laptop") |
| `targetAmount` | `number` | - | Target nominal yang ingin dicapai |
| `currentAmount` | `number` | - | Saldo yang sudah terkumpul saat ini |
| `targetDate` | `string` | Indexed | Tenggat waktu target format `YYYY-MM-DD` |
| `walletId` | `string` | Indexed | Dompet yang dialokasikan (opsional) |
| `icon` | `string` | - | Nama ikon Lucide |
| `color` | `string` | - | Kode warna Hex |
| `isCompleted` | `boolean` | Indexed | Status apakah target sudah tercapai |
| `createdAt` | `string` | Indexed | Timestamp ISO pembuatan |

### 6. `settings`
| Kolom | Tipe | Indeks | Keterangan |
|---|---|---|---|
| `key` | `string` | Primary Key | Key setting (misal: `'app_settings'`) |
| `value` | `any` | - | Objek konfigurasi: tema, hash PIN PBKDF2, salt, biometrik, auto-lock |

---

## 💻 Cara Install & Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
- npm / yarn / pnpm.

### Langkah-langkah:
1. **Clone repositori:**
   ```bash
   git clone https://github.com/username/dompetku.git
   cd dompetku
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka peramban Anda di `http://localhost:5173`.

---

## 📦 Cara Build untuk Produksi

Untuk menghasilkan bundle statis siap hosting:
```bash
npm run build
```
Hasil build akan tersimpan di folder `dist/` yang berisi file HTML, JS, CSS, manifest, dan Service Worker yang siap di-deploy ke server mana pun.

Untuk menguji hasil build secara lokal:
```bash
npm run preview
```

---

## 🌐 Cara Deploy ke GitHub Pages / Netlify / Vercel

Karena **DompetKu** adalah murni static web application (tanpa server backend), Anda dapat meng-host aplikasi ini secara gratis:

### 1. Deploy ke GitHub Pages
1. Pastikan `base` di `vite.config.ts` sesuai dengan nama repo Anda (atau biarkan `./` untuk path relatif).
2. Install package gh-pages:
   ```bash
   npm install -D gh-pages
   ```
3. Tambahkan script pada `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
4. Jalankan:
   ```bash
   npm run deploy
   ```

### 2. Deploy ke Netlify
1. Tarik repositori Anda di [Netlify](https://netlify.com).
2. Atur:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Klik **Deploy**.

---

## 🔄 Panduan Backup & Restore Data

### Cara Membuat Cadangan (Backup)
1. Buka tab **Pengaturan** di aplikasi.
2. Pada bagian **Cadangan & Pemulihan**, klik tombol **Download Backup JSON**.
3. (Opsional) Centang opsi *"Enkripsi Backup dengan Password"* dan masukkan password jika ingin melindungi file cadangan Anda dari akses orang lain.
4. Klik **Download File Sekarang**. File JSON akan otomatis diunduh ke perangkat Anda.

### Cara Memulihkan Cadangan (Restore)
1. Buka tab **Pengaturan** > klik **Pulihkan dari JSON**.
2. Pilih file backup `.json` (atau `.enc.json`) dari perangkat Anda.
3. Jika file terenkripsi, masukkan password yang Anda tentukan saat ekspor.
4. Pilih metode pemulihan:
   - **Gabungkan Data:** Menambahkan transaksi dari backup tanpa menghapus data yang ada.
   - **Timpa Seluruh Data:** Mengganti seluruh database dengan data dari file backup.
5. Konfirmasi pemulihan.

---

## 🧪 Uji Fungsionalitas Offline

Untuk panduan pengujian offline terperinci langkah demi langkah (termasuk mode pesawat, audit nol request eksternal, instalasi PWA, dan brute force cooldown), silakan buka dokumen [TESTING.md](TESTING.md).

---

## 🤝 Kontribusi

Kontribusi dari komunitas sangat disambut! Silakan baca panduan lengkap di [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 👨‍💻 Pengembang (Author)

Aplikasi **DompetKu** dirancang dan dibuat oleh **Farel Rizky P**.
- **GitHub Repository:** [https://github.com/RELL3827/Dompetku-Manajement-money](https://github.com/RELL3827/Dompetku-Manajement-money)
- **Komitmen Privasi:** 100% Offline-First, Bebas Iklan, Tanpa Pelacak, Tanpa Database Server, Lisensi Bebas & Terbuka (MIT).

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE) - bebas digunakan untuk keperluan pribadi maupun komersial.
