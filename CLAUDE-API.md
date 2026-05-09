# 각 페이지별 필요한 API 목록

## 로그인

- POST {{api-server}}/v4/auth/login/masters
- ../api-server/src/api/auth/v4/controllers/auth.controller.ts:53-73 

## Store Detail

### 전체 스토어 리스트 가져오기

- GET {{api-server}}/v4/users/store-admins
- ../api-server/src/api/users/v4/controllers/users.controller.ts:57-79 

### 스토어 상세 정보

#### 스토어 기본 정보

- GET {{api-server}}/v4/users/store-admins/:userId
- ../api-server/src/api/users/v4/controllers/users.controller.ts:81-102

#### 스토어 커스텀 정보

- GET {{api-server}}/v4/settings/stores/:storeId/customize-design/terms
- ../api-server/src/api/settings/v4/controllers/settings-master.controller.ts:50-64

#### 스토어 POS 연동 상세 정보

- GET {{api-server}}/pos/store-integrations/:storeId
- ../api-server/src/api/integrations/pos/v0/pos.controller.ts:90-117

```json
{
    "posId": 4,
    "posStoreId": "360354fc-...",
    "storeId": 137,
    "integrationType": null,
    "serverHost": null,
    "serverPort": null,
    "serverKey": null,
    "credential": null,
    "diningOptionId": "1420fdb5-...",
    "isActive": true,
    "futureCheckDelayMinutes": null,
    "useAutoSync": false
}
```

#### 결제 세팅 정보

- GET {{api-server}}/v4/settings/stores/137/payment-config
- ../api-server/src/api/settings/v4/controllers/settings-payment-config.controller.ts:21-45

```json
{
    "result": true,
    "status": 200,
    "code": "Z000000",
    "message": "Success",
    "data": {
        "splitMaxCount": 10,
        "providers": [
            {
                "type": "DATACAP",
                "isActive": true,
                "config": {
                    "creditMid": "1231437173",
                    "creditToken": "1231437173",
                    "eCommerceMid": "1437173",
                    "eCommerceToken": "1437173"
                }
            },
            {
                "type": "CODEPAY",
                "isActive": false,
                "config": {
                    "merchantNo": "..."
                }
            },
            {
                "type": "STRIPE",
                "isActive": true,
                "config": {
                    "connectedAccountId": "..."
                }
            }
        ]
    }
}
```

#### Store Audit log

- GET {{api-server}}/v4/settings/stores/:storeId/audit-logs 
- ../api-server/src/api/orders/v1/orders.service.v1.ts:993-994 

### 스토어 주문 정보

#### 오더 티켓 히스토리 조회

- GET {{api-server}}/v4/master/orders/stores/:storeId/tickets
- ../api-server/src/api/orders/v4/controllers/master-orders.controller.ts:18-45

#### 오더 티켓 상세 정보 조회

- GET {{api-server}}/v4/master/orders/stores/:storeId/tickets/:orderTicketId
- ../api-server/src/api/orders/v4/controllers/master-orders.controller.ts:48-72

#### Checks 리스트 조회

- GET {{api-server}}/v4/master/checks/stores/:storeId/checks?startDate=&endDate=&page=1&pageSize=50 
- ../api-server/src/api/orders/v4/controllers/master-checks.controller.ts

#### Checks 상세 정보 조회

- GET {{api-server}}/v4/checks/:checkId
- ../api-server/src/api/orders/v4/controllers/checks.controller.ts:24-90 