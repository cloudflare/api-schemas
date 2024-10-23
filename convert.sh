#!/bin/bash

# 定義文件路徑
INPUT_FILE="/Users/lipeichen/Documents/cloudflare-api-schemas/openapi.json"
OUTPUT_FILE="/Users/lipeichen/Documents/cloudflare-api-schemas/swagger.yaml"

# 使用 Swagger CLI 進行轉換
yq eval -P "$INPUT_FILE" > "$OUTPUT_FILE"

echo "轉換完成：$OUTPUT_FILE"
