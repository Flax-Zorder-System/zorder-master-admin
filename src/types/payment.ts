export interface TransactionDetail {
  id: string;
  type: string;
  status: string;
  pgProvider: string | null;
  amount: number | null;
  tipAmount: number | null;
  taxAmount: number | null;
  currency: string | null;
  authCode: string | null;
  message: string | null;
  pgTransactionRef: string | null;
  pgOrderRef: string | null;
  cardMaskedAccount: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  cardType: string | null;
  cardEntryMode: string | null;
  cardRef: string | null;
  originalTransactionId: string | null;
  signatureUrl: string | null;
  transactedAt: string | null;
  createdAt: string;
  rawResBody: string | null;
}

export interface PaymentDetail {
  id: string;
  checkId: number;
  storeId: number;
  status: string;
  method: string;
  amount: number;
  tipAmount: number | null;
  taxAmount: number | null;
  currency: string;
  paidOrderItems: number[] | null;
  transactionId: string | null;
  originalPaymentId: string | null;
  reason: string | null;
  detail: string | null;
  createdAt: string;
  paidAt: string | null;
  voidedAt: string | null;
  refundedAt: string | null;
  transaction: TransactionDetail | null;
}
