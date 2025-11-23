# Test Data Generator

An internal tool for testers to generate realistic test data from DTOs or example JSON. Paste your data structure, configure field types and constraints, and export in various formats.

## Features

- **Parse DTOs**: Paste JSON objects/arrays or TypeScript interfaces
- **Smart Field Detection**: Auto-detects field types (email, date, uuid, etc.) from names
- **Configurable Constraints**: Set min/max values, required/nullable, enum values
- **Nested Structures**: Support for deeply nested arrays and objects
- **Hint-based Generation**: Add descriptions like "temperature" or "site code" for realistic data
- **Multiple Export Formats**: JSON, CSV, SQL INSERT, XML
- **Bulk Generation**: Generate 1 to 100,000 records

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend in development mode
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Individual Services

```bash
# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend
```

## Project Structure

```
TestDataGenerator/
├── shared/                 # Shared TypeScript types
│   └── src/types.ts
├── backend/                # Express + TypeScript API
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── routes/         # API routes
│       └── services/       # Business logic
│           ├── parser.service.ts    # DTO parsing
│           ├── generator.service.ts # Data generation
│           └── exporter.service.ts  # Format export
├── frontend/               # React + MUI UI
│   └── src/
│       ├── App.tsx
│       └── features/generator/
│           ├── api/        # API client
│           └── components/ # UI components
├── package.json            # Monorepo root
└── Dockerfile              # Container build
```

## Build

```bash
# Build all packages (shared, backend, frontend)
npm run build

# Build individual packages
npm run build:backend
npm run build:frontend
```

Build outputs:
- `shared/dist/` - Compiled shared types
- `backend/dist/` - Compiled backend
- `frontend/dist/` - Static frontend assets

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/parse` | Parse DTO input to schema |
| POST | `/api/generate` | Generate test data |
| GET | `/api/field-types` | List available field types |
| GET | `/api/formats` | List export formats |
| GET | `/api/health` | Health check |

### Example: Parse DTO

```bash
curl -X POST http://localhost:3001/api/parse \
  -H "Content-Type: application/json" \
  -d '{
    "input": "{\"name\": \"John\", \"email\": \"john@example.com\"}",
    "inputType": "auto"
  }'
```

### Example: Generate Data

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "schema": {
      "fields": [
        {"name": "email", "type": "string", "required": true, "nullable": false}
      ],
      "originalInput": ""
    },
    "count": 10,
    "format": "json"
  }'
```

## Deployment

### Option 1: Azure App Service (Recommended)

#### Using Azure CLI

```bash
# Login to Azure
az login

# Run deployment script
chmod +x azure-deploy.sh
./azure-deploy.sh
```

The script creates:
- Resource group: `test-data-generator-rg`
- App Service Plan: `test-data-generator-plan` (B1 tier)
- Web App: `test-data-generator`

#### Manual Deployment

```bash
# Build the project
npm run build

# Create zip of deployment files
zip -r deploy.zip shared/dist backend/dist frontend/dist package*.json shared/package.json backend/package.json

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group test-data-generator-rg \
  --name test-data-generator \
  --src deploy.zip
```

### Option 2: Docker

```bash
# Build Docker image
docker build -t test-data-generator .

# Run container
docker run -p 8080:8080 test-data-generator
```

### Option 3: GitHub Actions CI/CD

1. Create Azure Web App and download publish profile
2. Add secret `AZURE_WEBAPP_PUBLISH_PROFILE` in GitHub repo settings
3. Update `AZURE_WEBAPP_NAME` in `.github/workflows/azure-deploy.yml`
4. Push to `main` branch to trigger deployment

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/azure-deploy.yml`) runs on push to `main`:

1. **Checkout** - Clone repository
2. **Setup Node.js** - Install Node 18
3. **Install** - `npm ci`
4. **Build** - `npm run build`
5. **Package** - Create deployment bundle
6. **Deploy** - Push to Azure Web App
7. **Health Check** - Verify deployment

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` (dev) / `8080` (prod) | Server port |
| `NODE_ENV` | `development` | Environment mode |

### Azure Configuration

Edit `azure-deploy.sh` to customize:

```bash
RESOURCE_GROUP="test-data-generator-rg"  # Resource group name
APP_NAME="test-data-generator"           # Web app name
LOCATION="australiaeast"                 # Azure region
SKU="B1"                                 # App Service tier
```

## Smart Data Generation

The generator automatically creates realistic data based on field names:

| Field Name Pattern | Generated Data |
|-------------------|----------------|
| `email`, `userEmail` | `john.doe@example.com` |
| `firstName`, `lastName` | Person names |
| `phone`, `mobile` | Phone numbers |
| `address`, `city`, `country` | Location data |
| `createdAt`, `updatedAt` | ISO timestamps |
| `temperature`, `humidity` | Realistic measurements |
| `status`, `state` | `Active`, `Pending`, etc. |
| `sensorName`, `deviceName` | `Astatine-226` |
| `siteReference`, `id` | `ABC12345` |

Add custom hints in the UI for better matching:
- Hint: "temperature in celsius" → generates -20 to 45
- Hint: "product SKU" → generates `ABC-123456`

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Build errors

```bash
# Clean and reinstall
rm -rf node_modules */node_modules
npm install
npm run build
```

### TypeScript errors

```bash
# Check types without building
npm run typecheck
```

## License

Internal use only.
