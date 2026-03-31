<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google" alt="Gemini AI">
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk Auth">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/Recharts-Visualizations-22B5BF?style=for-the-badge" alt="Recharts">
  <img src="https://img.shields.io/badge/Framer_Motion-Animations-E10098?style=for-the-badge" alt="Framer Motion">
</p>

<h1 align="center">🚀 S&OP Analytics Platform</h1>

<p align="center">
  <b>Next-Generation AI-Powered Sales & Operations Planning</b><br>
  <i>Transform Raw Excel Data Into Strategic Business Intelligence in Seconds</i>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#api-reference">API</a>
</p>

---

## 🎯 What Makes This Platform Revolutionary

**Stop wasting hours on manual Excel analysis.** The S&OP Analytics Platform is an enterprise-grade, AI-powered business intelligence solution that instantly transforms your scattered Excel spreadsheets into actionable strategic insights. No complex setup. No data engineering required. Just upload and discover.

### The Problem We Solve

❌ **Traditional BI Tools**: Expensive, complex, require IT teams  
❌ **Manual Excel Analysis**: Time-consuming, error-prone, no real-time insights  
❌ **Data Silos**: Customer data in one file, orders in another, products in a third  
❌ **Static Reports**: Outdated the moment they're created  

✅ **Our Solution**: Upload your Excel files → Get instant, accurate analytics

---

## ✨ Key Features

### 1. 🧠 Intelligent Data Processing Engine

Our proprietary data analysis engine doesn't just read your Excel files—it **understands** them:

#### Automatic Column Detection
The system intelligently recognizes and maps:
- **Order Identifiers**: `Order_ID`, `OrderID`, `SO_Number`, `Invoice_No`, `Sales_Order`
- **Customer Data**: `Customer_ID`, `CustomerID`, `Client_Code`, `Buyer_ID`, `Account_Number`
- **Product Information**: `Material_ID`, `Product_ID`, `SKU`, `Item_Code`, `Article_Number`
- **Quantities**: `Quantity`, `Qty`, `Units`, `Volume`, `Pieces`, `Order_Qty`
- **Financial Data**: `Price`, `Unit_Price`, `Rate`, `Amount`, `Revenue`, `Sales_Value`, `Total_Amount`
- **Temporal Data**: `Order_Date`, `Delivery_Date`, `Invoice_Date`, `Period`, `Month`, `Year`
- **Geographic Data**: `Country`, `Region`, `City`, `State`, `Territory`, `Zone`
- **Categorical Data**: `Category`, `Product_Type`, `Segment`, `Division`, `Brand`, `Class`

#### Smart Data Type Recognition
- **Numeric Parsing**: Handles currency symbols ($, €, £, ₹), commas, parentheses for negatives
- **Date Parsing**: Supports multiple formats (ISO, US, EU, Excel serial numbers)
- **Categorical Analysis**: Automatically identifies and groups text-based categories
- **Missing Data Handling**: Intelligent null/empty value processing

#### Relational Data Intelligence
The platform automatically links related data across sheets:

```
Orders Sheet:          Customer_Master:          Material_Master:
Order_ID: SO001        Customer_ID: C1001        Material_ID: M2001
Customer_ID: C1001  →  Customer_Name: ABC Corp → Material_Name: Widget A
Material_ID: M2001     Country: USA              Price_USD: 25.00
Quantity: 100
```

**Result**: Revenue = 100 × $25.00 = **$2,500** (automatically calculated)

### 2. 📊 Real-Time Analytics Dashboard

Get instant visibility into your business performance with 9+ interactive visualizations:

#### KPI Cards (Live Metrics)
| Metric | Description | Real-Time Updates |
|--------|-------------|-------------------|
| 💰 **Total Revenue** | Sum of all sales values | Auto-calculated from quantity × price |
| 🛒 **Total Orders** | Count of unique order IDs | Deduplication across line items |
| 👥 **Unique Customers** | Distinct customer count | Master data linking |
| 📦 **Unique Products** | Distinct SKU/product count | Material master integration |
| 🎯 **Forecast Accuracy** | Prediction vs actual (%) | Requires forecast columns |
| 📊 **Inventory Value** | Stock valuation | Quantity × Price aggregation |

#### Interactive Charts

**📈 Revenue & Orders Trend (Area Chart)**
- Time-series visualization of revenue and order volume
- Automatic month/quarter aggregation
- Forecast projection line (5% growth trend)
- Hover tooltips with exact values
- Color-coded: Revenue (Indigo), Orders (Emerald), Forecast (Amber)

