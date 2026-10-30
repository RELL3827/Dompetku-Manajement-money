/**
 * Versi & Riwayat Pembaruan DompetKu
 */

export const APP_VERSION = 'v1.2.0';
export const APP_RELEASE_DATE = '30 Oktober 2026';

export interface VersionChange {
  title: string;
  description: string;
  icon?: string;
}

export const LATEST_RELEASE_NOTES: VersionChange[] = [
  {
    title: 'Update 1-Klik Tanpa Pasang Ulang',
    description: 'Pemberitahuan pembaruan instan di semua perangkat (Android, iOS, Desktop) tanpa kehilangan data.',
    icon: '🚀',
  },
  {
    title: 'Menu Catatan Finansial',
    description: 'Daftar belanja dengan checklist progres, pencatatan hutang/piutang, rencana pos dana, dan wishlist.',
    icon: '📝',
  },
  {
    title: 'Kalkulator Cepat Transaksi & Anggaran',
    description: 'Hitung cepat dengan tombol ribuan (000), rumus alokasi 50/30/20, diskon & PPN, serta split bill patungan.',
    icon: '🧮',
  },
  {
    title: '100% Offline & Privasi Terjaga',
    description: 'Seluruh data tersimpan aman di IndexedDB perangkat Anda, tanpa server dan tanpa pelacak.',
    icon: '🛡️',
  },
];
