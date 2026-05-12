export interface TransactionSummary {
  numberOfPayments: number;
  paymentsTotal: number;
  tipTotal: number;
}

export interface TransactionListItem {
  transactionId: string;
  transactedAt: string | null;
  checkId: number;
  invoiceNo: string | null;
  transactionType: string;
  channel: string | null;
  total: number;
  orderedItems: string | null;
  employeeName: string | null;
  tender: string;
  cardLast4: string | null;
  pgProvider: string | null;
}

export interface TransactionListResponse {
  summary: TransactionSummary;
  nextCursor: number | null;
  isLastPage: boolean;
  transactions: TransactionListItem[];
}

export interface TransactionDetail {
  transactionId: string;
  checkId: number;
  tableName: string | null;
  guestCount: number;
  transactionType: string;
  transactionStatus: string;
  paidAt: string | null;
  invoiceNo: string | null;
  paymentId: string;
  tender: string;
  cardBrand: string | null;
  cardType: string | null;
  cardLast4: string | null;
  employeeName: string | null;
  pgProvider: string | null;
  authCode: string | null;
  total: number;
  subtotal: number;
  tax: number;
  tip: number;
  totalQuantity: number;
  signatureUrl: string | null;
}