**🎯 Performance Radar (Radar Chart)**
- Multi-dimensional business health check
- 6 key dimensions: Sales, Inventory, Forecast, Orders, Customers, Products
- Normalized scoring (0-100 scale)
- Compare current vs. target performance

**🥧 Sales by Category (Donut Chart)**
- Category distribution by revenue
- Top 8 categories displayed
- Percentage and value labels
- Interactive legend

**📊 Data Flow Funnel (Funnel Chart)**
- Visual pipeline from orders to delivery
- 5 stages: Total Orders → Unique Customers → Unique Products → Categories → Regions
- Color gradient visualization
- Value labels at each stage

**🔥 Regional Performance Heatmap**
- Geographic performance intensity map
- X-axis: Time periods (Q1, Q2, Q3, Q4)
- Y-axis: Regions
- Color intensity: Sales volume
- Quick identification of high/low performing areas

**🏆 Top Products Table**
- Ranked list of best-performing products
- Metrics: Product name, Sales value, Quantity sold, Growth %
- Row hover effects
- Truncated long names with ellipsis

**📉 ABC Classification (Pie Chart)**
- Pareto analysis visualization
- Class A: Top 80% revenue contributors (Green)
- Class B: Next 15% contributors (Amber)
- Class C: Bottom 5% contributors (Gray)
- Helps prioritize inventory focus

**📊 Performance vs Target (Bar Chart)**
- Actual vs. planned metrics
- Categories: Sales, Orders, Inventory, Forecast
- Dual-color bars (Indigo = Actual, Emerald = Target)
- Performance gap visualization

**🌍 Regional Sales (Horizontal Bars)**
- Geographic breakdown
- Progress bars showing relative performance
- Order and customer counts per region
- Map pin icons for visual reference

### 3. 📁 Multi-File Intelligence System

Manage and compare multiple data sources seamlessly:

#### Three Powerful View Modes

**👁️ Single File View**
- Deep-dive analysis of one dataset
- Complete metrics for selected file
- Historical trend analysis
- Full drill-down capabilities

**🔀 Combined View**
- Aggregate all uploaded files into unified analytics
- Total portfolio view across all data sources
- Consolidated revenue, orders, customers
- Merged trend lines
- Perfect for: Multi-month rollups, regional consolidation

**⚖️ Comparison View**
Side-by-side comparison table showing:
| Metric | File 1 | File 2 | File 3 | ... |
|--------|--------|--------|--------|-----|
| Revenue | $50K | $65K | $80K | ... |
| Orders | 120 | 150 | 200 | ... |
| Customers | 15 | 18 | 22 | ... |
| Products | 45 | 48 | 52 | ... |
| Quantity | 2,500 | 3,200 | 4,100 | ... |

**Click any row to instantly switch to that file's detailed view**

#### File Management Features
- **Persistent Storage**: All files saved to localStorage
- **Quick Switching**: Click any uploaded file to view it
- **Active Indicator**: Green badge shows currently viewed file
- **Upload Timestamp**: See when each file was uploaded
- **Row Count**: Know the size of each dataset

### 4. 🤖 AI-Powered Assistant (Gemini Integration)

Get intelligent answers about your data:

**Ask questions like:**
- "What was my best performing product last month?"
- "Which region had the highest order volume?"
- "Show me customers with declining orders"
- "What's my inventory turnover rate?"

**Features:**
- Natural language processing
- Context-aware responses based on uploaded data
- Multi-turn conversations
- Data-grounded answers (no hallucinations)

### 5. 📤 Flexible Data Import

#### Supported File Formats
- **Microsoft Excel**: .xlsx, .xls (all versions)
- **CSV**: Comma-separated values
- **Multiple Sheets**: Automatic sheet detection and parsing

#### Intelligent Format Detection
The system automatically detects and handles:

**📋 Flat Table Format**
```
Order_ID | Date       | Customer | Product | Qty | Price
SO001    | 2024-01-15 | C1001    | P2001   | 100 | 25.00
```

**📊 Pivot Table Format**
```
Product    | Jan-2024 | Feb-2024 | Mar-2024
Widget A   | 150      | 200      | 180
Widget B   | 120      | 140      | 160
```

**📦 Stock Report Format**
```
Product | Opening | Purchase | Sales | Closing
SKU001  | 1000    | 500      | 300   | 1200
```

