# Kebijakan Privasi DompetKu (Zero-PII & Privacy-First)

> **Komitmen Utama:** DompetKu adalah aplikasi manajemen keuangan pribadi *100% offline-first*, open-source berlisensi MIT, tanpa iklan, dan tanpa pelacak pihak ketiga. Privasi finansial Anda adalah hak mutlak yang tidak boleh dikompromikan.

---

## 1. Penyimpanan Data Finansial 100% Lokal (IndexedDB)
* Seluruh data transaksi pemasukan, pengeluaran, transfer saldo antar-dompet, target tabungan, pos anggaran, dan catatan pribadi disimpan **murni di penyimpanan lokal browser (IndexedDB)** perangkat Anda.
* **Tidak ada database cloud tersembunyi.** Data tidak pernah keluar dari smartphone, tablet, atau komputer Anda.
* Kunci PIN keamanan di-hash secara lokal menggunakan algoritma standar industri **PBKDF2** (100.000 iterasi) dengan salt unik via Web Crypto API.
* File cadangan (backup) dapat dienkripsi secara mandiri menggunakan standar militer **AES-GCM 256-bit**.

---

## 2. Fitur Statistik Anonim (Opt-In & Default MATI)
Untuk membantu pengembang (Farel Rizky P) mengetahui perkiraan jumlah pengguna dan versi aplikasi yang digunakan, DompetKu menyediakan modul statistik anonim yang **hanya aktif jika diaktifkan secara sadar oleh pengguna (OPT-IN)** di menu **Pengaturan > Privasi**.

### A. Data yang Dikirim (HANYA 4 Parameter):
Jika dan hanya jika Anda mengaktifkan opsi statistik di Pengaturan, aplikasi akan mengirimkan ping HTTP POST maksimal 1 kali sehari dengan format payload JSON persis seperti berikut:

```json
{
  "install_id": "c1f7b165-2428-4e89-a5c9-953b0bc8fa12",
  "app_version": "1.0.0",
  "platform": "android",
  "date": "2026-11-01"
}
```

1. **`install_id`**: String UUID v4 acak yang di-generate murni di perangkat Anda. Kode ini **tidak terkait** dengan nomor HP, nama, email, akun Google/Apple, atau nomor seri hardware (IMEI/MAC address).
2. **`app_version`**: Versi aplikasi (contoh: `1.0.0`) untuk memantau keberhasilan adopsi pembaruan service worker PWA.
3. **`platform`**: Klasifikasi kasar sistem operasi (`android`, `ios`, `desktop`, atau `web`) tanpa menyertakan merk, tipe, atau spesifikasi perangkat.
4. **`date`**: Tanggal kalender dalam format `YYYY-MM-DD` (tanpa jam/menit, tanpa zona waktu presisi, dan tanpa lokasi GPS/negara).

### B. Data yang DILARANG KERAS Dikumpulkan (Strict Zero-Knowledge):
* ❌ **Catatan Keuangan**: Saldo, nominal transaksi, kategori, pos anggaran, dan catatan.
* ❌ **Identitas Pribadi**: Nama, alamat email, nomor telepon, username.
* ❌ **Pelacak Pihak Ketiga**: Tidak menggunakan Google Analytics, Firebase SDK, Sentry, Mixpanel, atau Facebook Pixel.
* ❌ **Alamat IP**: Server backend **DILARANG MENYIMPAN ALAMAT IP**. Konfigurasi logging server secara eksplisit membuang parameter IP dari request log.
* ❌ **Fingerprinting**: Tidak ada pembacaan canvas fingerprint, audio fingerprint, atau font enumeration.

---

## 3. Perlindungan & Kebijakan Retensi di Sisi Server
1. **Server Mandiri (Self-Hosted)**: Backend statistik dikelola secara mandiri menggunakan Node.js (Fastify) dan database lokal SQLite (`better-sqlite3`), tanpa perantara pihak ketiga.
2. **Pembersihan Otomatis (Auto-Retention)**: Server menjalankan tugas otomatis berkala untuk **menghapus instalasi yang tidak aktif selama lebih dari 12 bulan**.
3. **Tanpa Log IP**: Reverse proxy Caddy dan server Fastify dikonfigurasi dengan filter yang membuang header `X-Forwarded-For`, `X-Real-IP`, dan remote IP.

---

## 4. Cara Menonaktifkan & Menghapus Data Statistik Anda
Anda memiliki kendali penuh 100% atas data statistik Anda kapan saja:

1. **Mematikan Pengiriman**:
   * Buka menu **Pengaturan** > bagian **Statistik Pengguna Anonim (Opt-In)**.
   * Matikan tombol switch (toggle).
   * Aplikasi akan langsung berhenti mengirim ping dan menghapus `install_id` dari penyimpanan lokal perangkat Anda.
2. **Menghapus Data dari Server**:
   * Klik tombol **"Hapus Data Statistik Saya dari Server"**.
   * Aplikasi akan mengirim perintah `DELETE /api/install/:id` ke server backend.
   * Baris data statistik Anda di database server akan dihapus secara permanen dan tidak dapat dipulihkan.

---

## 5. Audit & Transparansi Kode (Open Source)
Seluruh kode aplikasi klien (`/src`), server backend (`/server`), dan web admin panel (`/admin`) bersifat open-source di bawah lisensi MIT:
* Anda dapat memeriksa kode pengiriman ping di file: [`src/telemetry/optInStats.ts`](file:///c:/Users/PIXWAR/Documents/DompetKu/src/telemetry/optInStats.ts).
* Anda dapat memeriksa backend di folder: [`server/`](file:///c:/Users/PIXWAR/Documents/DompetKu/server/).
* Jika Anda membuat salinan (fork) dan menginginkan versi murni offline tanpa opsi statistik sama sekali, kosongkan variabel `VITE_STATS_ENDPOINT` pada build time. Seluruh elemen UI statistik tidak akan dimuat ke dalam aplikasi.

