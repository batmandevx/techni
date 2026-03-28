# Tenchi S&OP Platform

AI-powered Sales and Operations Planning platform for intelligent demand forecasting, inventory optimization, and automated order processing.

## 🚀 Features

### SmartOrder Engine
- **Excel Upload**: Drag-and-drop support for .xlsx, .xls, .csv files
- **AI Column Mapping**: Automatic field detection using Google Gemini AI
- **Multi-Format Support**:
  - Pivot tables (Bisk Farm, Catch sales trends)
  - Stock reports (NILONS opening/closing/primary)
  - Customer-wise sales (WeikField)
  - Standard flat data
- **Master Data Validation**: Validate against customer/material masters
- **SAP Integration**: Create sales orders in SAP S/4HANA (mock/live mode)

### Authentication
- **Clerk Auth**: Secure authentication with SignIn/SignUp/UserButton
- **User Management**: Role-based access control

### Analytics Dashboard
- **Real-time KPIs**: Orders created, pending, failed, success rate
- **Batch Tracking**: Monitor upload and processing status
- **Trend Analysis**: Historical order data visualization

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Glassmorphism
- **Auth**: Clerk
- **AI**: Google Gemini 2.0 Flash
- **Storage**: File-based JSON (Prisma/PostgreSQL optional)
- **Deployment**: Docker, Vercel, or self-hosted

## 📁 Test Excel Files

The `/public` folder includes real-world Excel files for testing:

1. **Bisk Farm Sales report** - Pivot table format with monthly sales trends
2. **NILONS SNS REPORT** - Stock report with opening/closing/primary data
3. **Catch Sales report** - Pivot table with product-wise monthly data
4. **WeikField Sales Trend** - Customer-wise sales values

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/batmandevx/techni.git
cd techni

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk API keys

# Run development server
npm run dev
```

### Environment Variables

```env
# Required: Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: AI Features
GEMINI_API_KEY=your-gemini-api-key

# Optional: Database (falls back to file storage)
DATABASE_URL="postgresql://..."
SMARTORDER_STORAGE="auto"
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t tenchi-sop .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... \
  -e CLERK_SECRET_KEY=sk_test_... \
  tenchi-sop
```

## ☁️ Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 📊 Usage

1. **Sign Up**: Create an account using the Clerk auth in the sidebar
2. **Upload Excel**: Go to Dashboard → Upload New Batch
3. **AI Mapping**: The system auto-detects columns (SOLD_TO, MATERIAL, QTY, etc.)
4. **Validate**: Check against master data
5. **Process**: Create SAP orders

## 🧪 Testing

Run the Excel parser test:
```bash
node scripts/test-excel-parsing.js
```

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - Pre-deployment checklist

## 🔒 Security

- Clerk authentication protects all routes
- Environment variables for sensitive data
- File upload validation
- API rate limiting ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

Private - Tenchi Consulting

---

Built with ❤️ by Tenchi Consulting
