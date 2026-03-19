# Tenchi S&OP Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker">
</p>

<p align="center">
  <b>AI-Powered Sales & Operations Planning Platform</b><br>
  Advanced demand forecasting, inventory optimization, and what-if scenario modeling
</p>

---

## 🌟 Features

### 📊 Data Management
- **Excel Upload** with live data preview
- **File Metadata Analysis** - columns, rows, data types, unique values
- **Column Selection** - choose which columns to import
- **Row Selection** - select specific rows for upload
- **Data Persistence** via localStorage

### 🤖 AI Forecasting Engine
- **6 Forecasting Algorithms**:
  - Simple Moving Average (SMA)
  - Weighted Moving Average (WMA)
  - Simple Exponential Smoothing (SES)
  - Holt's Method (Double Exponential Smoothing)
  - Linear Regression
  - Seasonal Decomposition
- **Trend Analysis** with confidence scoring
- **AI-Powered Insights** - automatic detection of trends, risks, and anomalies
- **Forecast Accuracy Metrics** - MAPE, RMSE, Bias, Tracking Signal

### 📈 Interactive Visualizations
- **4 Chart Types**:
  - Forecast vs Actual (Area + Bar combo)
  - Trend Analysis (Line with reference lines)
  - Accuracy Metrics (Bar with color coding)
  - Distribution (Pie chart)
- **Real-time Updates** as you adjust parameters

### 🔮 What-If Scenario Modeling
- **Interactive Sliders** for demand and safety stock adjustments
- **Quick Scenarios**: Optimistic, Baseline, Pessimistic, Promotional
- **Scenario Comparison** side-by-side
- **Impact Analysis** on next month forecast

### 🎨 Modern UI/UX
- **Glassmorphism Design** with dark theme
- **Responsive Layout** - works on desktop and mobile
- **Smooth Animations** with Framer Motion
- **Toast Notifications** for user feedback
- **Keyboard Shortcuts** for power users

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/batmandevx/techni.git
cd techni

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Docker
```bash
# Build and run
npm run docker:build
npm run docker:run

# Or with docker-compose
npm run docker:compose
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | ✅ | Your app URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ character string |
| `GEMINI_API_KEY` | ❌ | For AI assistant features |
| `DATABASE_URL` | ❌ | PostgreSQL connection string |

---

## 📁 Project Structure

```
tenchi/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── forecasting/    # Forecasting page
│   │   ├── upload/         # Excel upload page
│   │   └── ...
│   ├── components/          # React components
│   ├── lib/                # Utility functions
│   │   ├── forecasting.ts  # Forecasting engine
│   │   ├── DataContext.tsx # Data management
│   │   └── hooks/          # Custom hooks
│   └── middleware.ts       # Next.js middleware
├── .github/workflows/       # CI/CD pipeline
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose
├── next.config.js          # Next.js config
└── vercel.json             # Vercel config
```

---

## 🔧 Forecasting Algorithms

### Simple Moving Average (SMA)
```typescript
// Average of last n periods
SMA = (P1 + P2 + ... + Pn) / n
```
Best for: Stable demand patterns

### Weighted Moving Average (WMA)
```typescript
// More weight to recent periods
WMA = (w1*P1 + w2*P2 + ... + wn*Pn) / (w1 + w2 + ... + wn)
```
Best for: Gradual trend changes

### Simple Exponential Smoothing (SES)
```typescript
// Exponential decay weighting
Forecast = α * Actual + (1-α) * Previous_Forecast
```
Best for: No trend or seasonality

### Holt's Method
```typescript
// Trend-adjusted smoothing
Level = α * Actual + (1-α) * (Previous_Level + Trend)
Trend = β * (Level - Previous_Level) + (1-β) * Previous_Trend
```
Best for: Trending data

### Linear Regression
```typescript
// Linear trend projection
Y = a + bX
```
Best for: Strong linear trends

### Seasonal Decomposition
```typescript
// Seasonal pattern recognition
Forecast = Trend * Seasonal_Index
```
Best for: Seasonal products

---

## 🎯 Usage Guide

### 1. Upload Data
1. Go to **Upload Data** page
2. Select file type (Orders or Customers)
3. Drop your Excel file
4. Review file metadata and preview
5. Select columns and rows to import
6. Confirm upload

### 2. View Forecasts
1. Navigate to **Forecasting** page
2. Select a material from the tabs
3. View KPI cards and insights
4. Switch between chart types
5. Try different forecasting methods

### 3. Run What-If Scenarios
1. Adjust **Demand** slider (+/- 50%)
2. Adjust **Safety Stock** slider (+/- 50%)
3. View impact on next month forecast
4. Save scenarios for comparison
5. Export results to Excel

### 4. Export Data
- Click **Export** button on forecasting page
- Downloads Excel file with all forecast data
- Includes: Month, Opening Stock, Sales, Forecast, Closing Stock, Replenishment, Accuracy

---

## 🏥 Health Checks

```bash
# Check application health
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "memory": {
      "status": "ok",
      "heapUsed": "45MB"
    }
  }
}
```

---

## 🔒 Security Features

- **CORS** configuration
- **Security Headers**: HSTS, X-Frame-Options, X-XSS-Protection
- **Rate Limiting** on API routes
- **CSRF Protection**
- **Error Boundaries** for graceful error handling

---

## 🛠️ Development

```bash
# Run type check
npm run type-check

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Clean build artifacts
npm run clean
```

---

## 📸 Screenshots

<p align="center">
  <i>Dashboard with KPI cards and charts</i>
</p>

<p align="center">
  <i>Forecasting page with multiple algorithms</i>
</p>

<p align="center">
  <i>Excel upload with data preview</i>
</p>

---

## 📝 License

MIT License - see LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📧 Support

For support, email support@tenchi-sop.com or open an issue on GitHub.

---

<p align="center">
  Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS
</p>