**🔗 Relational Format** (Multiple linked sheets)
- Orders sheet with foreign keys
- Customer master with details
- Material master with pricing

### 6. 💾 Data Persistence & Export

#### Automatic Saving
- All uploaded files stored in browser localStorage
- Analysis results cached for instant retrieval
- Dashboard state preserved across sessions
- No data loss on page refresh

#### Export Options
- **CSV Export**: Download processed data as CSV
- **JSON Export**: Machine-readable format for integrations
- **PDF Reports**: Branded reports with charts and tables
- **Email Distribution**: Send reports directly from platform

---

## 🎨 Design & User Experience

### Visual Design Philosophy
- **Glassmorphism**: Modern frosted glass UI elements
- **Dark Mode**: Easy on the eyes for long analysis sessions
- **Gradient Accents**: Indigo-to-violet color scheme
- **Micro-interactions**: Smooth hover effects and transitions
- **3D Elements**: Floating cards with depth and shadow

### Animation & Motion
- **Page Transitions**: Smooth fade and slide animations
- **Loading States**: Animated skeleton screens and spinners
- **Chart Animations**: Progressive drawing of lines and bars
- **Counter Animations**: Animated number counting for KPIs
- **Hover Effects**: Scale, glow, and lift on interactive elements

### Responsive Design
- **Desktop**: Full 1600px wide dashboard layout
- **Tablet**: Adaptive 2-column grid
- **Mobile**: Stacked single-column view
- **Touch Optimized**: Large tap targets on mobile

---

## 🔧 Technical Architecture

### Frontend Stack
```
Next.js 14 (App Router)
├── React 18 (Server Components)
├── TypeScript 5.3 (Type Safety)
├── Tailwind CSS 3.4 (Styling)
├── Framer Motion (Animations)
├── Recharts (Visualizations)
├── Lucide React (Icons)
└── React Hot Toast (Notifications)
```

### Data Processing Pipeline
```
Excel Upload
    ↓
SheetJS Parser (XLSX)
    ↓
Format Detection Engine
    ↓
Column Mapper (AI + Pattern Matching)
    ↓
Data Normalizer
    ↓
Analysis Engine
    ├── Revenue Calculator
    ├── Trend Analyzer
    ├── ABC Classifier
    └── Regional Aggregator
    ↓
Dashboard State (React Context)
    ↓
Visualization Components
```

### State Management
- **DataContext**: Global state for uploaded files and analytics
- **localStorage**: Persistent client-side storage
- **React Hooks**: useState, useEffect, useCallback, useMemo

---

## 📖 Detailed Usage Guide

### Step 1: Prepare Your Data

**Minimum Required Columns:**
- Order identifier (Order_ID, Invoice_No, etc.)
- Quantity or Amount
- Either Price (for calculation) or Revenue (direct value)

**Recommended Additional Columns:**
- Customer_ID (for customer analysis)
- Product_ID (for product analysis)
- Date (for trend analysis)
- Region/Country (for geographic analysis)
- Category (for segmentation)

**Example Optimal Format:**
```excel
| Order_ID | Order_Date | Customer_ID | Material_ID | Quantity | Unit_Price | Country   |
|----------|------------|-------------|-------------|----------|------------|-----------|
| SO5001   | 2024-03-20 | C1001       | M2001       | 120      | 1.20       | UAE       |
| SO5002   | 2024-03-21 | C1002       | M2003       | 80       | 2.50       | Qatar     |
```

### Step 2: Upload Your File

1. Navigate to the **Dashboard** or **Upload** page
2. Drag and drop your Excel file onto the upload zone
3. Or click to browse and select your file
4. Wait for processing (usually < 2 seconds)
5. View the upload confirmation with row/column count

**Upload Features:**
- Multiple file upload support
- File type validation (.xlsx, .xls, .csv)
- Size limit: 50MB per file
- Progress indicator during upload

### Step 3: Explore Your Analytics

**View the Dashboard:**
- Scroll through KPI cards at the top
- Hover over charts for detailed tooltips
- Click chart legends to toggle data series
- Use the date filter (Last 30 days default)

**Switch Between Files:**
1. Look for the "Recent Uploads" section at the bottom
2. Click any file name to load its analysis
3. The active file shows a green "Active" badge

### Step 4: Use Multi-File Features

**To Compare Files:**
1. Upload 2 or more files
2. Click the "View Mode" selector
3. Select "Comparison"
4. View the comparison table
5. Click any row to see detailed analysis

