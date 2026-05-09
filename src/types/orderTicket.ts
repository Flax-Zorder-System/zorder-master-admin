export interface OrderTicket {
  orderSessionId: string;
  orderId: string;
  orderTicketId: string;
  tableId: number;
  tableName: string;
  tablePaymentType: string | null;
  dailyOrderNo: string;
  isRead: boolean;
  totalQuantity: number;
  totalAmount: number;
  totalGuestCount: number;
  totalItemQuantity: number;
  firstItemQty: number;
  firstItemId: number;
  firstItemName: string;
  createdAt: string;
  confirmedAt: string | null;
  orderChannelId: number;
  orderChannelName: string;
  prepStatus: '' | 'On hold' | 'Fired';
  posStatus: 'Pending' | 'In POS';
  paymentStatus: 'Open' | 'Paid' | 'Closed' | 'Voided' | 'Refunded' | 'Partially paid' | 'Partially refunded';
  receiptRequested: boolean;
}

export interface OrderTicketsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  orderTickets: OrderTicket[];
}

export interface OrderModifierDetail {
  id: string | null;
  parentId: string | null;
  modifierGroupId: number | null;
  modifierGroupName: string;
  modifierId: number | null;
  modifierName: string;
  quantity: number;
  modifierPrice: number;
  lineSubtotalAmount: number;
  inheritedSubtotalAmount: number;
  orderModifiers: OrderModifierDetail[];
}

export interface OrderItemDetail {
  id: string;
  itemId: number | null;
  itemName: string;
  quantity: number;
  itemPrice: number;
  subtotalAmount: number;
  lineSubtotalAmount: number;
  inheritedSubtotalAmount: number;
  specialRequest: string;
  printerLabelIds: number[];
  orderModifiers: OrderModifierDetail[];
  createdAt: string;
}

export type CheckOtherKind = 'tax' | 'fee' | 'serviceCharge';

export interface CheckOther {
  kind: CheckOtherKind;
  id: string;
  name: string;
  amountDollar: string;
  isGratuity?: boolean;
}

export interface OrderTicketDetail {
  orderTicketId: string;
  tableId: number;
  tableName: string;
  tablePaymentType: string | null;
  dailyOrderNo: string;
  orderChannel: number;
  orderChannelId: number;
  orderChannelName: string;
  totalQuantity: number;
  totalAmount: number;
  totalGuest: number;
  customerName: string | null;
  createdAt: string;
  confirmedAt: string | null;
  printedAt: string | null;
  completedAt: string | null;
  prepStatus: '' | 'On hold' | 'Fired';
  posStatus: 'Pending' | 'In POS';
  paymentStatus: 'Open' | 'Paid' | 'Closed' | 'Voided' | 'Refunded' | 'Partially paid' | 'Partially refunded';
  refundable: boolean;
  checkId: string | null;
  checkSubtotalDollar: string | null;
  checkTipAmountDollar: string | null;
  checkTotalAmountDollar: string | null;
  checkOthersAmountDollar: string | null;
  receiptRequested: boolean;
  checkOthers: CheckOther[];
  orderItems: OrderItemDetail[];
}
