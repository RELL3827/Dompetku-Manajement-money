import type { DashboardStats } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function loginAdmin(password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Login gagal.' };
    }
    return { success: true };
  } catch {
    return { success: false, message: 'Tidak dapat terhubung ke server backend.' };
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // ignore
  }
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchDashboardStats(period: string = '30d'): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/api/admin/stats?period=${period}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat data statistik (${res.status})`);
  }

  return res.json();
}

export function downloadAggregateCsv(): void {
  window.open(`${API_BASE}/api/admin/export-csv`, '_blank');
}

