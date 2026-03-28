@echo off
echo ============================================
echo Pushing Tenchi S&OP to New Repository
echo https://github.com/tenchisattava/S-OP-App.git
echo ============================================
echo.

echo Step 1: Adding new remote 'sop'...
git remote add sop https://github.com/tenchisattava/S-OP-App.git 2>nul || echo Remote 'sop' already exists

echo.
echo Step 2: Verifying remotes...
git remote -v

echo.
echo Step 3: Adding all files...
git add -A

echo.
echo Step 4: Committing changes (if any)...
git commit -m "SmartOrder Engine - Excel parsing, Clerk auth, deployment ready

Features:
- Multi-format Excel parser (pivot, stock, customer, flat)
- AI column mapping with Gemini
- Clerk authentication integrated
- SAP order creation (mock/live)
- Real-time analytics dashboard
- 6 test Excel files included

Ready for Vercel/Docker deployment" || echo Nothing to commit

echo.
echo Step 5: Pushing to new repository...
git push sop master

echo.
echo ============================================
echo Done! Check https://github.com/tenchisattava/S-OP-App
echo ============================================
pause
