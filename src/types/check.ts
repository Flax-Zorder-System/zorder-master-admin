// ── Check Detail ──────────────────────────────────────────────

export interface CheckServiceChargeTaxEntry {
  serviceChargeTaxId: string;
  taxId: string | null;
  posTaxId: string | null;
  name: string;
  type: string;             // TaxTypeEnum: 'PERCENT' | 'FIXED'
  rate: number | null;      // 소수 (e.g. 0.0825). PERCENT 전용
  fixedAmount: number | null; // cents. FIXED 전용
  rateRoundingOption: string | null; // e.g. 'ROUND_HALF_UP'
  enableTakeoutRate: boolean;
  takeoutRate: number;      // 소수
  taxAmount: number;        // cents
}

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
  name: string;                        // 주문 시점 스냅샷 이름 (top-level)
  chargeType: string;                  // ServiceChargeTypeEnum: 'PERCENT' | 'FIXED_AMOUNT' | ...
  chargeCalculationType: string | null; // ServiceChargeCalculationTypeEnum
  rate: number;                        // 소수 (e.g. 0.18). PERCENT 전용
  fixedAmount: number | null;          // cents. FIXED_AMOUNT 전용
  minCheckAmount: number | null;       // cents. 최소 적용 금액
  isGratuity: boolean;
  appliedAmount: number;               // SC 금액 (cents, 세금 미포함)
  totalAmountDollar: string;           // toDollar(appliedAmount)
  taxAmount: number;
  taxAmountDollar: string;
  taxes: CheckServiceChargeTaxEntry[];
}

export interface CheckServiceFee {
  id: string;
  name: string;                        // 주문 시점 스냅샷 이름
  chargeType: string;                  // ServiceChargeTypeEnum
  chargeCalculationType: string | null; // ServiceChargeCalculationTypeEnum
  rate: number | null;                 // 소수. PERCENT 전용
  fixedAmount: number | null;          // cents. FIXED_AMOUNT 전용
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

  // 금액 합계
  subtotalAmount: number;
  subtotalAmountDollar: string;
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
  tipCalculationAmountDollar: string;  // Tip % 계산 기준 금액 (dollar)
  totalAmount: number;
  totalAmountDollar: string;

  // 결제 내역 합산
  paidAmount: number;
  paidAmountDollar: string;
  saleAmount: number;
  saleAmountDollar: string;
  voidAmount: number;
  voidAmountDollar: string;
  refundAmount: number;
  returnAmountDollar: string;          // API 필드명: returnAmountDollar
  balanceAmount: number;
  balanceAmountDollar: string;

  // deprecated — 하위 호환
  /** @deprecated use subtotalAmount */
  subtotal: number;
  /** @deprecated use subtotalAmountDollar */
  subtotalDollar: string;

  checkItems: CheckItem[];
  payments: CheckPayment[];
  taxes: CheckTax[];
  serviceCharges: CheckServiceCharge[];
  serviceFees: CheckServiceFee[];
  contact: CheckContact | null;
  table: CheckTable | null;
  createAt: string;
  closedAt: string | null;
  deletedAt: string | null;
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
  deletedAt: string | null;
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
