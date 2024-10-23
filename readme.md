# API Documentation

This document provides a description of the available endpoints, parameters, and responses for the API.

## Table of Contents

- [General](#general)
- [Endpoints](#endpoints)
  - [Cache Reserve](#cache-reserve)
    - [GET Cache Reserve Clear Status](#get-cache-reserve-clear-status)
  - [Account](#account)
    - [GET Account Details](#get-account-details)
- [Schemas](#schemas)

---

## General

### Common Models

#### UUID

- **Type**: String
- **Description**: A unique identifier in UUID format.
- **Example**: `f174e90a-fafe-4643-bbbc-4a0ed4fc8415`

#### Identifier

- **Type**: String
- **Description**: A unique identifier string.
- **Example**: `023e105f4ecef8ad9ca31a8372d0c353`

---

## Endpoints

### Cache Reserve

#### GET Cache Reserve Clear Status

- **Description**: Retrieve the status of the current Cache Reserve Clear operation.
- **Method**: `GET`
- **Path**: `/cache/reserve/clear/{zone_id}/status`
- **Parameters**:
  - `zone_id` (path) - The unique identifier for the zone.
- **Responses**:
  - **200 OK**:
    - **Example**:
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
    - **Example**:
      ```json
      {
        "success": false,
        "errors": [
          {
            "code": 1142,
            "message": "Unable to retrieve cache_reserve_clear setting value. The zone setting does not exist because you never performed a Cache Reserve Clear operation."
          }
        ],
        "messages": []
      }
      ```

### Account

#### GET Account Details

- **Description**: Fetch account information.
- **Method**: `GET`
- **Path**: `/accounts/{account_id}`
- **Parameters**:
  - `account_id` (path) - The unique identifier for the account.
- **Responses**:
  - **200 OK**:
    - **Example**:
      ```json
      {
        "success": true,
        "errors": [],
        "messages": [],
        "result": {
          "id": "023e105f4ecef8ad9ca31a8372d0c353",
          "name": "Example Account",
          "created_on": "2021-05-20T12:00:00.123Z"
        }
      }
      ```

---

## Schemas

### API Response Common

- **Type**: Object
- **Properties**:
  - `success` (Boolean) - Whether the request was successful.
  - `errors` (Array of Objects) - Any errors that occurred.
  - `messages` (Array of Objects) - Any messages related to the operation.
  - `result` (Object) - The result of the operation.

---

### Example Response for Success

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "023e105f4ecef8ad9ca31a8372d0c353",
    "name": "Example Account",
    "created_on": "2021-05-20T12:00:00.123Z"
  }
}
```
