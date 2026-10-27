import { db } from './database';
import type {
  Wallet,
  Category,
  Transaction,
  Budget,
  SavingGoal,
  TransactionFilters,
  BackupData,
  BudgetGroup503020,
  Budget503020Summary,
} from '../types';

export interface WalletBalanceInfo {
  wallet: Wallet;
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface BudgetStatusInfo {
  budget: Budget;
  category: Category;
  monthlyLimit: number;
  spent: number;
  percentage: number;
  remaining: number;
  safeDaily: number;
  daysRemaining: number;
  status: 'safe' | 'warning' | 'danger'; // safe (<80%), warning (80-99%), danger (>=100%)
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  dailyAverageExpense: number;
  topExpenseCategory?: { name: string; amount: number; percentage: number; color: string };
  transactionCount: number;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ----------------------------------------------------
// WALLET SERVICES
// ----------------------------------------------------

export async function getWallets(includeArchived = false): Promise<Wallet[]> {
  if (includeArchived) {
    return await db.wallets.toArray();
  }
  return await db.wallets.filter((w) => !w.isArchived).toArray();
}

export async function getWalletById(id: string): Promise<Wallet | undefined> {
  return await db.wallets.get(id);
}

export async function calculateWalletBalance(walletId: string): Promise<number> {
  const wallet = await db.wallets.get(walletId);
  if (!wallet) return 0;

  const transactions = await db.transactions
    .filter((t) => t.walletId === walletId || t.toWalletId === walletId)
    .toArray();

  let balance = wallet.initialBalance;

  for (const t of transactions) {
    if (t.type === 'income' && t.walletId === walletId) {
      balance += t.amount;
    } else if (t.type === 'expense' && t.walletId === walletId) {
      balance -= t.amount;
    } else if (t.type === 'transfer') {
      if (t.walletId === walletId) {
        balance -= t.amount; // Sent
      }
      if (t.toWalletId === walletId) {
        balance += t.amount; // Received
      }
    }
  }

  return balance;
}

export async function getAllWalletBalances(): Promise<WalletBalanceInfo[]> {
  const wallets = await db.wallets.toArray();
  const transactions = await db.transactions.toArray();

  const results: WalletBalanceInfo[] = [];

  for (const w of wallets) {
    let income = 0;
    let expense = 0;
    let balance = w.initialBalance;

    for (const t of transactions) {
      if (t.walletId === w.id) {
        if (t.type === 'income') {
          income += t.amount;
          balance += t.amount;
        } else if (t.type === 'expense') {
          expense += t.amount;
          balance -= t.amount;
        } else if (t.type === 'transfer') {
          balance -= t.amount;
        }
      }
      if (t.toWalletId === w.id && t.type === 'transfer') {
        balance += t.amount;
      }
    }

    results.push({
      wallet: w,
      balance,
      totalIncome: income,
      totalExpense: expense,
    });
  }

  return results;
}

export async function saveWallet(walletData: Partial<Wallet> & { name: string; type: any; icon: string; color: string; initialBalance: number }): Promise<Wallet> {
  const now = new Date().toISOString();
  if (walletData.id) {
    const existing = await db.wallets.get(walletData.id);
    if (!existing) throw new Error('Dompet tidak ditemukan');
    const updated: Wallet = {
      ...existing,
      ...walletData,
      updatedAt: now,
    };
    await db.wallets.put(updated);
    return updated;
  } else {
    const newWallet: Wallet = {
      id: generateId('wlt'),
      name: walletData.name.trim(),
      type: walletData.type,
      icon: walletData.icon,
      color: walletData.color,
      initialBalance: walletData.initialBalance || 0,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.wallets.add(newWallet);
    return newWallet;
  }
}

export async function toggleArchiveWallet(id: string, isArchived: boolean): Promise<void> {
  await db.wallets.update(id, { isArchived, updatedAt: new Date().toISOString() });
}

export async function deleteWallet(id: string): Promise<{ success: boolean; message?: string }> {
  const txCount = await db.transactions.filter((t) => t.walletId === id || t.toWalletId === id).count();
  if (txCount > 0) {
    return {
      success: false,
      message: `Dompet ini memiliki ${txCount} riwayat transaksi. Untuk menjaga keutuhan data, arsipkan dompet ini daripada menghapusnya.`,
    };
  }
  await db.wallets.delete(id);
  return { success: true };
}

// ----------------------------------------------------
// CATEGORY SERVICES
// ----------------------------------------------------

export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  if (type) {
    return await db.categories.filter((c) => c.type === type).toArray();
  }
  return await db.categories.toArray();
}

export async function saveCategory(categoryData: Partial<Category> & { name: string; type: 'income' | 'expense'; icon: string; color: string; budgetGroup?: BudgetGroup503020 }): Promise<Category> {
  const now = new Date().toISOString();
  if (categoryData.id) {
    const existing = await db.categories.get(categoryData.id);
    if (!existing) throw new Error('Kategori tidak ditemukan');
    const updated: Category = {
      ...existing,
      ...categoryData,
    };
    await db.categories.put(updated);
    return updated;
  } else {
    const newCategory: Category = {
      id: generateId('cat'),
      name: categoryData.name.trim(),
      type: categoryData.type,
      icon: categoryData.icon,
      color: categoryData.color,
      budgetGroup: categoryData.budgetGroup,
      isDefault: false,
      createdAt: now,
    };
    await db.categories.add(newCategory);
    return newCategory;
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  const txCount = await db.transactions.filter((t) => t.categoryId === id).count();
  if (txCount > 0) {
    return {
      success: false,
      message: `Kategori ini memiliki ${txCount} transaksi terkait. Hapus atau pindahkan transaksi terlebih dahulu.`,
    };
  }
  await db.budgets.filter((b) => b.categoryId === id).delete();
  await db.categories.delete(id);
  return { success: true };
}

// ----------------------------------------------------
// TRANSACTION SERVICES
// ----------------------------------------------------

export async function saveTransaction(data: {
  id?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId: string;
  walletId: string;
  toWalletId?: string;
  date: string;
  notes?: string;
}): Promise<Transaction> {
  const now = new Date().toISOString();

  if (data.type === 'transfer' && (!data.toWalletId || data.walletId === data.toWalletId)) {
    throw new Error('Dompet tujuan transfer harus berbeda dengan dompet asal');
  }

  if (data.id) {
    const existing = await db.transactions.get(data.id);
    if (!existing) throw new Error('Transaksi tidak ditemukan');
    const updated: Transaction = {
      ...existing,
      ...data,
      updatedAt: now,
    };
    await db.transactions.put(updated);
    return updated;
  } else {
    const newTx: Transaction = {
      id: generateId('tx'),
      amount: Math.abs(data.amount),
      type: data.type,
      categoryId: data.categoryId,
      walletId: data.walletId,
      toWalletId: data.toWalletId,
      date: data.date,
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.add(newTx);
    return newTx;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const all = await db.transactions.toArray();
  return all
    .sort((a, b) => {
      const cmp = b.date.localeCompare(a.date);
      if (cmp !== 0) return cmp;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, limit);
}

export async function getFilteredTransactions(filters: TransactionFilters): Promise<Transaction[]> {
  let list = await db.transactions.toArray();

  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter((t) => (t.notes || '').toLowerCase().includes(q));
  }

  if (filters.type !== 'all') {
    list = list.filter((t) => t.type === filters.type);
  }

  if (filters.walletId && filters.walletId !== 'all') {
    list = list.filter((t) => t.walletId === filters.walletId || t.toWalletId === filters.walletId);
  }

  if (filters.categoryId && filters.categoryId !== 'all') {
    list = list.filter((t) => t.categoryId === filters.categoryId);
  }

  if (filters.startDate) {
    list = list.filter((t) => t.date >= filters.startDate!);
  }
  if (filters.endDate) {
    list = list.filter((t) => t.date <= filters.endDate!);
  }

  if (filters.minAmount !== undefined && filters.minAmount > 0) {
    list = list.filter((t) => t.amount >= filters.minAmount!);
  }
  if (filters.maxAmount !== undefined && filters.maxAmount > 0) {
    list = list.filter((t) => t.amount <= filters.maxAmount!);
  }

  list.sort((a, b) => {
    switch (filters.sort) {
      case 'date_asc': {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
      }
      case 'amount_desc':
        return b.amount - a.amount;
      case 'amount_asc':
        return a.amount - b.amount;
      case 'date_desc':
      default: {
        const d = b.date.localeCompare(a.date);
        return d !== 0 ? d : b.createdAt.localeCompare(a.createdAt);
      }
    }
  });

  return list;
}

// ----------------------------------------------------
// BUDGET SERVICES
// ----------------------------------------------------

export async function getBudgets(): Promise<Budget[]> {
  return await db.budgets.toArray();
}

export async function saveBudget(data: { id?: string; categoryId: string; monthlyLimit: number }): Promise<Budget> {
  const existingWithCat = await db.budgets.filter((b) => b.categoryId === data.categoryId).first();
  const now = new Date().toISOString();

  if (data.id || existingWithCat) {
    const targetId = data.id || existingWithCat!.id;
    const existing = await db.budgets.get(targetId);
    const updated: Budget = {
      ...existing!,
      categoryId: data.categoryId,
      monthlyLimit: data.monthlyLimit,
    };
    await db.budgets.put(updated);
    return updated;
  } else {
    const newBudget: Budget = {
      id: generateId('bgt'),
      categoryId: data.categoryId,
      monthlyLimit: data.monthlyLimit,
      period: 'monthly',
      createdAt: now,
    };
    await db.budgets.add(newBudget);
    return newBudget;
  }
}

export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.delete(id);
}

export async function getAllBudgetStatuses(yearMonth?: string): Promise<BudgetStatusInfo[]> {
  const now = new Date();
  const currentYm = yearMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [budgets, categories, transactions] = await Promise.all([
    db.budgets.toArray(),
    db.categories.toArray(),
    db.transactions.toArray(),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const [yearStr, monthStr] = currentYm.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = now.getFullYear() === year && now.getMonth() + 1 === month ? now.getDate() : 1;
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  const statuses: BudgetStatusInfo[] = [];

  for (const b of budgets) {
    const cat = catMap.get(b.categoryId);
    if (!cat) continue;

    const spent = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(currentYm))
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const remaining = b.monthlyLimit - spent;
    const safeDaily = remaining > 0 ? Math.floor(remaining / daysRemaining) : 0;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) {
      status = 'danger';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    statuses.push({
      budget: b,
      category: cat,
      monthlyLimit: b.monthlyLimit,
      spent,
      percentage,
      remaining,
      safeDaily,
      daysRemaining,
      status,
    });
  }

  return statuses.sort((a, b) => b.percentage - a.percentage);
}

// ----------------------------------------------------
// METODE 50/30/20 BUDGETING SERVICES
// ----------------------------------------------------

/**
 * Helper to determine category group (50% Kebutuhan, 30% Keinginan, 20% Tabungan)
 */
export function getCategoryBudgetGroup(category: Category): BudgetGroup503020 {
  if (category.budgetGroup) return category.budgetGroup;

  const lower = category.name.toLowerCase();

  // Tabungan & Investasi (Savings)
  if (
    lower.includes('tabung') ||
    lower.includes('invest') ||
    lower.includes('dividen') ||
    lower.includes('darurat') ||
    lower.includes('celengan') ||
    lower.includes('emas') ||
    lower.includes('saham') ||
    lower.includes('reksadana') ||
    lower.includes('crypto')
  ) {
    return 'savings';
  }

  // Kebutuhan Pokok (Needs - 50%)
  if (
    lower.includes('makan') ||
    lower.includes('minum') ||
    lower.includes('sembako') ||
    lower.includes('pangan') ||
    lower.includes('kebutuhan') ||
    lower.includes('transport') ||
    lower.includes('bensin') ||
    lower.includes('ongkos') ||
    lower.includes('tagihan') ||
    lower.includes('utilitas') ||
    lower.includes('listrik') ||
    lower.includes('air') ||
    lower.includes('pulsa') ||
    lower.includes('internet') ||
    lower.includes('sewa') ||
    lower.includes('kost') ||
    lower.includes('rumah') ||
    lower.includes('kontrakan') ||
    lower.includes('kesehatan') ||
    lower.includes('medis') ||
    lower.includes('obat') ||
    lower.includes('dokter') ||
    lower.includes('rumah sakit') ||
    lower.includes('pendidikan') ||
    lower.includes('sekolah') ||
    lower.includes('kuliah') ||
    lower.includes('buku') ||
    lower.includes('donasi') ||
    lower.includes('sedekah') ||
    lower.includes('zakat') ||
    lower.includes('cicilan') ||
    lower.includes('pajak')
  ) {
    return 'needs';
  }

  // Keinginan (Wants - 30%)
  return 'wants';
}

/**
 * Get comprehensive 50/30/20 summary with real-time tracking
 */
export async function getBudget503020Summary(yearMonth?: string): Promise<Budget503020Summary> {
  const now = new Date();
  const currentYm = yearMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [settings, categories, transactions, budgets] = await Promise.all([
    db.getSettings(),
    db.categories.toArray(),
    db.transactions.toArray(),
    db.budgets.toArray(),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const budgetMap = new Map(budgets.map((b) => [b.categoryId, b.monthlyLimit]));

  // 1. Hitung total pemasukan riil bulan ini
  const monthIncomeTxs = transactions.filter((t) => t.type === 'income' && t.date.startsWith(currentYm));
  const currentMonthIncome = monthIncomeTxs.reduce((sum, t) => sum + t.amount, 0);

  // 2. Acuan pendapatan untuk metode 50/30/20 (gunakan target jika disetel, atau pemasukan aktual, atau default Rp 5.000.000)
  const incomeBase =
    settings.monthlyIncomeTarget && settings.monthlyIncomeTarget > 0
      ? settings.monthlyIncomeTarget
      : currentMonthIncome > 0
      ? currentMonthIncome
      : 5000000;

  const needsTarget = Math.round(incomeBase * 0.5);
  const wantsTarget = Math.round(incomeBase * 0.3);
  const savingsTarget = Math.round(incomeBase * 0.2);

  // 3. Hitung pengeluaran per kategori bulan ini
  const categorySpentMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === 'expense' && t.date.startsWith(currentYm)) {
      categorySpentMap.set(t.categoryId, (categorySpentMap.get(t.categoryId) || 0) + t.amount);
    }
  }

  // 4. Tabungan yang disisihkan bulan ini
  let savingsFromCategories = 0;
  for (const [catId, spent] of categorySpentMap.entries()) {
    const cat = catMap.get(catId);
    if (cat && getCategoryBudgetGroup(cat) === 'savings') {
      savingsFromCategories += spent;
    }
  }

  // Setoran tabungan lewat catatan/transaksi tabungan
  const savingsDeposits = transactions
    .filter(
      (t) =>
        t.date.startsWith(currentYm) &&
        t.notes &&
        (t.notes.includes('Nabung') || t.notes.includes('Setoran tabungan'))
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsSpent = Math.max(savingsFromCategories, savingsDeposits);

  // 5. Kelompokkan kategori ke 50/30/20
  const needsCategories: Array<{ category: Category; budgetLimit: number; spent: number }> = [];
  const wantsCategories: Array<{ category: Category; budgetLimit: number; spent: number }> = [];
  const savingsCategories: Array<{ category: Category; budgetLimit: number; spent: number }> = [];

  let needsSpent = 0;
  let wantsSpent = 0;

  for (const cat of categories) {
    if (cat.type !== 'expense' && cat.budgetGroup !== 'savings') continue;

    const spent = categorySpentMap.get(cat.id) || 0;
    const limit = budgetMap.get(cat.id) || 0;
    const group = getCategoryBudgetGroup(cat);

    const item = { category: cat, budgetLimit: limit, spent };

    if (group === 'needs') {
      needsSpent += spent;
      needsCategories.push(item);
    } else if (group === 'wants') {
      wantsSpent += spent;
      wantsCategories.push(item);
    } else {
      savingsCategories.push(item);
    }
  }

  needsCategories.sort((a, b) => b.spent - a.spent);
  wantsCategories.sort((a, b) => b.spent - a.spent);
  savingsCategories.sort((a, b) => b.spent - a.spent);

  const needsPercentage = needsTarget > 0 ? (needsSpent / needsTarget) * 100 : 0;
  const wantsPercentage = wantsTarget > 0 ? (wantsSpent / wantsTarget) * 100 : 0;
  const savingsPercentage = savingsTarget > 0 ? (savingsSpent / savingsTarget) * 100 : 0;

  const needsRemaining = Math.max(0, needsTarget - needsSpent);
  const wantsRemaining = Math.max(0, wantsTarget - wantsSpent);
  const savingsRemaining = Math.max(0, savingsTarget - savingsSpent);

  return {
    incomeBase,
    needsTarget,
    wantsTarget,
    savingsTarget,
    needsSpent,
    wantsSpent,
    savingsSpent,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    needsRemaining,
    wantsRemaining,
    savingsRemaining,
    needsCategories,
    wantsCategories,
    savingsCategories,
    currentMonthIncome,
    status: {
      needs: needsPercentage > 100 ? 'danger' : needsPercentage >= 80 ? 'warning' : 'safe',
      wants: wantsPercentage > 100 ? 'danger' : wantsPercentage >= 80 ? 'warning' : 'safe',
      savings: savingsPercentage >= 100 ? 'safe' : savingsPercentage >= 50 ? 'warning' : 'danger',
    },
  };
}

/**
 * Terapkan anggaran bulanan otomatis berdasarkan metode 50/30/20
 */
export async function apply503020Budgets(
  monthlyIncome: number,
  customLimits?: Record<string, number>
): Promise<void> {
  await db.updateSettings({ monthlyIncomeTarget: monthlyIncome });

  const categories = await db.categories.toArray();
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const needsCats = expenseCategories.filter((c) => getCategoryBudgetGroup(c) === 'needs');
  const wantsCats = expenseCategories.filter((c) => getCategoryBudgetGroup(c) === 'wants');

  const totalNeeds = Math.round(monthlyIncome * 0.5);
  const totalWants = Math.round(monthlyIncome * 0.3);

  if (customLimits && Object.keys(customLimits).length > 0) {
    for (const [catId, limit] of Object.entries(customLimits)) {
      if (limit > 0) {
        await saveBudget({ categoryId: catId, monthlyLimit: limit });
      }
    }
    return;
  }

  // Rekomendasi pembagian proporsional Kebutuhan (50%)
  const needsWeights: Record<string, number> = {
    'Makan & Minum': 0.35,
    'Tagihan & Utilitas': 0.25,
    'Transportasi': 0.15,
    'Belanja & Kebutuhan': 0.15,
    'Kesehatan & Medis': 0.05,
    'Pendidikan': 0.05,
  };

  const defaultNeedWeight = 1 / Math.max(1, needsCats.length);
  for (const cat of needsCats) {
    const weight = needsWeights[cat.name] || defaultNeedWeight;
    const limit = Math.round(totalNeeds * weight);
    await saveBudget({ categoryId: cat.id, monthlyLimit: limit });
  }

  // Rekomendasi pembagian proporsional Keinginan (30%)
  const wantsWeights: Record<string, number> = {
    'Hiburan & Hobi': 0.6,
    'Pengeluaran Lainnya': 0.4,
  };

  const defaultWantWeight = 1 / Math.max(1, wantsCats.length);
  for (const cat of wantsCats) {
    const weight = wantsWeights[cat.name] || defaultWantWeight;
    const limit = Math.round(totalWants * weight);
    await saveBudget({ categoryId: cat.id, monthlyLimit: limit });
  }
}

// ----------------------------------------------------
// SAVINGS / TABUNGAN / CELENGAN SERVICES
// ----------------------------------------------------

export async function getSavings(includeCompleted = true): Promise<SavingGoal[]> {
  const all = await db.savings.toArray();
  if (includeCompleted) return all;
  return all.filter((s) => !s.isCompleted);
}

export async function getSavingById(id: string): Promise<SavingGoal | undefined> {
  return await db.savings.get(id);
}

export async function saveSavingGoal(data: {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  walletId?: string;
  icon: string;
  color: string;
  notes?: string;
}): Promise<SavingGoal> {
  const now = new Date().toISOString();
  const current = data.currentAmount || 0;
  const isCompleted = current >= data.targetAmount && data.targetAmount > 0;

  if (data.id) {
    const existing = await db.savings.get(data.id);
    if (!existing) throw new Error('Target tabungan tidak ditemukan');
    const updated: SavingGoal = {
      ...existing,
      name: data.name.trim(),
      targetAmount: data.targetAmount,
      currentAmount: current,
      targetDate: data.targetDate || undefined,
      walletId: data.walletId || undefined,
      icon: data.icon,
      color: data.color,
      notes: data.notes?.trim() || '',
      isCompleted,
      updatedAt: now,
    };
    await db.savings.put(updated);
    return updated;
  } else {
    const newGoal: SavingGoal = {
      id: generateId('svg'),
      name: data.name.trim(),
      targetAmount: data.targetAmount,
      currentAmount: current,
      targetDate: data.targetDate || undefined,
      walletId: data.walletId || undefined,
      icon: data.icon,
      color: data.color,
      notes: data.notes?.trim() || '',
      isCompleted,
      createdAt: now,
      updatedAt: now,
    };
    await db.savings.add(newGoal);
    return newGoal;
  }
}

export async function deleteSavingGoal(id: string): Promise<void> {
  await db.savings.delete(id);
}

export async function depositToSavingGoal(
  goalId: string,
  amount: number,
  fromWalletId?: string,
  notes?: string
): Promise<{ success: boolean; goal: SavingGoal }> {
  const goal = await db.savings.get(goalId);
  if (!goal) throw new Error('Target tabungan tidak ditemukan');

  const newCurrent = goal.currentAmount + amount;
  const isCompleted = newCurrent >= goal.targetAmount && goal.targetAmount > 0;
  const now = new Date().toISOString();

  const updated: SavingGoal = {
    ...goal,
    currentAmount: newCurrent,
    isCompleted,
    updatedAt: now,
  };

  await db.savings.put(updated);

  // Sync wallet: record expense/transfer from the source wallet
  if (fromWalletId) {
    const txDate = now.split('T')[0];
    await saveTransaction({
      amount,
      type: 'expense',
      categoryId: 'cat_savings',
      walletId: fromWalletId,
      date: txDate,
      notes: `Setor Tabungan: ${goal.name}${notes ? ` (${notes})` : ''}`,
    });
  }

  return { success: true, goal: updated };
}

export async function withdrawFromSavingGoal(
  goalId: string,
  amount: number,
  toWalletId?: string,
  notes?: string
): Promise<{ success: boolean; goal: SavingGoal }> {
  const goal = await db.savings.get(goalId);
  if (!goal) throw new Error('Target tabungan tidak ditemukan');

  if (amount > goal.currentAmount) {
    throw new Error('Nominal penarikan melebihi saldo tabungan saat ini');
  }

  const newCurrent = Math.max(0, goal.currentAmount - amount);
  const isCompleted = newCurrent >= goal.targetAmount && goal.targetAmount > 0;
  const now = new Date().toISOString();

  const updated: SavingGoal = {
    ...goal,
    currentAmount: newCurrent,
    isCompleted,
    updatedAt: now,
  };

  await db.savings.put(updated);

  // Sync wallet: record income into destination wallet
  if (toWalletId) {
    const txDate = now.split('T')[0];
    await saveTransaction({
      amount,
      type: 'income',
      categoryId: 'cat_savings',
      walletId: toWalletId,
      date: txDate,
      notes: `Tarik Tabungan: ${goal.name}${notes ? ` (${notes})` : ''}`,
    });
  }

  return { success: true, goal: updated };
}

// ----------------------------------------------------
// ANALYTICS & SUMMARY SERVICES
// ----------------------------------------------------

export function calculateFinancialSummary(
  transactions: Transaction[],
  categories: Category[],
  startDate: string,
  endDate: string
): FinancialSummary {
  const filtered = transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  const catMap = new Map(categories.map((c) => [c.id, c]));

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCat = new Map<string, number>();

  for (const t of filtered) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
      expenseByCat.set(t.categoryId, (expenseByCat.get(t.categoryId) || 0) + t.amount);
    }
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  const dailyAverageExpense = Math.round(totalExpense / days);

  let topExpenseCategory: FinancialSummary['topExpenseCategory'] | undefined;
  let maxExpense = 0;
  let topCatId = '';

  expenseByCat.forEach((amount, catId) => {
    if (amount > maxExpense) {
      maxExpense = amount;
      topCatId = catId;
    }
  });

  if (topCatId && totalExpense > 0) {
    const cat = catMap.get(topCatId);
    topExpenseCategory = {
      name: cat ? cat.name : 'Lainnya',
      amount: maxExpense,
      percentage: Math.round((maxExpense / totalExpense) * 100),
      color: cat ? cat.color : '#64748b',
    };
  }

  return {
    totalIncome,
    totalExpense,
    netSavings: totalIncome - totalExpense,
    dailyAverageExpense,
    topExpenseCategory,
    transactionCount: filtered.length,
  };
}

export function calculateCategoryExpensesBreakdown(
  transactions: Transaction[],
  categories: Category[],
  startDate: string,
  endDate: string
) {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const filtered = transactions.filter((t) => t.type === 'expense' && t.date >= startDate && t.date <= endDate);

  const breakdown = new Map<string, { name: string; color: string; amount: number }>();
  let total = 0;

  for (const t of filtered) {
    total += t.amount;
    const cat = catMap.get(t.categoryId);
    const catName = cat ? cat.name : 'Lainnya';
    const catColor = cat ? cat.color : '#94a3b8';

    const existing = breakdown.get(t.categoryId) || { name: catName, color: catColor, amount: 0 };
    existing.amount += t.amount;
    breakdown.set(t.categoryId, existing);
  }

  const items = Array.from(breakdown.values()).map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0,
  }));

  return {
    total,
    items: items.sort((a, b) => b.amount - a.amount),
  };
}

export function calculateMonthlyIncomeExpenseTrend(
  transactions: Transaction[],
  monthsCount = 6
) {
  const now = new Date();
  const months: string[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(ym);
  }

  return months.map((ym) => {
    const [year, month] = ym.split('-');
    const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(
      new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
    );

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (t.date.startsWith(ym)) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
      }
    }

    return {
      monthKey: ym,
      label,
      income,
      expense,
      net: income - expense,
    };
  });
}

