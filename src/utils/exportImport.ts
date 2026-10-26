import { exportAllData } from '../db/services';
import { db } from '../db/database';
import { encryptBackupData, decryptBackupData } from '../security/crypto';
import type { BackupData, Transaction, Wallet, Category } from '../types';
import { formatIndonesianDate } from './date';

/**
 * Trigger local browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export complete backup to JSON (with optional password encryption)
 */
export async function exportBackupToJson(password?: string): Promise<void> {
  const data = await exportAllData();
  const dateStr = new Date().toISOString().split('T')[0];

  if (password && password.trim() !== '') {
    // Encrypted export
    const encryptedPayload = await encryptBackupData(JSON.stringify(data), password);
    const jsonStr = JSON.stringify(encryptedPayload, null, 2);
    downloadFile(jsonStr, `DompetKu-Backup-Terenkripsi-${dateStr}.enc.json`, 'application/json');
  } else {
    // Plain export
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, `DompetKu-Backup-${dateStr}.json`, 'application/json');
  }

  // Update last backup timestamp
  await db.updateSettings({ lastBackupDate: new Date().toISOString() });
}

/**
 * Generate CSV for Excel with UTF-8 BOM
 */
export async function exportTransactionsToCsv(): Promise<void> {
  const [transactions, wallets, categories] = await Promise.all([
    db.transactions.toArray(),
    db.wallets.toArray(),
    db.categories.toArray(),
  ]);

  const walletMap = new Map<string, Wallet>(wallets.map((w) => [w.id, w]));
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // CSV Headers
  const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Dompet Sumber', 'Dompet Tujuan', 'Nominal (IDR)', 'Catatan'];

  const rows = transactions.map((t: Transaction) => {
    let typeLabel = 'Pengeluaran';
    if (t.type === 'income') typeLabel = 'Pemasukan';
    if (t.type === 'transfer') typeLabel = 'Transfer';

    const categoryName = t.type === 'transfer' ? 'Transfer Antar Dompet' : catMap.get(t.categoryId)?.name || 'Lainnya';
    const sourceWallet = walletMap.get(t.walletId)?.name || 'Dompet';
    const destWallet = t.toWalletId ? walletMap.get(t.toWalletId)?.name || '' : '';

    const cleanNotes = (t.notes || '').replace(/"/g, '""');

    return [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${typeLabel}"`,
      `"${categoryName}"`,
      `"${sourceWallet}"`,
      `"${destWallet}"`,
      t.amount,
      `"${cleanNotes}"`,
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel properly recognizes Indonesian characters
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `DompetKu-Transaksi-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Read and parse imported backup file
 */
export async function parseBackupFile(
  file: File,
  password?: string
): Promise<{ success: boolean; data?: BackupData; isEncrypted?: boolean; error?: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // Check if file is encrypted payload
    if (parsed.encrypted === true && parsed.salt && parsed.iv && parsed.data) {
      if (!password) {
        return {
          success: false,
          isEncrypted: true,
          error: 'File backup ini dienkripsi dengan password.',
        };
      }

      try {
        const decryptedJson = await decryptBackupData(parsed, password);
        const data = JSON.parse(decryptedJson) as BackupData;
        return { success: true, data, isEncrypted: true };
      } catch (err: any) {
        return {
          success: false,
          isEncrypted: true,
          error: err.message || 'Password salah atau file korup.',
        };
      }
    }

    // Otherwise standard JSON
    if (parsed.appName !== 'DompetKu' || !Array.isArray(parsed.transactions)) {
      return {
        success: false,
        error: 'Format file tidak sesuai standar DompetKu.',
      };
    }

    return { success: true, data: parsed as BackupData, isEncrypted: false };
  } catch (err: any) {
    return {
      success: false,
      error: `Gagal membaca file: ${err.message || 'Format JSON rusak'}`,
    };
  }
}

/**
 * Check if user should be reminded to backup
 */
export async function shouldShowBackupReminder(): Promise<{ shouldRemind: boolean; message?: string }> {
  const settings = await db.getSettings();
  const txCount = await db.transactions.count();

  if (txCount === 0) return { shouldRemind: false };

  if (!settings.lastBackupDate) {
    if (txCount >= 10) {
      return {
        shouldRemind: true,
        message: 'Anda telah mencatat lebih dari 10 transaksi tapi belum pernah membuat backup data.',
      };
    }
    return { shouldRemind: false };
  }

  const lastBackup = new Date(settings.lastBackupDate).getTime();
  const now = Date.now();
  const daysDiff = (now - lastBackup) / (1000 * 60 * 60 * 24);

  if (daysDiff >= 7) {
    return {
      shouldRemind: true,
      message: `Terakhir kali backup dibuat ${Math.floor(daysDiff)} hari yang lalu (${formatIndonesianDate(settings.lastBackupDate, 'short')}). Yuk amankan data keuangan Anda!`,
    };
  }

  return { shouldRemind: false };
}
