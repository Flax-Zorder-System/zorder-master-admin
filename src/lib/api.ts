import type { StoreAdminDetail, StoreAdminListItem } from '../types/api';
import type { AuditLog } from '../types/auditLog';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface ZOrderResponse<T> {
  result: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    sessionStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const body = (await res.json()) as ZOrderResponse<T>;

  if (!res.ok) {
    throw new Error(body.message ?? `${res.status} ${res.statusText}`);
  }

  return body.data;
}

export interface MasterLoginResponse {
  id: number;
  userid: string;
  userName: string;
  email: string;
  roles: string[];
}

export const api = {
  login: (userid: string, password: string) =>
    request<MasterLoginResponse>('/v4/auth/login/masters', {
      method: 'POST',
      body: JSON.stringify({ userid, password }),
    }),

  logout: () => request<void>('/v4/auth/logout', { method: 'POST' }),

  getStoreAdmins: () => request<StoreAdminListItem[]>('/v4/users/store-admins'),

  getStoreAdminById: (id: number) =>
    request<StoreAdminDetail>(`/v4/users/store-admins/${id}`),

  getAuditLogs: (storeId: number, params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    const qs = query.toString();
    return request<AuditLog[]>(`/v4/settings/stores/${storeId}/audit-logs${qs ? `?${qs}` : ''}`);
  },
};
