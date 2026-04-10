import type { Store } from '../types/store';

export const mockStores: Store[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: 'zorder toast test store',
  userid: 'zztoast',
  manager: 'jasmin',
  type: 'test store',
  ayce: true,
  status: 'active',
  pos: 'Toast',
  timezone: 'America/Los_Angeles',
  createdDate: '2026-04-10T04:51:52.750Z',
  updatedDate: '2026-04-10T04:51:52.750Z',
  memo: '내부 테스트 매장. 개발, 배포 확인용도 등 등',
  posConfig: {
    type: 'Toast',
    guid: '7757291f-9b07-4d20-9ce1-2da27463b812',
    status: 'active',
  },
  featureFlags: {
    ageVerification: true,
    isAyce: false,
    lowBrandedMenu: false,
    payment: false,
    isMenuboss: false,
    allowEmployee: false,
    zurypty: false,
  },
  csInfo: {
    tableCount: 100,
    userAppVersions: ['v2.1.5', 'v3.0.0'],
    opsAppVersions: ['v1.0.0'],
    launcherAppVersions: ['v3.0.3'],
  },
}));
