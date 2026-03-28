# Push Tenchi S&OP to GitHub
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Pushing Tenchi S&OP to GitHub" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Adding all files..." -ForegroundColor Yellow
git add -A

Write-Host ""
Write-Host "Step 2: Checking status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "Step 3: Committing changes..." -ForegroundColor Yellow
git commit -m "SmartOrder Engine with Excel parsing and Clerk auth

- Enhanced Excel parser for pivot tables, stock reports, customer sales
- Added support for Bisk Farm, NILONS, Catch, WeikField formats
- Integrated Clerk authentication with SignIn/SignUp/UserButton
- Added AI column mapping with Gemini integration
- Created dashboard with real-time analytics
- Added SAP order creation (mock mode)
- Deployment ready configuration

Clerk Keys Configured:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

Test Excel files included in /public"

Write-Host ""
Write-Host "Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Done! Check https://github.com/batmandevx/techni" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