**To See Combined View:**
1. Upload multiple files
2. Select "Combined" view mode
3. See aggregated metrics across all files

### Step 5: Export Results

**Download as CSV:**
1. Go to Upload page
2. Find your file in the list
3. Click the "Export CSV" button

**Generate PDF Report:**
1. Navigate to Reports page
2. Select report template
3. Choose date range
4. Click Generate

---

## 🎓 Calculation Methodology

All metrics are calculated from YOUR actual data—no random numbers, no mock data.

### Revenue Calculation
```typescript
// Priority 1: Direct revenue column
if (revenueColumn exists) {
    revenue = parseNumber(row[revenueColumn])
}
// Priority 2: Quantity × Price from row
else if (quantityColumn && priceColumn) {
    revenue = quantity × price
}
// Priority 3: Quantity × Price from master data
else if (quantityColumn && productInMasterData) {
    revenue = quantity × masterData.price
}
```

### ABC Classification Algorithm
```typescript
1. Sort all products by total revenue (descending)
2. Calculate cumulative revenue percentage
3. Class A: Products contributing to first 80%
4. Class B: Products contributing to 80-95%
5. Class C: Remaining products (95-100%)
```

### Forecast Accuracy
```typescript
if (forecastColumn && actualColumn) {
    accuracy = (1 - |actual - forecast| / actual) × 100
}
```

### Trend Calculations
```typescript
// Month-over-month growth
if (monthlyRevenue.length >= 2) {
    firstMonth = monthlyRevenue[0]
    lastMonth = monthlyRevenue[last]
    growth = ((lastMonth - firstMonth) / firstMonth) × 100
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** for cloning

Optional:
- **Clerk Account** (free tier) for authentication
- **Gemini API Key** for AI assistant features

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/tenchisattava/S-OP-App.git
cd S-OP-App

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Clerk keys

# 4. Initialize database
npm run db:generate
npm run db:migrate

# 5. Start development server
npm run dev

# 6. Open browser
open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file:

```env
# Required for authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional for AI features
GEMINI_API_KEY=your_gemini_api_key

# Database (default: SQLite)
DATABASE_URL="file:./dev.db"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📡 API Reference

### Upload API

**Upload File**
```http
POST /api/upload
Content-Type: multipart/form-data

file: <binary excel file>
```

**Response:**
```json
{
  "success": true,
  "fileName": "sales_march_2024.xlsx",
  "batchName": "sales_march_2024",
  "headers": ["Order_ID", "Customer_ID", "Quantity", "Price", "Date"],
  "totalRows": 1250,
  "previewRows": [...],
  "detectedFormat": "flat",
  "sheetName": "Orders",
  "sampleData": {...}
}
```

### Dashboard API

**Get Dashboard Data**
```http
GET /api/dashboard
```

**Response:**
```json
{
  "success": true,
  "kpis": {
    "totalRevenue": 1250000,
    "totalOrders": 450,
    "activeCustomers": 85,
    "forecastAccuracy": 87.5
  }
}
```

### Analytics APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics` | GET | Get all analytics data |
| `/api/analytics/orders-trend` | GET | Get order trends over time |
| `/api/analytics/top-customers` | GET | Get top customers by revenue |
| `/api/customers` | GET/POST | Customer master data |
| `/api/materials` | GET/POST | Material/product master |
| `/api/orders` | GET/POST | Order management |

---

## 🏗️ Project Structure

```
S-OP-App/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── main/                 # Main dashboard page
│   │   │   └── page.tsx          # Dashboard with KPIs and charts
│   │   ├── upload/               # File upload page
│   │   │   └── page.tsx          # Drag-drop upload interface
│   │   ├── api/                  # API routes
│   │   │   ├── upload/           # File upload handler
│   │   │   │   └── route.ts
│   │   │   ├── dashboard/        # Dashboard data API
│   │   │   └── analytics/        # Analytics APIs
│   │   └── layout.tsx            # Root layout
│   │
│   ├── lib/                      # Core logic
│   │   ├── DataContext.tsx       # Global state management
│   │   ├── dataAnalyzer.ts       # Data analysis engine ⭐
│   │   ├── uploadDataStore.ts    # Upload persistence layer
│   │   ├── workbook-parser.ts    # Excel parsing utilities
│   │   └── forecasting.ts        # Forecasting algorithms
│   │
│   ├── components/               # React components
│   │   ├── charts/               # Chart components
│   │   │   ├── AreaChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── RadarChart.tsx
│   │   │   └── FunnelChart.tsx
│   │   ├── ui/                   # UI primitives
│   │   ├── 3d/                   # 3D visual elements
│   │   └── layout/               # Layout components
│   │
│   └── types/                    # TypeScript types
│
├── prisma/                       # Database schema
│   └── schema.prisma
├── public/                       # Static assets
├── Dockerfile                    # Docker configuration
└── README.md                     # This file
```

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build Docker image
docker build -t sop-analytics .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... \
  -e CLERK_SECRET_KEY=sk_test_... \
  sop-analytics
