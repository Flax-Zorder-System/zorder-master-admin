# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zorder 매장 운영 현황을 조회하는 마스터 웹 페이지. **Read-only** 원칙 — 매장 정보의 update/create/delete는 없으며, 마스터 계정 로그인만 예외적으로 추가될 수 있다.

## Tech Stack

- **TypeScript + React** with **Vite 8**
- **MUI** (`@mui/material ^9`, MUI v6 API)
- **React Router DOM** v7
- **Node.js 22+** (Vite 8은 20.19+ 필수, nvm 사용 권장)

## Commands

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (Vite, localhost:5173)
npm run build        # 프로덕션 빌드
npm run lint         # 린트
npm run preview      # 빌드 결과 미리보기
```

> Node 버전 확인: `nvm use 22` 후 실행할 것.

## Environment

환경은 `local | dev | stage | prod` 네 가지이며, **모든 페이지 상단에 현재 환경을 반드시 표시**해야 한다.
환경 변수는 Vite의 `VITE_` prefix 방식으로 관리 (`.env.local`, `.env.dev`, `.env.stage`, `.env.prod`).

## Related Repositories

| 역할 | 경로 |
| --- | --- |
| API 서버 | `../api-server` |
| POS 서버 | `../pos-server` |
| DB 스크립트 | `../zorder-db-scripts` |

## Pages

- `/login` — 마스터 계정 로그인
- `/stores` — 매장 목록 (MUI Table, 행 클릭 → 상세 라우팅)
- `/stores/:id` — 매장 상세 (사이드 nav + store info + audit logs)

## Architecture

### 디렉터리 구조

```text
src/
  components/
    ui/         # 재사용 기본 컴포넌트 (InfoRow, Section, DataTable 등)
  contexts/     # 전역 상태 (TimezoneContext)
  hooks/        # 커스텀 훅 (useFormatDate 등)
  mocks/        # 목데이터 (API 연동 전 임시)
  pages/        # 라우트별 페이지 컴포넌트
  types/        # TypeScript 타입 정의
```

### 라우팅

React Router DOM v7. `Layout`이 `<Outlet />`을 감싸는 구조:

```tsx
<Route element={<Layout />}>
  <Route index → /stores />
  <Route path="/stores" />
  <Route path="/stores/:id" />
</Route>
```

### 전역 컨텍스트

- `TimezoneContext` — AppBar의 TZ selector로 전역 timezone 변경. 날짜 표시가 필요한 모든 컴포넌트에서 `useTimezone()` 훅으로 접근. 날짜 포맷은 `formatWithTimezone(isoString, timezone)` 유틸 함수 사용 (`Intl.DateTimeFormat('sv-SE')` 기반 — `YYYY-MM-DD HH:mm:ss` 형식 자동 생성).
- `useFormatDate()` hook (예정) — `useTimezone` + `formatWithTimezone`를 캡슐화. 날짜를 표시하는 곳은 이 훅을 사용한다.

## MUI 사용 규칙 (v9 / MUI v6 API)

> 이 프로젝트는 `@mui/material ^9.0.0` (내부적으로 MUI v6 API)을 사용한다.

### 1. ListItemText — primary에 블록 요소 넣지 말 것

`ListItemText`의 `primary` prop은 `<p>` 태그로 렌더링되므로, `<Box>`(div)를 자식으로 넣으면 `p > div` HTML 구조 오류가 발생한다.

```tsx
// BAD — p > div 오류
<ListItemText primary={<Box>...</Box>} />

// GOOD — 순수 Box 기반 레이아웃으로 대체
<Box sx={{ display: 'flex', ... }}>
  <Typography>label</Typography>
  <Box>{value}</Box>
</Box>
```

`InfoRow` 컴포넌트(`StoreDetail.tsx`)가 이 패턴을 사용한다.

### 2. ListItemText 스타일 — slotProps 사용

MUI v6부터 `primaryTypographyProps` / `secondaryTypographyProps`는 deprecated. `slotProps`를 사용한다.

```tsx
// BAD (deprecated)
<ListItemText primaryTypographyProps={{ sx: { fontSize: 13 } }} />

// GOOD
<ListItemText slotProps={{ primary: { sx: { fontSize: 13 } } }} />
```

### 3. Typography shorthand prop 사용 금지

ESLint가 shorthand Typography prop을 자동 수정한다. `sx`로만 스타일을 지정한다.

```tsx
// BAD — linter가 sx로 자동 수정
<Typography fontWeight={700} />

// GOOD
<Typography sx={{ fontWeight: 700 }} />
```

### 4. 사이드 nav 접힘 — width transition

사이드 nav의 collapse/expand는 `display: none` 전환이나 `navigate`가 아닌 width transition으로 처리한다 (레이아웃 안정성 유지).

```tsx
<Box sx={{ width: navOpen ? 200 : 48, transition: 'width 0.2s ease', overflow: 'hidden' }}>
```

### 5. Chip 사용 기준

- 환경 배지(ENV), status, feature flag on/off → Chip 사용
- audit log action 컬럼 → **Chip 사용 안 함** (텍스트만 표시)

### 6. 환경 표시

모든 페이지 상단 AppBar에 환경 Chip을 반드시 표시한다.

```tsx
const ENV = (import.meta.env.VITE_APP_ENV ?? 'local') as string;
// color 매핑: local=default, dev=success, stage=warning, prod=error
```

## Node.js / Vite 버전 요구사항

- Vite 8은 **Node.js 20.19 이상** 필요 (권장: Node 22)
- Node 18 사용 시 Vite 8 실행 불가 → Node 22로 업그레이드 필요
