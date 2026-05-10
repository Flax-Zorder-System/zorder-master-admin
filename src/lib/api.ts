import type {
  PosStoreIntegration,
  StoreAdminDetail,
  StoreAdminListItem,
  StoreCustomizeTerms,
  StorePaymentConfig,
} from '../types/api';
import type { AuditLog } from '../types/auditLog';
import type { CheckBalance, CheckDetailResponse, ChildChecksResponse, MasterChecksResponse } from '../types/check';
import type { OrderTicketDetail, OrderTicketsResponse } from '../types/orderTicket';
import type { PrintJobsResponse } from '../types/printJob';
import type { OrderSessionDetail, OrderSessionsResponse } from '../types/orderSession';

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
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const body = (await res.json()) as ZOrderResponse<T>;

  if (!res.ok) {
    throw new Error(body.message ?? `${res.status} ${res.statusText}`);
  }

  return body.data;
}

/** ZOrderResponse 래퍼 없이 raw JSON을 그대로 반환 (POS 컨트롤러 등) */
async function requestRaw<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const body = (await res.json()) as T;

  if (!res.ok) {
    const msg = (body as { message?: string }).message;
    throw new Error(msg ?? `${res.status} ${res.statusText}`);
  }

  return body;
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

  getCustomizeDesignTerms: (storeId: number) =>
    request<StoreCustomizeTerms>(`/v4/settings/stores/${storeId}/customize-design/terms`),

  getPosStoreIntegration: (storeId: number) =>
    requestRaw<PosStoreIntegration>(`/pos/store-integrations/${storeId}`),

  getStorePaymentConfig: (storeId: number) =>
    request<StorePaymentConfig>(`/v4/settings/stores/${storeId}/payment-config`),

  getOrderTickets: (
    storeId: number,
    params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page != null) query.set('page', String(params.page));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return request<OrderTicketsResponse>(`/v4/master/orders/stores/${storeId}/tickets${qs ? `?${qs}` : ''}`);
  },

  getOrderTicketDetail: (storeId: number, orderTicketId: string) =>
    request<OrderTicketDetail>(`/v4/master/orders/stores/${storeId}/tickets/${orderTicketId}`),

  getChecks: (
    storeId: number,
    params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page != null) query.set('page', String(params.page));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return request<MasterChecksResponse>(`/v4/master/checks/stores/${storeId}/checks${qs ? `?${qs}` : ''}`);
  },

  getCheckDetail: (checkId: string) =>
    request<CheckDetailResponse>(`/v4/checks/${checkId}`),

  getCheckBalance: (checkId: string) =>
    request<CheckBalance>(`/v4/checks/${checkId}/balance`),

  getChildChecks: (storeId: number, checkId: string) =>
    request<ChildChecksResponse>(`/v4/master/checks/stores/${storeId}/checks/${checkId}/splits`),

  getOrderSessions: (
    storeId: number,
    params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page != null) query.set('page', String(params.page));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return request<OrderSessionsResponse>(`/v4/master/orders/stores/${storeId}/order-sessions${qs ? `?${qs}` : ''}`);
  },

  getOrderSessionDetail: (storeId: number, orderSessionId: string) =>
    request<OrderSessionDetail>(`/v4/master/orders/stores/${storeId}/order-sessions/${orderSessionId}`),

  getPrintJobs: (
    storeId: number,
    params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page != null) query.set('page', String(params.page));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return request<PrintJobsResponse>(`/v4/master/prints/stores/${storeId}/jobs${qs ? `?${qs}` : ''}`);
  },
};
