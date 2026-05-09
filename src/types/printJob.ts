export type PrintJobStatus = 'PENDING' | 'ENQUEUED' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
export type PrintJobSourceType = 'ORDER_TICKET' | 'ORDER' | 'PAYMENT' | 'RECEIPT';

export interface PrintJobSummary {
  id: number;
  sourceId: number;
  sourceType: number;
  sourceTypeLabel: PrintJobSourceType;
  status: number;
  statusLabel: PrintJobStatus;
  retryCount: number;
  message: string | null;
  printerId: number;
  printerMacAddress: string | null;
  deviceId: number | null;
  createdAt: string;
  enqueuedAt: string | null;
  printingStartedAt: string | null;
  printImageBase64Url: string;
  completedAt: string | null;
  failedAt: string | null;
  expiredAt: string | null;
}

export interface PrintJobsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  jobs: PrintJobSummary[];
}
