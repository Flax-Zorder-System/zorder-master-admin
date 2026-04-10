export type StoreStatus = 'active' | 'inactive';
export type PosType = 'Toast' | 'Square' | 'Other';
export type StoreType = 'test store' | 'store';

export interface PosConfig {
  type: PosType;
  guid: string;
  status: StoreStatus;
}

export interface FeatureFlags {
  ageVerification: boolean;
  isAyce: boolean;
  lowBrandedMenu: boolean;
  payment: boolean;
  // deprecated
  isMenuboss?: boolean;
  allowEmployee?: boolean;
  zurypty?: boolean;
}

export interface CsInfo {
  tableCount: number;
  userAppVersions: string[];
  opsAppVersions: string[];
  launcherAppVersions: string[];
}

export interface Store {
  id: number;
  name: string;
  userid: string;
  manager: string;
  type: StoreType;
  ayce: boolean;
  status: StoreStatus;
  pos: PosType;
  timezone: string;
  createdDate: string;
  updatedDate: string;
  memo?: string;
  posConfig: PosConfig;
  featureFlags: FeatureFlags;
  csInfo: CsInfo;
}
