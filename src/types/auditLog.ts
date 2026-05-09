export interface AuditLog {
  id: number;
  action: string;
  storeId: number;
  posId: number | null;
  userId: number | null;
  triggeredBy: string;
  ipAddress: string | null;
  status: 'SUCCESS' | 'FAILED' | string;
  message: string | null;
  durationMs: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string; // ISO 8601
}
