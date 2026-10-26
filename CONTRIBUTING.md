# Panduan Berkontribusi pada DompetKu

Terima kasih telah tertarik untuk berkontribusi pada **DompetKu**! Proyek ini bersifat gratis, bebas, dan open-source dengan lisensi MIT.

---

## Prinsip Inti yang Wajib Dipertahankan

Setiap kontribusi atau Pull Request (PR) **wajib mematuhi prinsip inti** berikut tanpa kompromi:
1. **100% Offline-First:** Seluruh fitur harus berfungsi tanpa koneksi internet.
2. **Zero-Tracking & Zero-Telemetry:** Dilarang menambahkan Google Analytics, Sentry, Firebase, Mixpanel, iklan, atau pustaka pelacak apa pun.
3. **No External CDNs / Fonts:** Semua script, stylesheet, ikon, dan aset wajib di-bundle secara lokal saat proses build.
4. **Tanpa Backend & Akun:** Seluruh data harus disimpan secara lokal di perangkat pengguna melalui IndexedDB.
5. **Keamanan Kriptografi Lokal:** Enkripsi PIN dan cadangan data harus memanfaatkan standar Web Crypto API asli browser.

---

## Memulai Pengembangan Lokal

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

4. **Uji proses build dan validasi TypeScript:**
   ```bash
   npm run build
   ```

---

## Alur Pembuatan Pull Request (PR)

1. Buat branch baru dari `main`:
   ```bash
   git checkout -b fitur/nama-fitur-baru
   ```
2. Tulis kode yang rapi, modular, dan gunakan TypeScript dengan pengetikan eksplisit.
3. Pastikan `npm run build` sukses tanpa error tipe atau linting.
4. Buat commit yang deskriptif:
   ```bash
   git commit -m "feat(budget): tambahkan estimasi sisa hari aman"
   ```
5. Buka Pull Request dan jelaskan perubahan yang dibuat.

---

## Pelaporan Bug & Saran Fitur

Jika Anda menemukan kendala teknis atau memiliki ide pengembangan, silakan buka **Issue** di repositori GitHub dengan mencantumkan:
- Versi browser dan sistem operasi (misal: Chrome 130 di Android 14)
- Langkah-langkah untuk mereproduksi masalah
- Perilaku yang diharapkan vs perilaku yang terjadi

Terima kasih telah membantu menjaga kebebasan dan privasi finansial pengguna!
