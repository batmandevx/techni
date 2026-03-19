# Tenchi S&OP Platform

**Sales & Operations Planning Automation Platform with AI Forecasting**

A comprehensive enterprise-grade S&OP solution that transforms demand planning from reactive spreadsheets into a structured, AI-driven decision system.

![Tenchi S&OP Dashboard](https://via.placeholder.com/800x400/1B2A4A/FFFFFF?text=Tenchi+S%26OP+Platform)

## Features

### Core Capabilities

- **AI-Powered Demand Forecasting** - Uses Google Gemini API combined with statistical models (SMA, WMA, ARIMA) for accurate predictions
- **Real-time Inventory Management** - Track stock levels, in-transit inventory, and automated replenishment calculations
- **Order Management System** - Multi-line order support with full validation pipeline
- **Executive Dashboard** - Interactive KPIs, charts, and 3D visualizations
- **AI Chat Assistant** - Conversational analytics powered by Gemini
- **Automated Reporting** - PDF and Excel report generation
- **Email Automation** - Automated alerts and notifications

### Key Features

- 📊 **Interactive Dashboards** - Real-time KPIs with Recharts visualizations
- 🤖 **AI Forecasting Engine** - Hybrid statistical + AI ensemble forecasting
- 📁 **Excel/CSV Upload** - Drag-and-drop file processing with validation
- 💬 **AI Chat Interface** - Natural language queries for supply chain data
- 📈 **3D Visualizations** - Three.js powered inventory heatmaps
- 📄 **PDF/Excel Reports** - Automated report generation
- 📧 **Email Automation** - Smart alerts and notifications
- 🔐 **Role-Based Access** - Admin, Planner, and Viewer roles

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **AI Engine**: Google Gemini 2.0 Flash API
- **Styling**: Tailwind CSS
- **Charts**: Recharts, Chart.js
- **3D**: Three.js + React Three Fiber
- **Animation**: Framer Motion
- **Auth**: JWT-based authentication

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/tenchi-sop.git
cd tenchi-sop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tenchi_sop"
NEXTAUTH_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Default Login Credentials

- **Admin**: admin@tenchi.com / admin123
- **Planner**: planner@tenchi.com / planner123
- **Viewer**: viewer@tenchi.com / viewer123

## Core Calculations

### Inventory Formulas

```
Closing Stock = Opening Stock + Stock in Transit - Actual Sales
Replenishment Qty = (Forecast Demand + Safety Stock) - Closing Stock
```

### KPIs

- **Forecast Accuracy**: (1 - |Actual - Forecast| / Actual) × 100
- **Inventory Turns**: COGS / Average Inventory
- **Fill Rate**: Orders Fulfilled / Total Orders × 100
- **Stock Coverage**: Current Stock / Average Daily Sales
- **Stockout Risk**: Probability based on demand variance

## API Endpoints

### Authentication
- `POST /api/auth` - Login/Register

### Core APIs
- `GET /api/dashboard` - Dashboard KPIs and stats
- `POST /api/upload` - File upload (Excel/CSV)
- `GET /api/orders` - List orders with filters
- `GET /api/inventory` - Inventory data
- `GET /api/forecast` - Forecast data and generation
- `POST /api/ai` - AI chat interface
- `GET /api/reports` - Generate PDF/Excel reports

## Project Structure

```
tenchi-sop/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── upload/       # File upload
│   │   ├── orders/       # Order management
│   │   ├── inventory/    # Inventory APIs
│   │   ├── forecast/     # Forecasting APIs
│   │   ├── ai/           # AI chat API
│   │   ├── reports/      # Report generation
│   │   └── dashboard/    # Dashboard data
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   │   ├── prisma.ts     # Database client
│   │   ├── gemini.ts     # Gemini AI integration
│   │   ├── calculations.ts # S&OP formulas
│   │   ├── validators.ts # Input validation
│   │   ├── excel.ts      # Excel parsing
│   │   ├── pdf.ts        # PDF generation
│   │   └── email.ts      # Email templates
│   ├── types/            # TypeScript types
│   ├── page.tsx          # Main dashboard
│   └── layout.tsx        # Root layout
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── package.json
```

## Features in Detail

### 1. File Upload System
- Drag-and-drop interface
- Excel (.xlsx, .xls) and CSV support
- Automatic sheet type detection
- Row-by-row validation
- Duplicate detection
- Multi-line order grouping
- Error reporting with downloadable CSV

### 2. Order Management
- Full validation pipeline
- Master data validation
- Business rule enforcement
- Status lifecycle tracking
- Multi-line order support
- Credit limit checking

### 3. Inventory Management
- Real-time stock tracking
- Automated calculations
- Stockout risk assessment
- Replenishment recommendations
- Safety stock optimization

### 4. AI Forecasting
- Hybrid ensemble forecasting
- Statistical baselines (SMA, WMA)
- Gemini AI refinement
- Confidence intervals
- Backtesting and accuracy tracking

### 5. AI Chat Assistant
- Natural language queries
- Function calling for data access
- Tool-based responses
- Context-aware conversations
- Export capabilities

### 6. Reporting
- Executive summary PDFs
- Inventory reports
- Order reports
- Forecast reports
- Excel data exports

## License

MIT License - See LICENSE file for details

## Support

For support, email support@tenchi-sop.com or join our Slack channel.

---

**Strategy. Scale. Success.**

Built with Next.js + Gemini AI
