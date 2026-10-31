export type TransactionType = 'income' | 'expense' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment' | 'other';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  icon: string;
  color: string;
  initialBalance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BudgetGroup503020 = 'needs' | 'wants' | 'savings';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budgetGroup?: BudgetGroup503020;
  isDefault?: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string; // or 'transfer' if transfer
  walletId: string; // Source wallet
  toWalletId?: string; // Destination wallet if transfer
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  period: 'monthly';
  createdAt: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // YYYY-MM-DD
  walletId?: string; // Dompet penyimpanan dana tabungan (opsional)
  icon: string;
  color: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySettings {
  isPinEnabled: boolean;
  pinHash?: string; // PBKDF2 hash (hex or base64)
  salt?: string; // Random salt for PBKDF2
  isBiometricEnabled: boolean;
  biometricCredentialId?: string;
  autoLockMinutes: number; // 0 = immediate, 1 = 1m, 5 = 5m, 15 = 15m, -1 = never
  failedAttempts: number;
  lockedUntil?: number | null; // Timestamp
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  security: SecuritySettings;
  isStoragePersisted: boolean;
  lastBackupDate?: string | null;
  hasCompletedOnboarding: boolean;
  currency: string;
  monthlyIncomeTarget?: number;
}

export interface Budget503020Summary {
  incomeBase: number;
  needsTarget: number;
  wantsTarget: number;
  savingsTarget: number;
  needsSpent: number;
  wantsSpent: number;
  savingsSpent: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  needsRemaining: number;
  wantsRemaining: number;
  savingsRemaining: number;
  needsCategories: Array<{ category: Category; budgetLimit: number; spent: number }>;
  wantsCategories: Array<{ category: Category; budgetLimit: number; spent: number }>;
  savingsCategories: Array<{ category: Category; budgetLimit: number; spent: number }>;
  currentMonthIncome: number;
  status: {
    needs: 'safe' | 'warning' | 'danger';
    wants: 'safe' | 'warning' | 'danger';
    savings: 'safe' | 'warning' | 'danger';
  };
}

export type NoteTag = 'general' | 'shopping' | 'debt' | 'wishlist' | 'budget';

export interface NoteChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
  amount?: number;
}

export interface FinancialNote {
  id: string;
  title: string;
  content: string;
  category: NoteTag;
  color: string;
  isPinned: boolean;
  checklist?: NoteChecklistItem[];
  estimatedAmount?: number;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 'gajian' | 'liburan' | 'tagihan' | 'belanja' | 'lainnya';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  amount?: number;
  color?: string;
  notes?: string;
  isDone?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  version: number;
  appName: 'DompetKu';
  exportDate: string;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savings?: SavingGoal[];
  notes?: FinancialNote[];
  calendarEvents?: CalendarEvent[];
  settings?: Partial<AppSettings>;
}

export type PeriodFilter = 'all' | 'this_week' | 'this_month' | 'last_3_months' | 'this_year' | 'custom';

export type SortOrder = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export interface TransactionFilters {
  searchQuery: string;
  type: 'all' | TransactionType;
  walletId: string; // 'all' or specific wallet id
  categoryId: string; // 'all' or specific category id
  period: PeriodFilter;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sort: SortOrder;
}

export type NavTab =
  | 'home'
  | 'transactions'
  | 'calendar'
  | 'wallets'
  | 'savings'
  | 'budgets'
  | 'notes'
  | 'calculator'
  | 'analytics'
  | 'settings';
