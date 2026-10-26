import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/database';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { FloatingActionButton } from './components/layout/FloatingActionButton';
import { PinLockScreen } from './components/security/PinLockScreen';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { TransactionFormModal } from './components/transaction/TransactionFormModal';

// Pages
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SavingsPage } from './pages/SavingsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { WalletsPage } from './pages/WalletsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

import { useTheme } from './hooks/useTheme';
import type { NavTab, Transaction, TransactionType } from './types';

export const App: React.FC = () => {
  // Initialize theme
  useTheme();

  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  // Check onboarding status
  const settingsRecord = useLiveQuery(() => db.settings.get('app_settings'));
  const hasCompletedOnboarding = settingsRecord?.value?.hasCompletedOnboarding ?? true;

  const handleOpenAddTransaction = (type: TransactionType = 'expense') => {
    setTxToEdit(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx);
    setDefaultTxType(tx.type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* PIN Lock Screen Overlay if locked */}
      <PinLockScreen />

      {/* First-time Onboarding Wizard if not yet completed */}
      {!hasCompletedOnboarding && (
        <OnboardingWizard onComplete={() => setCurrentTab('home')} />
      )}

      {/* Desktop Sidebar Navigation */}
      <DesktopSidebar
        activeTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenAddModal={() => handleOpenAddTransaction('expense')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header onOpenSettings={() => setCurrentTab('settings')} />

        {/* Page Container */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:py-6">
          {currentTab === 'home' && (
            <HomePage
              onNavigate={setCurrentTab}
              onOpenTransactionModal={handleOpenAddTransaction}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage
              onOpenAddModal={() => handleOpenAddTransaction('expense')}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'savings' && <SavingsPage />}

          {currentTab === 'budgets' && <BudgetsPage onNavigate={setCurrentTab} />}

          {currentTab === 'wallets' && (
            <WalletsPage onOpenTransactionModal={handleOpenAddTransaction} />
          )}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>

        {/* Mobile Floating Action Button */}
        <FloatingActionButton onClick={() => handleOpenAddTransaction('expense')} />

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={currentTab} onChangeTab={setCurrentTab} />
      </div>

      {/* Global Transaction Modal */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transactionToEdit={txToEdit}
        defaultType={defaultTxType}
        onSaved={() => {
          // LiveQueries reactively refresh all views
        }}
      />
    </div>
  );
};

export default App;