export async function getFinancialSummary(startDate: string, endDate: string): Promise<FinancialSummary> {
  const [transactions, categories] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
  ]);
  return calculateFinancialSummary(transactions, categories, startDate, endDate);
}

export async function getCategoryExpensesBreakdown(startDate: string, endDate: string) {
  const [transactions, categories] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
  ]);
  return calculateCategoryExpensesBreakdown(transactions, categories, startDate, endDate);
}

export async function getMonthlyIncomeExpenseTrend(monthsCount = 6) {
  const transactions = await db.transactions.toArray();
  return calculateMonthlyIncomeExpenseTrend(transactions, monthsCount);
}

// ----------------------------------------------------
// BACKUP & RESTORE SERVICES
// ----------------------------------------------------

export async function exportAllData(): Promise<BackupData> {
  const [wallets, categories, transactions, budgets, savings, settingsRecord] = await Promise.all([
    db.wallets.toArray(),
    db.categories.toArray(),
    db.transactions.toArray(),
    db.budgets.toArray(),
    db.savings.toArray(),
    db.settings.get('app_settings'),
  ]);

  const appSettings = settingsRecord ? settingsRecord.value : undefined;

  return {
    version: 2,
    appName: 'DompetKu',
    exportDate: new Date().toISOString(),
    wallets,
    categories,
    transactions,
    budgets,
    savings,
    settings: appSettings,
  };
}

