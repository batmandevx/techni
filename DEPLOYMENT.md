# Tenchi S&OP Platform - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker (optional)

### Local Development
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Deployment Options

### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

**Required Environment Variables in Vercel:**
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Random 32+ character string
- `GEMINI_API_KEY` - For AI features (optional)

### 2. Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Or use docker-compose
npm run docker:compose

# With PostgreSQL and Redis
npm run docker:compose:db
```

### 3. AWS Deployment

#### Using ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t tenchi-sop .
docker tag tenchi-sop:latest <account>.dkr.ecr.<region>.amazonaws.com/tenchi-sop:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/tenchi-sop:latest
```

### 4. Railway/Render/Fly.io

Simply connect your GitHub repository and set the environment variables.

## Health Checks

The application exposes a health check endpoint at:
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "responseTime": 12,
  "checks": {
    "memory": {
      "status": "ok",
      "heapUsed": "45MB",
      "heapTotal": "60MB"
    }
  }
}
```

## Environment Variables

See `.env.example` for all available options.

### Required
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret key for encryption

### Optional
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - For AI assistant features
- `SMTP_*` - Email configuration
- `UPSTASH_*` - Redis configuration

## Performance Optimization

### Build Output
The application uses Next.js standalone output for optimized Docker images.

### Code Splitting
- Charts are dynamically imported
- XLSX library is code-split
- Vendor chunks are separated

### Caching
- Static assets cached for 1 year
- API responses cached based on headers
- localStorage for client-side data persistence

## Monitoring

### Health Endpoint
Monitor `/api/health` for:
- Application status
- Memory usage
- Response time

### Error Tracking
Configure Sentry by setting `SENTRY_DSN` environment variable.

### Logging
Set `LOG_LEVEL` environment variable:
- `debug` - Development
- `info` - Production default
- `warn` - Warnings only
- `error` - Errors only

## Troubleshooting

### Build Errors
```bash
# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Memory Issues
For low-memory environments, limit Node.js heap:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Database Connection Issues
Ensure your database URL is correctly formatted and the database is accessible from your deployment environment.

## Security

### Security Headers
The application includes:
- CORS configuration
- Content Security Policy
- X-Frame-Options
- HSTS (in production)

### Authentication
- JWT-based authentication
- Secure session management
- CSRF protection

## Support

For deployment issues:
1. Check the health endpoint
2. Review application logs
3. Verify environment variables
4. Check the GitHub issues
