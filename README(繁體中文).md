# Cloudflare API Schemas(繁體中文-官方更新於 2024/09)

# Cloudflare API Schemas (繁體中文)

本文件描述了 Cloudflare 常用 API 組件的結構和各種資料模型。以下內容涵蓋了通用結構、帳戶管理、區域管理、用戶資訊以及訂閱計劃等部分。

## 目錄

- [通用模型](#通用模型)
  - [UUID](#uuid)
  - [Identifier](#identifier)
  - [Timestamp](#timestamp)
  - [API 回應封裝](#api-回應封裝)
- [帳戶管理](#帳戶管理)
  - [Account](#account)
  - [Scope](#scope)
- [區域管理](#區域管理)
  - [Zone](#zone)
  - [Vanity Name Servers](#vanity-name-servers)
- [用戶資訊](#用戶資訊)
  - [User](#user)
- [訂閱計劃](#訂閱計劃)
  - [Plan](#plan)

---

## 通用模型

### UUID

- **描述**: 唯一標識符（UUID）。
- **類型**: 字串
- **最大長度**: 36
- **範例**: `f174e90a-fafe-4643-bbbc-4a0ed4fc8415`

### Identifier

- **描述**: 唯一識別碼。
- **類型**: 字串
- **最大長度**: 32
- **範例**: `023e105f4ecef8ad9ca31a8372d0c353`

### Timestamp

- **描述**: 日期時間格式的時間戳記。
- **類型**: 字串
- **格式**: `date-time`
- **範例**: `"2014-01-01T05:20:00.12345Z"`

### API 回應封裝

#### Result Info

- **描述**: 分頁結果的當前頁面資訊。
- **屬性**:
  - `page`: 當前頁碼
  - `per_page`: 每頁結果數量
  - `count`: 當前服務的總結果數
  - `total_count`: 無搜尋條件下的總結果數

#### API Response Collection

- **描述**: API 回應的集合封裝，包含通用回應和分頁資訊。
- **繼承自**: `api-response-common`
- **屬性**:
  - `result_info`: 參考 result_info 模型

#### Messages

- **描述**: API 回應中的訊息陣列。
- **類型**: 陣列
- **項目**: 物件，需包含 `code` 和 `message`
- **範例**: `[]`

#### API Response Common

- **描述**: API 回應的通用結構。
- **屬性**:
  - `success`: API 呼叫是否成功
  - `errors`: 參考 messages 模型
  - `messages`: 參考 messages 模型

#### API Response Common Failure

- **描述**: API 回應的失敗結構。
- **屬性**:
  - `success`: 始終為 false
  - `errors`: 最少包含一個錯誤訊息
  - `messages`: 參考 messages 模型
  - `result`: null

#### API Response Single ID

- **描述**: 回應單一 ID 的 API 結構。
- **繼承自**: `api-response-common`
- **屬性**:
  - `result`: 包含 `id` 的物件

#### API Response Single

- **描述**: 回應單一資源的 API 結構。
- **繼承自**: `api-response-common`

---

## 帳戶管理

### Account

- **描述**: 帳戶資訊。
- **必填欄位**:
  - `id`
  - `name`
- **屬性**:
  - `id`: 參考 `identifier` 模型
  - `name`: 帳戶名稱
  - `settings`: 帳戶設置
  - `enforce_twofactor`: 是否強制雙因素驗證
  - `use_account_custom_ns_by_default`: 是否預設使用帳戶自訂名稱伺服器
  - `created_on`: 帳戶創建時間

### Scope

- **描述**: 規則應用的範圍，所有屬於該帳戶的區域將套用此規則。
- **屬性**:
  - `id`: 參考 `identifier` 模型
  - `name`: 參考 `account` 模型中的 `name`
  - `type`: 規則範圍類型，預設為 `account`

---

## 區域管理

### Zone

- **描述**: 區域（域名）資訊。
- **必填欄位**:
  - `id`
  - `name`
  - `development_mode`
  - `owner`
  - `account`
  - `meta`
  - `original_name_servers`
  - `original_registrar`
  - `original_dnshost`
  - `created_on`
  - `modified_on`
  - `activated_on`
- **屬性**:
  - `id`: 參考 `identifier` 模型
  - `name`: 域名，需符合特定模式
  - `development_mode`: 開發模式的時間間隔
  - `original_name_servers`: 原始名稱伺服器
  - `original_registrar`: 原始註冊商
  - `original_dnshost`: 原始 DNS 主機
  - `created_on`: 創建時間
  - `modified_on`: 最後修改時間
  - `activated_on`: 啟用時間

### Vanity Name Servers

- **描述**: 用於自訂名稱伺服器的域名陣列，僅適用於商業和企業計劃。
- **類型**: 陣列
- **範例**: `com`

---

## 用戶資訊

### User

- **描述**: 用戶資訊。
- **必填欄位**:
  - `id`
  - `email`
  - `last_name`
  - `first_name`
  - `telephone`
  - `country`
  - `zipcode`
  - `two_factor_authentication_enabled`
  - `created_on`
  - `modified_on`
- **屬性**:
  - `id`: 參考 `identifier` 模型
  - `email`: 用戶聯絡郵箱
  - `first_name`: 名字
  - `last_name`: 姓氏
  - `username`: 用戶名，用於存取其他 Cloudflare 服務
  - `telephone`: 電話號碼
  - `country`: 所在國家
  - `zipcode`: 郵遞區號
  - `created_on`: 註冊時間
  - `modified_on`: 最後修改時間

---

## 訂閱計劃

### Plan

- **描述**: 訂閱計劃資訊。
- **屬性**:
  - `id`: 參考 `identifier` 模型
  - `name`: 計劃名稱
  - `price`: 計劃價格，以美元計
  - `currency`: 價格使用的貨幣單位
  - `frequency`: 收費頻率（如每週、每月等）
  - `legacy_id`: 用於 UI 的友好識別碼
  - `is_subscribed`: 區域是否訂閱此計劃
  - `can_subscribe`: 區域是否可訂閱此計劃

---
