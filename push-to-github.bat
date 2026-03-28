@echo off
echo ============================================
echo Pushing Tenchi S&OP to GitHub
echo ============================================
echo.

echo Step 1: Adding all files...
git add -A

echo.
echo Step 2: Checking status...
git status --short

echo.
echo Step 3: Committing changes...
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

echo.
echo Step 4: Pushing to GitHub...
git push origin master

echo.
echo ============================================
echo Done! Check https://github.com/batmandevx/techni
echo ============================================
pause
