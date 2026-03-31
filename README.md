<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google" alt="Gemini AI">
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk Auth">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker">
</p>

<h1 align="center">S&OP Analytics Platform</h1>

<p align="center">
  <b>AI-Powered Sales & Operations Planning Platform</b><br>
  <i>Transform your Excel data into actionable business intelligence</i><br><br>
  Upload Excel files and instantly get real-time analytics including revenue trends,<br>
  customer insights, product performance, ABC classification, and regional sales analysis.
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Data Analysis Capabilities](#data-analysis-capabilities)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Upload & Analyze Data](#upload--analyze-data)
- [Multi-File Support](#multi-file-support)
- [Dashboard Metrics](#dashboard-metrics)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## Overview

The S&OP Analytics Platform is a comprehensive **Sales & Operations Planning** solution that transforms raw Excel data into actionable business intelligence. Unlike traditional BI tools that require complex setup, this platform allows you to:

1. **Upload Excel files** - Support for .xlsx, .xls, and .csv formats
2. **Automatic data detection** - Intelligent column mapping for orders, customers, products, and revenue
3. **Real-time calculations** - All metrics calculated from YOUR actual data, no random/mock values
4. **Visual analytics** - Interactive charts, graphs, and KPI dashboards
5. **Multi-file comparison** - Upload multiple files and compare performance side-by-side

**Perfect for:** Supply chain managers, demand planners, sales analysts, inventory controllers, and operations teams.

---

## Key Features

### Intelligent Data Processing
- **Automatic Column Detection** - Recognizes order IDs, customer names, products, quantities, prices, dates, and regions
- **Relational Data Support** - Links orders to customer master and material master data
- **Revenue Calculation** - Automatically calculates revenue from quantity × price (supports price lookup from master data)
- **Date Parsing** - Handles multiple date formats including Excel serial numbers
- **Currency Handling** - Strips currency symbols and parses numeric values correctly

### Real-Time Dashboard
- **KPI Cards** - Total orders, revenue, customers, products, forecast accuracy, inventory value
- **Trend Analysis** - Revenue & orders over time with forecast projections
- **Category Distribution** - Sales breakdown by product category
- **ABC Classification** - Pareto analysis of product value distribution
- **Regional Performance** - Geographic sales analysis
- **Top Products** - Best performing products by sales volume

### Multi-File Support
- **Single File View** - Analyze one file at a time with full details
- **Combined View** - Aggregate data from multiple files for overall analysis
- **Comparison View** - Side-by-side comparison of metrics across files
- **File Selection** - Click any uploaded file to view its specific analysis

### Data Export
- **CSV Export** - Download processed data as CSV
- **JSON Export** - Export raw data as JSON for integration
- **Report Generation** - PDF reports with charts and tables

---

## Data Analysis Capabilities

### Extracted Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Total Orders** | Number of unique orders | Count of unique Order IDs |
| **Total Revenue** | Sum of all sales | Quantity × Price (or direct revenue column) |
| **Unique Customers** | Distinct customers | Count of unique Customer IDs |
| **Unique Products** | Distinct products/SKUs | Count of unique Product/Material IDs |
| **Average Order Value** | Revenue per order | Total Revenue ÷ Total Orders |
| **Total Quantity** | Units sold | Sum of all quantity fields |
| **Forecast Accuracy** | Prediction vs actual | (1 - \|Actual - Forecast\| / Actual) × 100 |
| **Inventory Value** | Stock valuation | Sum of inventory quantities × prices |

### ABC Classification

Products are automatically classified using Pareto analysis:
- **Class A (Top 80%)** - High-value items contributing to 80% of revenue
- **Class B (Next 15%)** - Medium-value items (80-95% cumulative)
- **Class C (Bottom 5%)** - Low-value items (95-100% cumulative)

### Supported Data Formats

The platform intelligently detects and processes various Excel formats:

#### 1. Order/Sales Data
```
Order_ID | Order_Date | Customer_ID | Material_ID | Quantity | Price | Revenue
SO5001   | 2026-03-20 | C1001       | M2001       | 120      | 1.2   | 144.0
```

#### 2. Customer Master
```
Customer_ID | Customer_Name | Country | City
C1001       | Al Noor Trading | UAE   | Dubai
```

#### 3. Material Master
```
Material_ID | Material_Description | Price_USD
M2001       | Chocolate Bar 50g    | 1.2
```

#### 4. Pivot Table Format
```
Product | Jan-2026 | Feb-2026 | Mar-2026
SKU001  | 150      | 200      | 180
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router, Server Components) |
| **Language** | TypeScript 5.3 |
| **UI Library** | React 18 |
| **Styling** | Tailwind CSS 3.4 with Glassmorphism design |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Authentication** | Clerk |
| **Database** | SQLite (dev) / PostgreSQL (prod) via Prisma ORM |
| **AI/ML** | Google Gemini for intelligent column mapping |
| **File Parsing** | SheetJS (xlsx) for Excel processing |
| **Icons** | Lucide React |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- A **Clerk** account for authentication (free tier available)
- (Optional) **Google Gemini API key** for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/tenchisattava/S-OP-App.git
cd S-OP-App

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Upload & Analyze Data

### Step 1: Prepare Your Excel File

Your Excel file should contain columns like:
- **Order ID** (e.g., SO5001, Order_001)
- **Customer ID** (e.g., C1001, Customer_001)
- **Product/Material ID** (e.g., M2001, SKU123)
- **Quantity** (numeric value)
- **Price** or **Revenue** (numeric value)
- **Date** (any recognizable date format)
- **Region/Country** (optional, for geographic analysis)

### Step 2: Upload

1. Navigate to **Upload Data** page
2. Drag and drop your Excel file or click to browse
3. The system automatically detects:
   - File format (xlsx, xls, csv)
   - Column headers
   - Data types (numeric, categorical, date)
   - Data relationships

### Step 3: View Analytics

Once uploaded, the dashboard shows:
- **Real calculated metrics** from your data
- **Visual charts** with actual trends
- **ABC classification** based on product revenue
- **Regional breakdown** if location data present

### Data Calculation Examples

**Revenue Calculation:**
```
If file has: Quantity=100, Price=1.5
→ Revenue = 100 × 1.5 = $150

If file has: Revenue column = $200
→ Revenue = $200 (direct value)
```

**Order Count:**
```
If file has: Order_ID column with values [SO001, SO002, SO002, SO003]
→ Total Orders = 3 (unique values)
→ Total Rows = 4 (line items)
```

---

## Multi-File Support

### Upload Multiple Files

1. Upload your first file - it becomes the "active" dataset
2. Upload additional files - each is stored separately
3. Use the **View Mode** selector to switch between:

#### Single File View
Shows detailed analytics for the selected file only.

#### Combined View
Aggregates all uploaded files:
- Total revenue across all files
- Combined unique customers
- Merged product lists
- Consolidated trends

#### Comparison View
Side-by-side table comparing:
| File | Revenue | Orders | Customers | Products | Quantity |
|------|---------|--------|-----------|----------|----------|
| Jan_Sales.xlsx | $50,000 | 120 | 15 | 45 | 2,500 |
| Feb_Sales.xlsx | $65,000 | 150 | 18 | 48 | 3,200 |

### Use Cases

- **Monthly Comparison** - Upload January, February, March sales files
- **Regional Comparison** - Upload North, South, East region data
- **Product Line Comparison** - Upload data from different product categories

---

## Dashboard Metrics

### KPI Cards

| KPI | Icon | Description |
|-----|------|-------------|
| **Total Orders** | 🛒 | Number of unique orders in dataset |
| **Revenue** | 💰 | Total sales value (calculated from quantity × price) |
| **Customers** | 👥 | Count of unique customers |
| **Products** | 📦 | Count of unique products/SKUs |
| **Forecast Accuracy** | 🎯 | Accuracy percentage (if forecast data present) |
| **Inventory Value** | 📊 | Total inventory valuation |

### Charts & Visualizations

1. **Revenue & Orders Trend** - Area chart showing monthly performance
2. **Performance Radar** - Multi-dimensional business metrics
3. **Sales by Category** - Pie/donut chart of category distribution
4. **Data Flow Funnel** - Order to delivery pipeline
5. **Regional Heatmap** - Geographic performance intensity
6. **Top Products** - Bar chart of best-selling items
7. **ABC Classification** - Pareto distribution of product value
8. **Performance vs Target** - Actual vs planned metrics
9. **Regional Sales** - Horizontal bar chart by region

---

## API Reference

### Upload Endpoint

```http
POST /api/upload
Content-Type: multipart/form-data

file: <Excel or CSV file>
```

**Response:**
```json
{
  "success": true,
  "fileName": "sales_data.xlsx",
  "headers": ["Order_ID", "Customer_ID", "Quantity", "Price"],
  "totalRows": 150,
  "previewRows": [...],
  "detectedFormat": "flat"
}
```

### Analytics Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/dashboard` | Get KPIs and summary statistics |
| `GET /api/analytics` | Get detailed analytics data |
| `GET /api/analytics/orders-trend` | Get order trend data |
| `GET /api/analytics/top-customers` | Get top customers by value |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./dev.db` | Database connection string |
| `GEMINI_API_KEY` | No | — | Google Gemini API key for AI features |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public application URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | — | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | — | Clerk secret key |

---

## Project Structure

```
src/
├── app/
│   ├── main/
│   │   └── page.tsx          # Main dashboard page
│   ├── upload/
│   │   └── page.tsx          # File upload page
│   └── api/
│       └── upload/
│           └── route.ts      # Upload API handler
├── lib/
│   ├── DataContext.tsx       # Global state management
│   ├── dataAnalyzer.ts       # Data analysis engine
│   ├── uploadDataStore.ts    # Upload data persistence
│   └── workbook-parser.ts    # Excel parsing utilities
└── components/
    ├── charts/               # Chart components
    └── ui/                   # UI components
```

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

### Docker

```bash
# Build and run
docker build -t sop-analytics .
docker run -p 3000:3000 sop-analytics
```

---

## Screenshots

<p align="center">
  <img src="abc-dashboard-full.png" alt="Dashboard" width="800"><br>
  <i>Main dashboard with KPI cards and analytics charts</i>
</p>

<p align="center">
  <img src="ai-assistant-enhanced.png" alt="AI Assistant" width="800"><br>
  <i>AI-powered assistant for data analysis</i>
</p>

---

## Support

For support, please open an issue on GitHub or contact the development team.

---

<p align="center">
  Built with Next.js, React, TypeScript, Tailwind CSS, and Google Gemini AI
</p>
