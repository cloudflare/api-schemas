# API 文件

本文件提供 API 的可用端點、參數和回應的描述。

## 目錄

- [通用部分](#通用部分)
- [端點](#端點)
  - [快取保留](#快取保留)
    - [查詢快取保留清除狀態](#查詢快取保留清除狀態)
  - [帳戶](#帳戶)
    - [查詢帳戶詳情](#查詢帳戶詳情)
- [資料結構](#資料結構)

---

## 通用部分

### 通用模型

#### UUID

- **類型**: 字串
- **描述**: 使用 UUID 格式的唯一識別碼。
- **範例**: `f174e90a-fafe-4643-bbbc-4a0ed4fc8415`

#### 識別碼 (Identifier)

- **類型**: 字串
- **描述**: 唯一的識別碼字串。
- **範例**: `023e105f4ecef8ad9ca31a8372d0c353`

---

## 端點

### 快取保留

#### 查詢快取保留清除狀態

- **描述**: 查詢當前快取保留清除操作的狀態。
- **方法**: `GET`
- **路徑**: `/cache/reserve/clear/{zone_id}/status`
- **參數**:
  - `zone_id` (路徑參數) - 區域的唯一識別碼。
- **回應**:
  - **200 OK**:
    - **範例**:
      ```json
      {
        "success": true,
        "errors": [],
        "messages": [],
        "result": {
          "id": "cache_reserve_clear",
          "state": "In-progress",
          "start_ts": "2023-10-02T10:00:00.12345Z"
        }
      }
      ```
  - **404 Not Found**:
    - **範例**:
      ```json
      {
        "success": false,
        "errors": [
          {
            "code": 1142,
            "message": "無法取得 cache_reserve_clear 設定值。此區域設置不存在，因為您從未執行過快取保留清除操作。"
          }
        ],
        "messages": []
      }
      ```

### 帳戶

#### 查詢帳戶詳情

- **描述**: 取得帳戶資訊。
- **方法**: `GET`
- **路徑**: `/accounts/{account_id}`
- **參數**:
  - `account_id` (路徑參數) - 帳戶的唯一識別碼。
- **回應**:
  - **200 OK**:
    - **範例**:
      ```json
      {
        "success": true,
        "errors": [],
        "messages": [],
        "result": {
          "id": "023e105f4ecef8ad9ca31a8372d0c353",
          "name": "範例帳戶",
          "created_on": "2021-05-20T12:00:00.123Z"
        }
      }
      ```

---

## 資料結構

### API 通用回應

- **類型**: 物件
- **屬性**:
  - `success` (布林值) - 請求是否成功。
  - `errors` (物件陣列) - 出現的錯誤訊息。
  - `messages` (物件陣列) - 與操作相關的訊息。
  - `result` (物件) - 操作的結果。

---

### 成功回應範例

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "023e105f4ecef8ad9ca31a8372d0c353",
    "name": "範例帳戶",
    "created_on": "2021-05-20T12:00:00.123Z"
  }
}
```
