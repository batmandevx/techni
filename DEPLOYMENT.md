# Tenchi S&OP Platform - Deployment Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional, falls back to file storage)
- Clerk account for authentication
- Google Gemini API key (optional, for AI features)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required: Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Database (falls back to file storage if not provided)
DATABASE_URL="postgresql://user:password@localhost:5432/tenchi?schema=public"
SMARTORDER_STORAGE="auto"  # auto, file, or prisma

# Optional: AI Features
GEMINI_API_KEY="your-gemini-api-key"

# Optional: SAP Integration
SAP_SERVICE_URL="http://localhost:8000"
SAP_MOCK="true"

# Optional: Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Tenchi S&OP <your-email@gmail.com>"
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Docker Deployment

```bash
# Build Docker image
docker build -t tenchi-sop .

# Run container
docker run -p 3000:3000 --env-file .env.local tenchi-sop
```

## Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Testing Excel Upload

The system supports these Excel formats:

### 1. Pivot Table Format (Bisk Farm, Catch)
- Headers with "Sum of Alt Qty", "Row Labels"
- Monthly columns (Jan-2026, Feb-2026, etc.)
- Product names in rows

### 2. Stock Report Format (NILONS)
- Columns: SUBGROUP, Product-1, Opening, Purchase, Primary, etc.
- Product descriptions
- Stock movement data

### 3. Customer Sales Format (WeikField)
- Customer-wise sales data
- Monthly value columns

## Features

- **SmartOrder Engine**: Upload Excel/CSV and convert to SAP orders
- **AI Column Mapping**: Automatic field detection using Gemini AI
- **Master Data Validation**: Validate against customer/material masters
- **SAP Integration**: Create sales orders in SAP S/4HANA
- **Analytics Dashboard**: Track order processing metrics
- **Multi-format Support**: Handles pivot tables, stock reports, and flat data

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Run `npm install` to update dependencies
- Clear `.next` folder and rebuild

### Excel Parsing Issues
- Check file format is .xlsx, .xls, or .csv
- Ensure data starts within first 10 rows
- Verify column headers are present

### SAP Connection Issues
- Set `SAP_MOCK=true` for demo mode
- Check `SAP_SERVICE_URL` is accessible
- Verify network connectivity

## Support

For issues and feature requests, please refer to the project documentation or contact the development team.
