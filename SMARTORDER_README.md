# Tenchi SmartOrder Engine

A production-grade, AI-powered order management system that automates the conversion of external order files (Excel/CSV) into SAP S/4HANA sales orders.

## Features

- **AI-Powered Column Mapping**: Automatically maps Excel columns to SAP fields using Google Gemini
- **Master Data Validation**: Validates customers and materials against local cache
- **SAP Integration**: Creates sales orders via BAPI_SALESORDER_CREATEFROMDAT2
- **Real-time Processing**: Live status updates during order creation
- **MIS Dashboard**: Comprehensive analytics and reporting
- **Excel Template Generator**: Pre-formatted templates with data validation

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Order Source    │────▶│  Tenchi SmartOrder    │────▶│  SAP S/4HANA    │
│  (Excel/CSV)    │     │  Engine (AI Core)     │     │  Sales Orders   │
└─────────────────┘     └──────────┬───────────┘     └─────────────────┘
                                   │
                        ┌──────────▼───────────┐
                        │  MIS Reporting        │
                        │  Dashboard            │
                        └───────────────────────┘
```

## Quick Start

### 1. Environment Setup

```bash
# Copy environment file
cp .env.smartorder .env

# Edit .env with your credentials
DATABASE_URL=postgresql://user:password@localhost:5432/smartorder
GEMINI_API_KEY=your-gemini-api-key
SAP_MOCK=true  # Set to false for real SAP connection
```

### 2. Database Setup

```bash
# Start PostgreSQL
docker-compose -f docker-compose.smartorder.yml up -d db

# Run migrations
npx prisma migrate dev --name init

# Seed data
npx prisma db seed
```

### 3. Start Services

```bash
# Start SAP mock service
docker-compose -f docker-compose.smartorder.yml up -d sap-service

# Start Next.js app
npm run dev
```

### 4. Access Application

- SmartOrder Dashboard: http://localhost:3000/smartorder
- Upload Orders: http://localhost:3000/smartorder/upload
- View Orders: http://localhost:3000/smartorder/orders
- Analytics: http://localhost:3000/smartorder/analytics

## API Endpoints

### AI Services
- `POST /api/ai/map-columns` - AI column mapping
- `POST /api/ai/validate` - AI validation suggestions
- `POST /api/ai/fuzzy-match` - Fuzzy matching for master data

### Order Management
- `POST /api/upload` - File upload
- `GET /api/batches` - List batches
- `POST /api/batches` - Create batch with mapping
- `GET /api/batches/[id]` - Batch details
- `POST /api/batches/[id]/validate` - Validate orders
- `POST /api/batches/[id]/process` - Process orders in SAP

### Master Data
- `GET /api/master-data/customers` - Customer CRUD
- `GET /api/master-data/materials` - Material CRUD

### Analytics
- `GET /api/analytics` - Dashboard KPIs

## SAP Integration

### Mock Mode
When `SAP_MOCK=true`, the SAP service simulates responses:
- 95% success rate
- Realistic order numbers (e.g., "1234567890")
- Simulated processing delays

### Real SAP Connection
To connect to a real SAP system:

1. Set `SAP_MOCK=false`
2. Configure SAP connection parameters:
   ```env
   SAP_HOST=your-sap-host
   SAP_SYSNR=00
   SAP_CLIENT=100
   SAP_USER=your-username
   SAP_PASSWORD=your-password
   ```
3. Ensure PyRFC is installed in the sap-service container

## Database Schema

### Core Tables
- `User` - User accounts and roles
- `CustomerMaster` - SAP customer data cache
- `MaterialMaster` - SAP material data cache
- `PricingCondition` - Pricing conditions (PR00, K004, etc.)
- `OrderBatch` - Uploaded file batches
- `OrderLine` - Individual order lines
- `AuditLog` - Activity logging

## Data Flow

1. **Upload**: User uploads Excel/CSV file
2. **AI Mapping**: Gemini maps columns to SAP fields
3. **Validation**: System validates against master data
4. **Processing**: Orders sent to SAP via BAPI
5. **Confirmation**: SAP order numbers stored

## Development

### Project Structure
```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── ai/        # AI services
│   │   ├── batches/   # Order batch management
│   │   ├── master-data/  # Master data APIs
│   │   └── analytics/    # Dashboard data
│   └── smartorder/    # UI pages
│       ├── page.tsx   # Dashboard
│       ├── upload/    # Upload wizard
│       ├── orders/    # Order history
│       └── analytics/ # MIS dashboard
├── components/        # React components
└── lib/              # Utilities

sap-service/          # Python FastAPI service
├── app/
│   └── main.py       # SAP BAPI integration
├── Dockerfile
└── requirements.txt

prisma/
└── schema.prisma     # Database schema
```

### Key Technologies
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **AI**: Google Gemini 2.0 Flash
- **SAP**: Python FastAPI, PyRFC (optional)
- **Database**: PostgreSQL
- **File Processing**: SheetJS (xlsx)

## Deployment

### Docker Compose
```bash
docker-compose -f docker-compose.smartorder.yml up -d
```

This starts:
- Next.js app (port 3000)
- SAP service (port 8000)
- PostgreSQL (port 5432)
- pgAdmin (port 5050)

## License

© 2024 Tenchi Consulting — Strategy. Scale. Success.
