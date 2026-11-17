/**
 * Versi & Riwayat Pembaruan DompetKu (Dinamis & Otomatis)
 */

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'v2.17.0';

export const APP_RELEASE_DATE: string =
  typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '18 November 2026';

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
    title: 'Integrasi Tautan Website Resmi DompetKu',
    description: 'Menyematkan akses langsung ke website resmi https://website-dompetku-one.vercel.app/ di halaman Pengaturan & Backup, modal Tentang DompetKu, Desktop Sidebar, dan metadata landing page aplikasi.',
    icon: '🌐',
  },
  {
    title: 'Loading Screen Liquid Glass Edition (Progress 100% ~5 Detik)',
    description: 'Penyempurnaan animasi pembuka tampilan awal bertema Liquid Glass Edition dengan durasi terkalibrasi ~5 detik: kartu kaca frosted dengan specular rim highlight, indikator progres persentase 0% hingga 100% dengan tabular numerals, status bertahap (Inisialisasi, Basis Data, Sinkronisasi, Rendering, Finalisasi), efek neon shimmer fluid, serta penutupan transisi mulus 60 FPS tanpa memberatkan APK.',
    icon: '✨',
  },
  {
    title: 'Animasi Loading Screen Tampilan Awal Aesthetic & Ringan',
    description: 'Layar pembuka awal bertema Liquid Glass ultra-ringan: logo emblem berkilau dengan efek pendar halus, shimmer bar berbasis GPU compositor 60fps, adaptasi tema otomatis tanpa kedipan (zero-FOUC), dan pembersihan instan dari memori setelah terbuka sehingga APK tetap enteng dan responsif.',
    icon: '✨',
  },
  {
    title: 'Optimasi Performa Ringan & 60fps GPU Rendering',
    description: 'Aplikasi kini jauh lebih ringan dan mulus tanpa mengubah tampilan atau fitur apapun: pemotongan drastis ukuran bundle ikon Lucide (-700 kB JS), eliminasi reflow layout pada sentuhan scroll kartu, pengalihan animasi ambient orb ke GPU compositor layer murni (translate3d), optimasi beban Gaussian blur, dan akselerasi content-visibility pada daftar transaksi panjang.',
    icon: '⚡',
  },
  {
    title: 'Optimalisasi Tampilan iOS & Safe Area Insets',
    description: 'Penyempurnaan tata letak khusus iOS: dukungan penuh Safe Area Insets (Dynamic Island, notch & home bar), pemosisian rapih Floating Dock & FAB tanpa tumpang tindih, modal bottom sheet dvh anti-terpotong toolbar Safari, pencegahan auto-zoom input, dan clearance scroll halaman agar seluruh aksi hapus dan riwayat terlihat utuh.',
    icon: '📱',
  },
  {
    title: 'Tombol Masuk & Check-In Nyalakan Api Streak',
    description: 'Tombol "Masuk & Nyalakan Api" harian untuk mengklaim dan menyalakan streak api setiap hari secara mandiri tanpa harus mencatat transaksi, dilengkapi getaran sukses dan indikator api menyala aman.',
    icon: '🔥',
  },
  {
    title: 'Evolusi Tingkatan Api TikTok (8 Taraf)',
    description: 'Transformasi visual bentuk, warna, dan aura api seiring bertambahnya streak: Api Oranye (<7h), Emas (7h), Ungu Mistis (14h), Biru Plasma (30h), Zamrud Hijau (50h), Berlian Ruby Crown (100h), Pelangi Kosmik (365h), dan Dewa Abadi dengan Solar Halo (1000h) lengkap dengan galeri pratinjau interaktif.',
    icon: '⚡',
  },
  {
    title: 'Streak Api Harian TikTok Style',
    description: 'Fitur streak api (flame streak) setiap hari ala TikTok: pelacakan konsistensi mencatat keuangan harian, animasi api membara & percikan bara GPU, status api menyala vs hampir padam, kalender mini 7 hari, rekor terpanjang, dan level pencapaian api abadi.',
    icon: '⚡',
  },
  {
    title: 'Touch Ripples, Micro-Interactions & Gestures',
    description: 'Efek sentuhan riak air (liquid touch ripple) bertenaga GPU, navigasi gestur swipe layar antar tab yang mulus, tarikan gesture drag-down bottom-sheet pada modal, directional view transitions, dan respons tactile haptic yang ringan dan responsif.',
    icon: '✨',
  },
  {
    title: 'Apresiasi Pengembang: Traktir Kopi',
    description: 'Penyegaran istilah dukungan pengembang menjadi "Traktir Kopi" dengan nuansa ramah, visual hangat, serta kemudahan scan QRIS RellAppstore.',
    icon: '☕',
  },
  {
    title: 'Liquid Glass UI/UX & Dynamic Micro-Interactions',
    description: 'Transformasi visual ultra-kaca dengan latar ambient liquid orbs yang berpendar, efek refraksi specular rim, animasi squish pegas taktil pada tombol, dan shimmer sweep.',
    icon: '🔮',
  },
  {
    title: 'Penyempurnaan Riwayat Transaksi & Aksi Hapus',
    description: 'Tombol aksi hapus dan ubah kini hadir langsung tanpa dropdown rumit di baris transaksi dan di dalam modal edit, dengan optimasi tata letak responsif untuk Android, iOS, dan Laptop.',
    icon: '⚡',
  },
  {
    title: 'Perbaikan Sistem Hapus Data (ConfirmDialog)',
    description: 'Mengganti dialog bawaan browser dengan modal konfirmasi interaktif yang stabil di mode PWA / mobile, lengkap dengan indikator proses dan proteksi integritas data.',
    icon: '🛡️',
  },
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
