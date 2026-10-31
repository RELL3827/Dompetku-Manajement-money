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
import { CalculatorModal } from './components/calculator/CalculatorModal';
import { UpdatePromptModal } from './components/common/UpdatePromptModal';
import { UpdateToastBanner } from './components/common/UpdateToastBanner';

// Pages
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SavingsPage } from './pages/SavingsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { WalletsPage } from './pages/WalletsPage';
import { NotesPage } from './pages/NotesPage';
import { CalculatorPage } from './pages/CalculatorPage';
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
  const [defaultTxAmount, setDefaultTxAmount] = useState<number>(0);
  const [defaultTxNotes, setDefaultTxNotes] = useState<string>('');

  // Global Quick Calculator Modal State
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

  // Check onboarding status
  const settingsRecord = useLiveQuery(() => db.settings.get('app_settings'));
  const hasCompletedOnboarding = settingsRecord?.value?.hasCompletedOnboarding ?? true;

  const handleOpenAddTransaction = (
    type: TransactionType = 'expense',
    amount?: number,
    notes?: string
  ) => {
    setTxToEdit(null);
    setDefaultTxType(type);
    setDefaultTxAmount(amount || 0);
    setDefaultTxNotes(notes || '');
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx);
    setDefaultTxType(tx.type);
    setDefaultTxAmount(tx.amount);
    setDefaultTxNotes(tx.notes || '');
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
        <Header
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenCalculator={() => setIsCalculatorModalOpen(true)}
        />

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

          {currentTab === 'notes' && (
            <NotesPage onOpenTransactionModal={handleOpenAddTransaction} />
          )}

          {currentTab === 'calculator' && (
            <CalculatorPage
              onOpenTransactionModal={handleOpenAddTransaction}
              onNavigate={setCurrentTab}
            />
          )}

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
        defaultAmount={defaultTxAmount}
        defaultNotes={defaultTxNotes}
        onSaved={() => {
          // LiveQueries reactively refresh all views
        }}
      />

      {/* Global Quick Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        onUseAmount={(amt, notes) => handleOpenAddTransaction('expense', amt, notes)}
        onNavigateToBudgets={() => setCurrentTab('budgets')}
      />

      {/* Global PWA Update Notification Modal & Toast Banner */}
      <UpdatePromptModal />
      <UpdateToastBanner />
    </div>
  );
};

export default App;