export async function restoreAllData(
  data: BackupData,
  mode: 'overwrite' | 'merge'
): Promise<{ added: number; updated: number }> {
  if (!data || data.appName !== 'DompetKu' || !Array.isArray(data.transactions) || !Array.isArray(data.wallets)) {
    throw new Error('Format file backup tidak valid. Pastikan file berasal dari ekspor DompetKu.');
  }

  let added = 0;
  let updated = 0;

  if (mode === 'overwrite') {
    await db.transaction('rw', [db.wallets, db.categories, db.transactions, db.budgets, db.savings], async () => {
      await db.wallets.clear();
      await db.categories.clear();
      await db.transactions.clear();
      await db.budgets.clear();
      await db.savings.clear();

      await db.wallets.bulkAdd(data.wallets);
      await db.categories.bulkAdd(data.categories);
      await db.transactions.bulkAdd(data.transactions);
      if (data.budgets && data.budgets.length > 0) {
        await db.budgets.bulkAdd(data.budgets);
      }
      if (data.savings && data.savings.length > 0) {
        await db.savings.bulkAdd(data.savings);
      }
    });

    added =
      data.wallets.length +
      data.categories.length +
      data.transactions.length +
      (data.budgets?.length || 0) +
      (data.savings?.length || 0);
  } else {
    // Merge mode: Add missing records or update existing
    await db.transaction('rw', [db.wallets, db.categories, db.transactions, db.budgets, db.savings], async () => {
      // Merge Wallets
      for (const w of data.wallets) {
        const exist = await db.wallets.get(w.id);
        if (exist) {
          await db.wallets.put(w);
          updated++;
        } else {
          await db.wallets.add(w);
          added++;
        }
      }

      // Merge Categories
      for (const c of data.categories) {
        const exist = await db.categories.get(c.id);
        if (exist) {
          await db.categories.put(c);
          updated++;
        } else {
          await db.categories.add(c);
          added++;
        }
      }

      // Merge Transactions
      for (const t of data.transactions) {
        const exist = await db.transactions.get(t.id);
        if (exist) {
          await db.transactions.put(t);
          updated++;
        } else {
          await db.transactions.add(t);
          added++;
        }
      }

      // Merge Budgets
      if (data.budgets) {
        for (const b of data.budgets) {
          const exist = await db.budgets.get(b.id);
          if (exist) {
            await db.budgets.put(b);
            updated++;
          } else {
            await db.budgets.add(b);
            added++;
          }
        }
      }

      // Merge Savings
      if (data.savings) {
        for (const s of data.savings) {
          const exist = await db.savings.get(s.id);
          if (exist) {
            await db.savings.put(s);
            updated++;
          } else {
            await db.savings.add(s);
            added++;
          }
        }
      }
    });
  }

  // Update last backup restored date
  const currentSettings = await db.getSettings();
  await db.updateSettings({
    ...currentSettings,
    lastBackupDate: new Date().toISOString(),
  });

  return { added, updated };
}

export async function resetAllData(): Promise<void> {
  await db.transaction('rw', [db.wallets, db.categories, db.transactions, db.budgets, db.savings, db.settings], async () => {
    await db.wallets.clear();
    await db.categories.clear();
    await db.transactions.clear();
    await db.budgets.clear();
    await db.savings.clear();
    await db.settings.clear();
  });
  await db.seedInitialData();
}
