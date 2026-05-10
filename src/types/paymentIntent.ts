export type PaymentIntentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';

export interface PaymentIntentSummary {
  id: string;
  orderSessionId: string;
  orderTicketId: string | null;
  storeId: number;
  tableId: number;
  buildNum: string;
  status: PaymentIntentStatus;
  reason: string | null;
  detail: string | null;
  expiresAt: string;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntentsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  paymentIntents: PaymentIntentSummary[];
}
