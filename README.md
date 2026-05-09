# Zorder Master Web

> **MVP / 테스트 목적 도구입니다.**
> QA 진행 중 매장 데이터를 빠르게 추적하고 확인하기 위한 내부용 관리 페이지입니다.
> 현재 **read-only** 기능만 제공하며, 데이터 생성·수정·삭제는 지원하지 않습니다.

---

## Overview

Zorder 매장의 운영 현황을 조회하는 마스터 어드민 웹 도구입니다.

- 매장 목록 및 상세 정보 조회
- Order Tickets / Checks / Payments / Audit Logs 조회
- QA 중 특정 주문·결제 흐름을 빠르게 추적

## Tech Stack

- **TypeScript + React** (Vite 8)
- **MUI v9** (MUI v6 API)
- **React Router DOM v7**
- **Node.js 22+**

## Getting Started

```bash
nvm use 22
npm install
npm run dev      # localhost:5173
```

환경 변수는 `.env.local` 파일로 관리합니다. API 서버 주소 등을 설정하세요.

```
VITE_APP_ENV=local
VITE_API_BASE_URL=http://localhost:3000
```

## Pages

| Path | Description |
|------|-------------|
| `/login` | 마스터 계정 로그인 |
| `/stores` | 매장 목록 |
| `/stores/:id?tab=STORE_INFO` | 매장 상세 (탭: STORE_INFO / ORDER_TICKETS / CHECKS / PAYMENTS / AUDIT_LOGS) |
| `/stores/:id/tickets/:ticketId` | Order Ticket 상세 (새 탭) |
| `/checks/:checkId` | Check 상세 (새 탭) |

## Notes

- 이 프로젝트는 프로덕션 서비스용이 아닌, **내부 QA 및 디버깅 목적**으로 구축된 MVP입니다.
- 현재 모든 기능은 **조회 전용(read-only)** 이며, 향후 필요에 따라 기능이 추가될 수 있습니다.
- 마스터 계정 로그인만 허용되며, 일반 매장 계정으로는 접근할 수 없습니다.
