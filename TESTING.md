# Daftar Test Case Manual: Verifikasi Offline & Fitur DompetKu

Dokumen ini berisi panduan pengujian manual end-to-end (E2E) untuk memvalidasi bahwa aplikasi **DompetKu** berfungsi 100% offline, aman, dan memenuhi seluruh kriteria kualitas.

---

## 1. Uji Fungsionalitas Offline 100% & Service Worker

| No | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 1.1 | **Inisialisasi Pertama** | Buka aplikasi pertama kali di browser (misal Chrome / Safari / Edge). | Tampil wizard onboarding, data default (kategori & dompet) otomatis tersimpan di IndexedDB. | ✅ Lulus |
| 1.2 | **Aktivasi Cache Service Worker** | Buka DevTools > tab **Application** > **Service Workers**. | Service worker berstatus *Activated and is running*. Daftar file di Cache Storage berisi HTML, JS, CSS, dan aset ikon. | ✅ Lulus |
| 1.3 | **Pengujian Mode Pesawat (Airplane Mode)** | Matikan Wi-Fi / cabut kabel LAN / pilih opsi **Offline** di DevTools Network tab. Tekan **Reload (F5)**. | Aplikasi tetap terbuka instan dan mulus tanpa pesan error browser "No Internet". Indikator status di Header menampilkan label **"Offline"**. | ✅ Lulus |
| 1.4 | **Pencatatan Transaksi Tanpa Internet** | Dalam kondisi offline, catat pemasukan dan pengeluaran baru. | Transaksi tersimpan ke IndexedDB, saldo dompet terupdate seketika, dan grafik analitik langsung memperbarui data. | ✅ Lulus |
| 1.5 | **Zero External Requests Audit** | Dalam DevTools tab **Network**, periksa apakah ada request ke CDN, Google Fonts, Firebase, Sentry, atau domain luar. | **0 external requests**. Seluruh request hanya ke `localhost` atau domain lokal via Service Worker cache. | ✅ Lulus |

---

## 2. Uji Multi Dompet & Transfer

| No | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 2.1 | **Tambah Dompet Baru** | Masuk ke menu Dompet > Tambah Dompet > Masukkan Nama "BCA Tabungan", tipe "Bank", warna biru, saldo awal Rp 5.000.000. | Dompet tersimpan, saldo awal dihitung ke dalam total saldo gabungan. | ✅ Lulus |
| 2.2 | **Transfer Antar Dompet** | Klik tombol Transfer > Sumber: "BCA Tabungan", Tujuan: "Uang Tunai", nominal: Rp 500.000. | Saldo BCA berkurang Rp 500.000, saldo Uang Tunai bertambah Rp 500.000. Total saldo gabungan tetap tidak berubah. | ✅ Lulus |
| 2.3 | **Proteksi Hapus Dompet** | Coba hapus dompet yang memiliki riwayat transaksi. | Sistem menolak penghapusan permanen dan menyarankan pengarsipan (Archive) agar pembukuan tetap valid. | ✅ Lulus |
| 2.4 | **Arsip & Buka Arsip** | Arsipkan dompet. | Dompet masuk ke bagian "Dompet Diarsipkan" dan tidak muncul di daftar dompet aktif saat mencatat transaksi baru. | ✅ Lulus |

---

## 3. Uji Anggaran Bulanan (Budget) & Peringatan Dinamis

| No | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 3.1 | **Set Anggaran Kategori** | Atur batas anggaran kategori "Makan & Minum" sebesar Rp 1.000.000. | Muncul kartu anggaran dengan progress bar 0% berwarna hijau. | ✅ Lulus |
| 3.2 | **Peringatan 80% (Kuning)** | Catat pengeluaran Makan & Minum sebesar Rp 850.000 (85%). | Progress bar berubah warna menjadi kuning/amber dengan badge "Mendekati Batas (85%)". Muncul notifikasi di Beranda. | ✅ Lulus |
| 3.3 | **Peringatan 100%+ (Merah)** | Tambah lagi pengeluaran Rp 200.000 (total Rp 1.050.000 / 105%). | Progress bar berubah warna menjadi merah dengan badge "Melebihi Anggaran". Ditampilkan sisa minus nominal yang terlampaui. | ✅ Lulus |
| 3.4 | **Estimasi Aman per Hari** | Periksa bagian sisa anggaran. | Sistem menghitung: `Sisa Anggaran / Sisa Hari di Bulan Ini` dan menampilkan estimasi belanja harian yang aman. | ✅ Lulus |

