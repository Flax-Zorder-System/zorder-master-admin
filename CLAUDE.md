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
- `/stores/:id` — 매장 상세 (사이드 nav + tabs). `?tab=` query param으로 탭 상태 유지 (`store info` | `order tickets` | `check` | `audit`)
- `/stores/:id/tickets/:ticketId` — Order Ticket 상세 (새 탭으로 열림)
- `/checks/:checkId` — Check 상세 (새 탭으로 열림)

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
  <Route path="/stores/:id/tickets/:ticketId" />  {/* 새 탭 detail */}
  <Route path="/checks/:checkId" />               {/* 새 탭 detail */}
</Route>
```

### 전역 컨텍스트

- `TimezoneContext` — AppBar의 TZ selector로 전역 timezone 변경. 날짜 표시가 필요한 모든 컴포넌트에서 `useTimezone()` 훅으로 접근. 날짜 포맷은 `formatWithTimezone(isoString, timezone)` 유틸 함수 사용 (`Intl.DateTimeFormat('sv-SE')` 기반 — `YYYY-MM-DD HH:mm:ss` 형식 자동 생성).
- `useFormatDate()` hook (예정) — `useTimezone` + `formatWithTimezone`를 캡슐화. 날짜를 표시하는 곳은 이 훅을 사용한다.

### URL 탭 상태 유지

`/stores/:id`의 탭 전환은 `useSearchParams`로 `?tab=` query param에 반영한다. 탭 key가 유효하지 않으면 `'store info'`로 fallback. `replace: true`로 히스토리 스택에 쌓지 않는다.

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const activeMenu = parseTab(searchParams.get('tab'));
const setActiveMenu = (menu: StoreMenu) =>
  setSearchParams({ tab: menu }, { replace: true });
```

### 새 탭 Detail 페이지 패턴

리스트 행 클릭 시 상세 페이지를 **새 탭**으로 여는 패턴. `window.open`을 사용한다.

```tsx
onClick={() => window.open(`/checks/${check.id}`, '_blank')}
```

상세 페이지는 `Layout` 안의 `ProtectedRoute`에 속하므로 인증이 그대로 작동한다. 단, 새 탭은 `sessionStorage`를 공유하지 않으므로 반드시 **`localStorage`**에 인증 정보를 저장해야 한다.

### 인증 저장소 — localStorage 사용

`auth_user`는 반드시 `localStorage`에 저장한다. `sessionStorage`는 탭 간 공유되지 않아 새 탭에서 인증이 풀린다. API 쿠키(`credentials: 'include'`)는 브라우저가 origin 단위로 관리하므로 탭 간 자동 공유된다.

```ts
// ❌ sessionStorage — 새 탭에서 auth 풀림
// ✅ localStorage — 탭 간 공유됨
localStorage.setItem('auth_user', JSON.stringify(authUser));
```

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

### 7. 날짜 필터 컴포넌트 패턴

날짜 범위 필터가 있는 리스트 컴포넌트(`OrderTickets`, `Checks` 등)는 공통 패턴을 따른다.

- `ButtonGroup`으로 quick range 버튼 (`today` / `yesterday` / `this week`) 제공
- `TextField type="date"` 두 개로 start/end 직접 입력 허용
- date input 직접 수정 시 quick range 선택 해제 (active 표시 제거)
- 날짜 변경 시 `page`를 반드시 `0`으로 리셋
- API에는 `YYYY-MM-DDT00:00:00.000Z` 형식으로 전달
- `TextField`에 `slotProps={{ inputLabel: { shrink: true } }}` 적용 (label 겹침 방지)

### 8. 테이블 내 상태 배지 — Typography caption 사용

목록 테이블의 상태 배지(paymentStatus, prepStatus, check status 등)는 MUI `Chip`이 아닌 `Typography variant="caption"`에 `bgcolor`/`color` sx로 구현한다. Chip의 기본 padding/height가 밀도 높은 table에 맞지 않기 때문이다.

```tsx
<Typography
  variant="caption"
  sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: bg, color, fontWeight: 600 }}
>
  {label}
</Typography>
```

규칙 5와 함께 참고: 환경/글로벌 status 배지 → `Chip`, 테이블 행 내 상태 배지 → `Typography caption`.

## Node.js / Vite 버전 요구사항

- Vite 8은 **Node.js 20.19 이상** 필요 (권장: Node 22)
- Node 18 사용 시 Vite 8 실행 불가 → Node 22로 업그레이드 필요


---

# Working Style (project-level)

Source: Boris Cherny (creator of Claude Code) — his personal CLAUDE.md.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
