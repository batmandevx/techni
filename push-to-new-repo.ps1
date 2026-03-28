# Push Tenchi S&OP to New Repository
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Pushing Tenchi S&OP to New Repository" -ForegroundColor Cyan
Write-Host "https://github.com/tenchisattava/S-OP-App.git" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Adding new remote 'sop'..." -ForegroundColor Yellow
try {
    git remote add sop https://github.com/tenchisattava/S-OP-App.git 2>$null
    Write-Host "Remote added successfully" -ForegroundColor Green
} catch {
    Write-Host "Remote 'sop' already exists, continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Verifying remotes..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "Step 3: Adding all files..." -ForegroundColor Yellow
git add -A

Write-Host ""
Write-Host "Step 4: Committing changes (if any)..." -ForegroundColor Yellow
try {
    git commit -m "SmartOrder Engine - Excel parsing, Clerk auth, deployment ready

Features:
- Multi-format Excel parser (pivot, stock, customer, flat)
- AI column mapping with Gemini
- Clerk authentication integrated
- SAP order creation (mock/live)
- Real-time analytics dashboard
- 6 test Excel files included

Ready for Vercel/Docker deployment"
    Write-Host "Committed successfully" -ForegroundColor Green
} catch {
    Write-Host "Nothing to commit or commit failed, continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 5: Pushing to new repository..." -ForegroundColor Yellow
git push sop master

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Done! Check https://github.com/tenchisattava/S-OP-App" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
