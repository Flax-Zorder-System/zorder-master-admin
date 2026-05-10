// ── Check Detail ──────────────────────────────────────────────

export interface CheckModifier {
  id: string;
  parentId: string;
  modifierGroupName: string;
  modifierName: string;
  modifierPrice: number;
  modifierPriceDollar: string;
  quantity: number;
  subtotalAmount: number;
  subtotalAmountDollar: string;
  lineSubtotalAmount: number;
  lineSubtotalAmountDollar: string;
  inheritedSubtotalAmount: number;
  inheritedSubtotalAmountDollar: string;
  children: CheckModifier[];
}

export interface CheckItem {
  id: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  itemPriceDollar: string;
  quantity: number;
  subtotalAmount: number;
  subtotalAmountDollar: string;
  taxAmount: number;
  taxAmountDollar: string;
  lineSubtotalAmount: number;
  lineSubtotalAmountDollar: string;
  inheritedSubtotalAmount: number;
  inheritedSubtotalAmountDollar: string;
  modifiers: CheckModifier[];
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CheckTax {
  id: string;
  name: string;
  totalAmount: number;
  totalAmountDollar: string;
}

export interface CheckServiceCharge {
  id: string;
  name: string;
  isGratuity: boolean;
  taxAmount: number;
  taxAmountDollar: string;
  totalAmount: number;
  totalAmountDollar: string;
}

export interface CheckServiceFee {
  id: string;
  name: string;
  appliedAmount: number;
  appliedAmountDollar: string;
}

export interface CheckPayment {
  id: string;
  method: string;
  status: string;
  amount: number;
  amountDollar: string;
  tax: number;
  taxDollar: string;
  tip: number;
  tipDollar: string;
  paidAt: string | null;
  voidedAt: string | null;
  refundedAt: string | null;
}

export interface CheckTable {
  tableId: number;
  tableName: string;
  isKioskMode: boolean;
}

export interface CheckContact {
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface CheckDetail {
  id: string;
  parentId: string | null;
  status: 'OPEN' | 'PAID' | 'CLOSED';
  orderType: string;
  paidAmount: number;
  paidAmountDollar: string;
  balanceAmount: number;
  balanceAmountDollar: string;
  amount: number;
  amountDollar: string;
  subtotal: number;
  subtotalDollar: string;
  tipAmount: number;
  tipAmountDollar: string;
  taxAmount: number;
  taxAmountDollar: string;
  serviceChargeAmount: number;
  serviceChargeAmountDollar: string;
  gratuityAmount: number;
  gratuityAmountDollar: string;
  serviceFeeAmount: number;
  serviceFeeAmountDollar: string;
  totalAmount: number;
  totalAmountDollar: string;
  checkItems: CheckItem[];
  payments: CheckPayment[];
  taxes: CheckTax[];
  serviceCharges: CheckServiceCharge[];
  serviceFees: CheckServiceFee[];
  contact: CheckContact | null;
  table: CheckTable | null;
  createAt: string;
  closedAt: string | null;
}

export interface CheckDetailResponse {
  check: CheckDetail;
}

export interface CheckBalanceChildCheck {
  id: string;
  status: string;
}

export interface CheckBalance {
  checkId: string;
  status: string;
  isComplete: boolean;
  detail: string;
  inflightAmountDollar: string;
  childChecks: CheckBalanceChildCheck[];
  splits: { index: number; amountDollar: string }[];
}

// ── Check List ────────────────────────────────────────────────

export interface MasterCheckSummary {
  id: string;
  parentId: string | null;
  status: 'OPEN' | 'PAID' | 'CLOSED';
  orderId: string;
  tableName: string | null;
  subtotal: number;
  subtotalDollar: string;
  taxAmount: number;
  taxAmountDollar: string;
  serviceChargeAmount: number;
  serviceChargeAmountDollar: string;
  gratuityAmount: number;
  gratuityAmountDollar: string;
  serviceFeeAmount: number;
  serviceFeeAmountDollar: string;
  tipAmount: number;
  tipAmountDollar: string;
  totalAmount: number;
  totalAmountDollar: string;
  createdAt: string;
  closedAt: string | null;
}

export interface ChildChecksResponse {
  checks: MasterCheckSummary[];
}

export interface MasterChecksResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  checks: MasterCheckSummary[];
}
