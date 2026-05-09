/** GET /api/v4/users/store-admins */
export interface StoreAdminListItem {
  id: number; // users.id (store admin user id) — used as route param
  userid: string;
  userName: string;
  email: string;
  storeId: number;
  storeName: string;
  startAt: string;
  expireAt: string;
  isActive: boolean;
  isAyce: boolean;
  dealerId: number;
  timezone: string;
  posId: number | null;
  posName: string | null;
}

/** GET /api/v4/users/store-admins/:id */
export interface StoreAdminDetail {
  id: number; // users.id (store admin user id)
  userid: string;
  userName: string;
  email: string;
  storeId: number;
  storeName: string;
  timezone: string;
  timezoneOffset: string;
  startAt: string;
  expireAt: string;
  isActive: boolean;
  isAyce: boolean;
  isMenubook: boolean;
  printerCount: number;
  useAgeVerification: boolean;
  useEmployee: boolean;
  useBrandedMenu: boolean;
  viewMode: boolean;
  zloyaltyId: number | null;
  zloyaltyStatus: string | null;
  zloyaltyUseDisplay: boolean | null;
  posId: number | null;
  posName: string | null;
  managerPin: string | null;
}
