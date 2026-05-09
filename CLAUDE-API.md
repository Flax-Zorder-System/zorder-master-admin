# 각 페이지별 필요한 API 목록

## 로그인

- POST {{api-server}}/v4/auth/login/masters
- ../api-server/src/api/auth/v4/controllers/auth.controller.ts:53-73 

## Store Detail

### 전체 스토어 리스트 가져오기

- GET {{api-server}}/v4/users/store-admins
- ../api-server/src/api/users/v4/controllers/users.controller.ts:57-79 

### 스토어 기본 정보

- GET {{api-server}}/v4/users/store-admins/:userId
- ../api-server/src/api/users/v4/controllers/users.controller.ts:81-102

### GET Audit log

- GET {{api-server}}/v4/settings/stores/:storeId/audit-logs 
- ../api-server/src/api/orders/v1/orders.service.v1.ts:993-994 