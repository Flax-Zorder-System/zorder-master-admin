export interface AuditLog {
  id: string;
  action: string;
  storeId: string;
  posId: string | null;
  userId: string | null;
  triggeredBy: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | string;
  message: string | null;
  durationMs: number;
  metadata: Record<string, unknown>;
  createdAt: string; // ISO 8601
}

export interface AuditLogPage {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}
