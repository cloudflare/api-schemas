# Cloudflare API Schemas

This repository contains OpenAPI schemas for the Cloudflare API.

## OpenAPI Splitter

The `split-openapi.ts` script splits large OpenAPI specification files into smaller, manageable chunks to avoid file size limits.

### Prerequisites

- [Bun](https://bun.sh/) runtime installed

### Usage

```bash
bun split-openapi.ts <input-file> [output-dir]
```

**Parameters:**
- `<input-file>`: Path to the OpenAPI specification file (.yaml, .yml, or .json)
- `[output-dir]`: Optional output directory (defaults to `./openapi-split`)

**Examples:**

```bash
# Split openapi.yaml into ./openapi-split directory
bun split-openapi.ts openapi.yaml

# Split openapi.json into custom directory
bun split-openapi.ts openapi.json ./my-split-output

# Split with explicit output directory
bun split-openapi.ts openapi.yaml ./json-split
```

### Features

- Splits large OpenAPI files into chunks under 5MB each
- Preserves OpenAPI structure and references
- Supports both YAML and JSON formats
- Creates organized directory structure:
  - `main.info.{yaml|json}` - Main OpenAPI metadata
  - `paths/` - API endpoints split into numbered files
  - `components/` - Components organized by type (schemas, responses, etc.)

### Output Structure

```
output-dir/
├── main.info.yaml          # OpenAPI metadata, servers, security
├── paths/
│   ├── paths-001.yaml      # API endpoints (chunked)
│   └── paths-002.yaml
└── components/
    ├── schemas/
    │   └── schemas-001.yaml
    ├── responses/
    │   └── responses-001.yaml
    └── ...
```
