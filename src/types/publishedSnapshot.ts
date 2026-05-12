export interface SnapshotMetadata {
  version: string;
  storeId: number;
  updatedAt: string;
}

export interface TaxSnapshotEntry {
  id: string;
  name: string;
  type: string;
  rate: number | null;
  fixedAmount: number | null;
  isDefault: boolean;
  rateRoundingOption: string | null;
  enableTakeoutRate: boolean;
  takeoutRate: number | null;
}

export interface TaxSnapshot {
  publishedAt: string;
  taxes: TaxSnapshotEntry[];
  customTaxesByItem: Record<string, string[]>;
}

export interface ServiceChargeSnapshotTaxEntry {
  serviceChargeTaxId: string;
  taxId: string;
  name: string;
  type: string;
  rate: number | null;
  fixedAmount: number | null;
  rateRoundingOption: string | null;
  enableTakeoutRate: boolean;
  takeoutRate: number | null;
}

export interface ServiceChargeSnapshotEntry {
  id: string;
  name: string;
  chargeType: string;
  rate: number | null;
  fixedAmount: number | null;
  chargeCalculationType: string | null;
  isGratuity: boolean;
  minCheckAmount: number | null;
  isTaxable: boolean;
  isDelivery: boolean;
  isTakeout: boolean;
  isDineIn: boolean;
  taxes: ServiceChargeSnapshotTaxEntry[];
}

export interface ServiceChargeSnapshot {
  publishedAt: string;
  serviceCharges: ServiceChargeSnapshotEntry[];
}

export interface ServiceFeeSnapshotEntry {
  id: string;
  name: string;
  chargeType: string;
  chargeCalculationType: string;
  rate: number | null;
  fixedAmount: number | null;
  isDelivery: boolean;
  isTakeout: boolean;
  isDineIn: boolean;
}

export interface ServiceFeeSnapshot {
  publishedAt: string;
  serviceFees: ServiceFeeSnapshotEntry[];
}

export interface PublishedSnapshotResponse {
  metadata: SnapshotMetadata | null;
  tax: TaxSnapshot | null;
  serviceCharge: ServiceChargeSnapshot | null;
  serviceFee: ServiceFeeSnapshot | null;
}