```

### Docker Compose

```bash
# Start full stack (app + database)
docker-compose up -d

# View logs
docker-compose logs -f app
```

---

## 📸 Screenshots

<p align="center">
  <img src="abc-dashboard-full.png" alt="Main Dashboard" width="90%">
  <br>
  <em>Main Dashboard: KPI cards, revenue trends, ABC classification, and regional performance</em>
</p>

<p align="center">
  <img src="ai-assistant-enhanced.png" alt="AI Assistant" width="90%">
  <br>
  <em>AI Assistant: Ask natural language questions about your data</em>
</p>

<p align="center">
  <img src="abc-dashboard-mobile.png" alt="Mobile View" width="40%">
  <br>
  <em>Mobile Responsive: Full functionality on any device</em>
</p>

---

## 💡 Use Cases

### 1. Monthly Sales Review
**Scenario**: Sales manager needs to review March performance  
**Action**: Upload March_Sales.xlsx  
**Result**: Instant view of total revenue, top products, best customers, regional breakdown

### 2. Quarterly Business Review
**Scenario**: Quarterly board meeting preparation  
**Action**: Upload Jan.xlsx, Feb.xlsx, Mar.xlsx → Select "Combined" view  
**Result**: Q1 aggregate metrics with trend analysis

### 3. Regional Performance Comparison
**Scenario**: Compare North vs South region performance  
**Action**: Upload North_Region.xlsx and South_Region.xlsx → Select "Comparison" view  
**Result**: Side-by-side metrics comparison

### 4. Inventory Optimization
**Scenario**: Identify slow-moving stock  
**Action**: Upload inventory data with sales history  
**Result**: ABC classification showing Class C (slow-moving) items

### 5. Customer Analysis
**Scenario**: Identify top customers for loyalty program  
**Action**: Upload customer sales data  
**Result**: Top customers table ranked by revenue

---

## 🎯 Performance & Scalability

### Tested Limits
- **File Size**: Up to 50MB Excel files
- **Row Count**: Tested with 100,000+ rows
- **Concurrent Files**: No limit on uploaded files
- **Load Time**: < 2 seconds for 10,000 rows

### Optimizations
- **Virtual Scrolling**: Large datasets render efficiently
- **Lazy Loading**: Charts load progressively
- **Memoization**: Expensive calculations cached
- **Debouncing**: Search inputs debounced for performance

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/S-OP-App.git

# 2. Create branch
git checkout -b feature/amazing-feature

# 3. Make changes
# ... edit files ...

# 4. Test
npm run test
npm run type-check

# 5. Commit
git commit -m "Add amazing feature"

# 6. Push
git push origin feature/amazing-feature

# 7. Create Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **SheetJS** - For excellent Excel parsing capabilities
- **Recharts** - For beautiful, responsive charts
- **Framer Motion** - For smooth animations
- **Tailwind CSS** - For utility-first styling
- **Clerk** - For seamless authentication
- **Google Gemini** - For AI-powered insights

---

## 📞 Support

Need help? Have questions? Want to request a feature?

- 🐛 **Bug Reports**: [Create an issue](https://github.com/tenchisattava/S-OP-App/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/tenchisattava/S-OP-App/discussions)
- 📧 **Email**: support@sop-analytics.com

---

<p align="center">
  <strong>Built with ❤️ by the S&OP Analytics Team</strong>
</p>

<p align="center">
  <a href="https://github.com/tenchisattava/S-OP-App/stargazers">⭐ Star us on GitHub</a> •
  <a href="https://twitter.com/sopanalytics">🐦 Follow us on Twitter</a> •
  <a href="https://www.linkedin.com/company/sop-analytics">💼 Connect on LinkedIn</a>
</p>

<p align="center">
  <sub>Last updated: March 2025 | Version 1.0.0</sub>
</p>
