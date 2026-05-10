export interface OrderSessionGuestTier {
  priceTierId: number;
  tierName: string;
  guestCount: number;
}

export interface OrderSessionSummary {
  id: string;
  status: number;
  statusLabel: string;
  orderType: number;
  orderTypeLabel: string;
  tableId: number | null;
  tableName: string | null;
  tableIsKioskMode: boolean;
  totalGuestCount: number;
  guestTiers: OrderSessionGuestTier[];
  checkCount: number;
  ayceMenuId: number | null;
  isAgeVerified: boolean;
  ageVerifiedGuestCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface OrderTicketBrief {
  id: string;
  dailyOrderNo: number | null;
  orderChannel: number;
  orderChannelLabel: string;
  isRead: boolean;
  createdAt: string;
  confirmedAt: string | null;
}

export interface CheckBrief {
  id: string;
  parentId: string | null;
  status: number;
  statusLabel: string;
  subtotal: number;
  taxAmount: number;
  serviceChargeAmount: number;
  gratuityAmount: number;
  serviceFeeAmount: number;
  tipAmount: number;
  totalAmount: number;
  createdAt: string;
  closedAt: string | null;
}

export interface OrderSessionDetail extends OrderSessionSummary {
  orderId: string | null;
  orderTickets: OrderTicketBrief[];
  checks: CheckBrief[];
}

export interface OrderSessionsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  orderSessions: OrderSessionSummary[];
}