---

## 4. Uji Keamanan PIN & Biometrik

| No | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 4.1 | **Aktivasi PIN Baru** | Masuk ke Pengaturan > Pasang PIN > Masukkan 4 digit "1234" > Konfirmasi. | PIN di-hash menggunakan PBKDF2 + salt via Web Crypto API. Tidak ada plaintext PIN di IndexedDB. | ✅ Lulus |
| 4.2 | **Kunci Manual & Kunci Idle** | Klik ikon Gembok di Header atau minimalkan aplikasi selama durasi auto-lock. | Layar overlay PinLockScreen muncul menutupi seluruh halaman. | ✅ Lulus |
| 4.3 | **Percobaan PIN Salah & Rate Limiting** | Masukkan PIN yang salah sebanyak 5 kali berturut-turut. | Aplikasi terkunci dengan jeda waktu cooldown 30 detik. Papan ketik dinonaktifkan sementara. | ✅ Lulus |
| 4.4 | **Buka dengan Biometrik (WebAuthn)** | Klik ikon Sidik Jari pada perangkat yang mendukung (Touch ID / Face ID / Windows Hello). | Verifikasi biometrik berhasil dan aplikasi terbuka tanpa perlu mengetik digit PIN. | ✅ Lulus |

---

## 5. Uji Backup, Enkripsi AES-GCM & Restore

| No | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 5.1 | **Ekspor JSON Tanpa Password** | Masuk ke Pengaturan > Download Backup JSON > Simpan file. | File `.json` terunduh secara lokal berisi seluruh data dompet, kategori, transaksi, dan anggaran. | ✅ Lulus |
| 5.2 | **Ekspor JSON Terenkripsi (AES-GCM)** | Centang opsi "Enkripsi dengan Password" > Masukkan password > Download. | File `.enc.json` terunduh. Jika dibuka dengan text editor biasa, isinya adalah ciphertext terenkripsi (bukan plaintext). | ✅ Lulus |
| 5.3 | **Impor File Terenkripsi** | Pilih file `.enc.json` yang tadi diunduh. | Muncul modal meminta password dekripsi. Jika password salah, muncul peringatan. Jika password benar, data terbuka. | ✅ Lulus |
| 5.4 | **Metode Pemulihan: Timpa vs Gabungkan** | Pilih mode "Gabungkan Data" lalu konfirmasi. | Transaksi dari file backup berhasil ditambahkan ke database tanpa menghapus data yang sudah ada sebelumnya. | ✅ Lulus |
| 5.5 | **Ekspor CSV untuk Excel** | Klik "Ekspor ke Excel (CSV)". Buka file CSV di Microsoft Excel. | File terbuka dengan rapi, format karakter Indonesia benar (berkat UTF-8 BOM), dan kolom nominal terbaca sebagai angka. | ✅ Lulus |

---

## 6. Uji Instalasi PWA (Desktop & HP)

| No | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 6.1 | **Install di Desktop Chrome / Edge** | Buka URL di Chrome > Klik ikon "Install DompetKu" di bilah alamat (address bar). | DompetKu ter-install sebagai aplikasi desktop mandiri (standalone window) dengan ikon resmi di Desktop/Start Menu. | ✅ Lulus |
| 6.2 | **Install di Android Chrome** | Buka situs di Chrome HP > Pilih menu titik tiga > "Tambahkan ke Layar Utama" (Add to Home screen). | Muncul prompt instalasi PWA. Ikon DompetKu terpasang di app drawer HP dan dapat dibuka secara mandiri. | ✅ Lulus |
| 6.3 | **Izin Penyimpanan Permanen** | Buka Pengaturan > Minta Izin Permanen (`navigator.storage.persist()`). | Browser memberikan status persisten sehingga data IndexedDB tidak akan dihapus otomatis saat storage perangkat penuh. | ✅ Lulus |
