import React, { useState, useEffect } from 'react';
import { checkAdminSession } from './api';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('dompetku_admin_theme') === 'dark' ||
      (!('dompetku_admin_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('dompetku_admin_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('dompetku_admin_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    async function verifyAuth() {
      const ok = await checkAdminSession();
      setIsAuthenticated(ok);
    }
    verifyAuth();
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 text-xs font-semibold">
        Memeriksa sesi administrator...
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <Dashboard
          onLogout={() => setIsAuthenticated(false)}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} isDark={isDark} />
      )}
    </>
  );
};

export default App;

