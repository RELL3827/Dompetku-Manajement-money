/**
 * Versi & Riwayat Pembaruan DompetKu (Dinamis & Otomatis)
 */

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'v2.7.0';

export const APP_RELEASE_DATE: string =
  typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '13 November 2026';

export const APP_BUILD_TIMESTAMP: number =
  typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : Date.now();

export interface VersionChange {
  title: string;
  description: string;
  icon?: string;
}

/**
 * Menyimpan dan mengambil catatan tanggal update terpasang di perangkat pengguna
 */
const UPDATE_DATE_STORAGE_KEY = 'dompetku_installed_update_date';
const UPDATE_VERSION_STORAGE_KEY = 'dompetku_installed_update_version';

export function getInstalledUpdateInfo(): { version: string; date: string } {
  try {
    const savedVersion = localStorage.getItem(UPDATE_VERSION_STORAGE_KEY);
    const savedDate = localStorage.getItem(UPDATE_DATE_STORAGE_KEY);

    if (savedVersion === APP_VERSION && savedDate) {
      return { version: savedVersion, date: savedDate };
    }

    // Jika versi baru baru saja terpasang, simpan tanggal saat ini
    const currentDate = APP_RELEASE_DATE;
    localStorage.setItem(UPDATE_VERSION_STORAGE_KEY, APP_VERSION);
    localStorage.setItem(UPDATE_DATE_STORAGE_KEY, currentDate);
    return { version: APP_VERSION, date: currentDate };
  } catch {
    return { version: APP_VERSION, date: APP_RELEASE_DATE };
  }
}

export const LATEST_RELEASE_NOTES: VersionChange[] = [
  {
    title: 'iOS 27 Hyper-Liquid & Spatial Visuals',
    description: 'Tampilan baru ultra-kaca (Liquid Glassmorphism) dengan saturasi warna 190%, specular edge highlights, dan kedalaman spasial elegan.',
    icon: '✨',
  },
  {
    title: 'Animasi Haptik & Elastis (Spring Physics)',
    description: 'Tombol dengan respon squish elastis selevel sistem iOS, transisi lembar dialog mulus, dan kartu interaktif dengan efek tekan taktil.',
    icon: '⚡',
  },
  {
    title: 'Icon 3D Realistis Generasi Baru',
    description: 'Icon vektor 3D berdimensi tinggi dengan specular gleam, kilau keramik, tekstur koin emas timbul, dan dompet bergradien kaya.',
    icon: '💎',
  },
  {
    title: 'Versi & Tanggal Update Otomatis',
    description: 'Versi aplikasi dan tanggal rilis kini selalu bertambah dan terbarui otomatis setiap kali build rilis tanpa pernah stuck di versi lama.',
    icon: '🚀',
  },
  {
    title: 'Nabung Bersama & Tabungan Cicilan',
    description: 'Fitur checklist pembayaran patungan, integrasi share WhatsApp, serta tabungan cicilan terstruktur dalam satu menu.',
    icon: '👥',
  },
  {
    title: '100% Offline & Privasi Terjaga',
    description: 'Seluruh data tersimpan aman di IndexedDB perangkat Anda, tanpa pelacak, tanpa iklan, dan tanpa server luar.',
    icon: '🛡️',
  },
];
