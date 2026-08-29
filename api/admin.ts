import { apiFetch } from './client';
import { AdminKPIs, AdminIssuesResponse } from './types';

export async function getAdminDashboardMetrics(): Promise<AdminKPIs> {
  return apiFetch<AdminKPIs>('/admin/metrics', {
    headers: {
      'x-user-role': 'ADMIN',
    },
  });
}

export async function getAdminIssuesReport(): Promise<AdminIssuesResponse> {
  return apiFetch<AdminIssuesResponse>('/admin/issues', {
    headers: {
      'x-user-role': 'ADMIN',
    },
  });
}
