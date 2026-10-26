import type { Category, Wallet, AppSettings } from '../types';

export const DEFAULT_WALLETS: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Uang Tunai',
    type: 'cash',
    icon: 'Banknote',
    color: '#10b981', // Emerald
    initialBalance: 0,
    isArchived: false,
  },
  {
    name: 'Rekening Bank',
    type: 'bank',
    icon: 'Landmark',
    color: '#3b82f6', // Blue
    initialBalance: 0,
    isArchived: false,
  },
  {
    name: 'E-Wallet',
    type: 'ewallet',
    icon: 'Smartphone',
    color: '#8b5cf6', // Violet
    initialBalance: 0,
    isArchived: false,
  },
];

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  // Pengeluaran (Expense) - 50% Kebutuhan (Needs)
  { name: 'Makan & Minum', type: 'expense', icon: 'Utensils', color: '#f97316', budgetGroup: 'needs', isDefault: true },
  { name: 'Transportasi', type: 'expense', icon: 'Car', color: '#06b6d4', budgetGroup: 'needs', isDefault: true },
  { name: 'Belanja & Kebutuhan', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', budgetGroup: 'needs', isDefault: true },
  { name: 'Tagihan & Utilitas', type: 'expense', icon: 'Receipt', color: '#eab308', budgetGroup: 'needs', isDefault: true },
  { name: 'Kesehatan & Medis', type: 'expense', icon: 'HeartPulse', color: '#ef4444', budgetGroup: 'needs', isDefault: true },
  { name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#3b82f6', budgetGroup: 'needs', isDefault: true },
  { name: 'Donasi & Sedekah', type: 'expense', icon: 'HandHeart', color: '#14b8a6', budgetGroup: 'needs', isDefault: true },

  // Pengeluaran (Expense) - 30% Keinginan (Wants)
  { name: 'Hiburan & Hobi', type: 'expense', icon: 'Gamepad2', color: '#8b5cf6', budgetGroup: 'wants', isDefault: true },
  { name: 'Pengeluaran Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#64748b', budgetGroup: 'wants', isDefault: true },

  // Pemasukan (Income)
  { name: 'Gaji Pokok', type: 'income', icon: 'Briefcase', color: '#10b981', isDefault: true },
  { name: 'Pendapatan Usaha', type: 'income', icon: 'Store', color: '#22c55e', isDefault: true },
  { name: 'Investasi & Dividen', type: 'income', icon: 'TrendingUp', color: '#0ea5e9', budgetGroup: 'savings', isDefault: true },
  { name: 'Bonus & THR', type: 'income', icon: 'Gift', color: '#f59e0b', isDefault: true },
  { name: 'Pemasukan Lainnya', type: 'income', icon: 'PlusCircle', color: '#64748b', isDefault: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  security: {
    isPinEnabled: false,
    isBiometricEnabled: false,
    autoLockMinutes: 5,
    failedAttempts: 0,
    lockedUntil: null,
  },
  isStoragePersisted: false,
  lastBackupDate: null,
  hasCompletedOnboarding: false,
  currency: 'IDR',
  monthlyIncomeTarget: 0,
};
