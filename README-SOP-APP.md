# S&OP App - SmartOrder Engine

An intelligent Sales and Operations Planning platform that converts distributor Excel spreadsheets into SAP-ready sales orders using AI-powered column mapping.

## 🎯 What It Does

Upload any Excel/CSV file → AI maps columns → Validate against master data → Create SAP orders

Supports multiple Excel formats:
- 📊 **Pivot Tables** (Bisk Farm, Catch) - Sales trends with monthly columns
- 📦 **Stock Reports** (NILONS) - Opening, closing, purchase, primary sales
- 👥 **Customer Sales** (WeikField) - Customer-wise sales data
- 📄 **Flat Data** - Standard CSV/Excel exports

## 🚀 Quick Start

```bash
# Clone
https://github.com/tenchisattava/S-OP-App.git
cd S-OP-App

# Install
npm install

# Configure environment
cp .env.example .env.local
# Add your Clerk API keys to .env.local

# Run
npm run dev
```

## 🔐 Environment Setup

```env
# Required: Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: AI Features
GEMINI_API_KEY=your-gemini-key

# Optional: Database (file storage works without this)
DATABASE_URL="postgresql://..."
```

## 📁 Project Structure

```
S-OP-App/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── dashboard/          # Dashboard pages
│   │   └── smartorder/         # SmartOrder UI
│   ├── lib/
│   │   └── smart-order/        # Core engine
│   │       ├── excel-parser.ts # Excel parsing logic
│   │       ├── ai.ts           # Gemini AI mapping
│   │       ├── validation.ts   # Master data validation
│   │       └── store.ts        # Data storage
│   └── components/
│       └── smartorder/         # UI components
├── public/                     # Test Excel files
├── data/                       # JSON storage (auto-created)
├── uploads/                    # File uploads (auto-created)
└── scripts/                    # Test scripts
```

## 🧪 Testing Excel Files

Test files included in `/public/`:

| File | Format | Description |
|------|--------|-------------|
| Bisk Farm Sales report | Pivot | Monthly sales trends (Jan-2026, Feb-2026) |
| NILONS SNS REPORT | Stock | Opening, Purchase, Primary, Closing |
| Catch Sales report | Pivot | Product-wise monthly data |
| WeikField Sales Trend | Customer | Customer-wise sales values |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Auth**: Clerk (SignIn/SignUp/UserButton)
- **AI**: Google Gemini 2.0 Flash
- **Excel**: SheetJS (xlsx)
- **Storage**: File-based JSON (PostgreSQL optional)
- **Deployment**: Vercel / Docker

## 🐳 Docker Deploy

```bash
docker build -t sop-app .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... \
  -e CLERK_SECRET_KEY=sk_test_... \
  sop-app
```

## ☁️ Vercel Deploy

```bash
npm install -g vercel
vercel --prod
```

## 📝 Key Features

### 1. Excel Upload Wizard
- Drag & drop file upload
- Format auto-detection (pivot/stock/flat)
- Data preview before processing

### 2. AI Column Mapping
- Automatic SAP field detection
- Maps: Product → MATERIAL, Qty → QUANTITY, etc.
- Confidence scoring
- Manual override option

### 3. Master Data Validation
- Customer master lookup
- Material master lookup
- Pricing validation
- Duplicate detection

### 4. SAP Integration
- Create sales orders via API
- Mock mode for testing (95% success rate)
- Live mode for production

### 5. Analytics Dashboard
- Orders created/pending/failed
- Success rate tracking
- Batch history
- Customer/material stats

## 🔑 Authentication Flow

1. User clicks "Sign Up" in sidebar
2. Clerk handles registration
3. User avatar appears in header
4. Access to upload and dashboard

## 🧪 Testing

```bash
# Test Excel parser
node scripts/test-excel-parsing.js

# Test AI mapping
npm run test:ai
```

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - Pre-launch checklist
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - UI design system

## 🎨 UI Highlights

- Glassmorphism design
- Animated transitions (Framer Motion)
- Responsive sidebar
- Real-time progress indicators
- Dark theme optimized

## 🔒 Security

- Clerk authentication on all routes
- File upload validation
- Environment variable protection
- API rate limiting ready

## 🤝 Contributing

1. Fork this repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

Private - Tenchi Consulting

---

**Ready to deploy! 🚀**

For support: dev@tenchi.com
