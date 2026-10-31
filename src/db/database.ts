import Dexie, { type Table } from 'dexie';
import type { Wallet, Category, Transaction, Budget, SavingGoal, FinancialNote, CalendarEvent, AppSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, DEFAULT_WALLETS } from './defaultData';

export interface SettingRecord {
  key: string;
  value: any;
}

export class DompetKuDatabase extends Dexie {
  wallets!: Table<Wallet, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  savings!: Table<SavingGoal, string>;
  notes!: Table<FinancialNote, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('DompetKuDB');

    // Schema definition version 1
    this.version(1).stores({
      wallets: 'id, name, type, isArchived, createdAt',
      categories: 'id, name, type, isDefault, createdAt',
      transactions: 'id, amount, type, categoryId, walletId, toWalletId, date, createdAt',
      budgets: 'id, categoryId, period, createdAt',
      settings: 'key',
    });

    // Schema definition version 2 (Adding Savings Goals / Celengan)
    this.version(2).stores({
      wallets: 'id, name, type, isArchived, createdAt',
      categories: 'id, name, type, isDefault, createdAt',
      transactions: 'id, amount, type, categoryId, walletId, toWalletId, date, createdAt',
      budgets: 'id, categoryId, period, createdAt',
      settings: 'key',
      savings: 'id, name, isCompleted, walletId, targetDate, createdAt',
    });

    // Schema definition version 3 (Adding Financial Notes / Catatan Keuangan)
    this.version(3).stores({
      wallets: 'id, name, type, isArchived, createdAt',
      categories: 'id, name, type, isDefault, createdAt',
      transactions: 'id, amount, type, categoryId, walletId, toWalletId, date, createdAt',
      budgets: 'id, categoryId, period, createdAt',
      settings: 'key',
      savings: 'id, name, isCompleted, walletId, targetDate, createdAt',
      notes: 'id, title, category, isPinned, createdAt, updatedAt',
    });

    // Schema definition version 4 (Adding Calendar Events: Gajian, Liburan, Tagihan, dll.)
    this.version(4).stores({
      wallets: 'id, name, type, isArchived, createdAt',
      categories: 'id, name, type, isDefault, createdAt',
      transactions: 'id, amount, type, categoryId, walletId, toWalletId, date, createdAt',
      budgets: 'id, categoryId, period, createdAt',
      settings: 'key',
      savings: 'id, name, isCompleted, walletId, targetDate, createdAt',
      notes: 'id, title, category, isPinned, createdAt, updatedAt',
      calendarEvents: 'id, title, type, date, isDone, createdAt',
    });
  }

  /**
   * Seed default data if database is brand new
   */
  async seedInitialData(): Promise<void> {
    const categoryCount = await this.categories.count();
    const now = new Date().toISOString();

    if (categoryCount === 0) {
      const initialCategories: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
        ...cat,
        id: `cat_${Date.now()}_${idx}`,
        createdAt: now,
      }));
      await this.categories.bulkAdd(initialCategories);
    }

    const walletCount = await this.wallets.count();
    if (walletCount === 0) {
      const initialWallets: Wallet[] = DEFAULT_WALLETS.map((w, idx) => ({
        ...w,
        id: `wallet_${Date.now()}_${idx}`,
        createdAt: now,
        updatedAt: now,
      }));
      await this.wallets.bulkAdd(initialWallets);
    }

    const settingsCount = await this.settings.count();
    if (settingsCount === 0) {
      await this.settings.put({
        key: 'app_settings',
        value: DEFAULT_SETTINGS,
      });
    }
  }

  async getSettings(): Promise<AppSettings> {
    const record = await this.settings.get('app_settings');
    if (!record || !record.value) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...record.value };
  }

  async updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...partial,
      security: {
        ...current.security,
        ...(partial.security || {}),
      },
    };
    await this.settings.put({
      key: 'app_settings',
      value: updated,
    });
    return updated;
  }
}

export const db = new DompetKuDatabase();

// Execute seeding on startup
db.on('ready', async () => {
  await db.seedInitialData();
});
