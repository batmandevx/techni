@echo off
echo ============================================
echo FORCE PUSH TO BOTH REPOSITORIES
echo ============================================
echo.

echo [1/5] Configuring git user (if not set)...
git config user.email "dev@tenchi.com" 2>nul
git config user.name "Tenchi Dev" 2>nul

echo.
echo [2/5] Adding ALL files including new ones...
git add -A

echo.
echo [3/5] Creating commit...
git commit -m "MAJOR UPDATE: Production-ready UI/UX with Clerk Auth

COMPLETE OVERHAUL:
- Modern professional sidebar (collapsible, mobile-responsive)
- Dynamic header with search, notifications, Clerk UserButton
- Fully functional dashboard with stats and recent uploads
- Drag-drop file upload with progress tracking
- Clerk authentication integration (SignIn, UserButton, middleware)
- Error handling (404, error boundaries)
- Loading states throughout
- Dark theme with glassmorphism effects
- Responsive design (mobile, tablet, desktop)
- Excel parser for Bisk Farm, NILONS, Catch, WeikField formats
- SmartOrder engine with AI column mapping
- Production-ready components

NEW FILES:
- src/components/layout/sidebar.tsx
- src/components/layout/header.tsx  
- src/components/ui/loading-screen.tsx
- src/app/auth/page.tsx (Clerk SignIn)
- src/app/error.tsx
- src/app/not-found.tsx
- src/app/loading.tsx

REQUIREMENTS:
npm install @clerk/nextjs" 2>&1

echo.
echo [4/5] Pushing to FIRST repo (batmandevx/techni)...
git push origin master --force 2>&1

echo.
echo [5/5] Pushing to SECOND repo (tenchisattava/S-OP-App)...
git remote get-url sop >nul 2>&1
if errorlevel 1 (
  echo Adding remote 'sop'...
  git remote add sop https://github.com/tenchisattava/S-OP-App.git
)
git push sop master --force 2>&1

echo.
echo ============================================
echo PUSH COMPLETE!
echo ============================================
echo.
echo Repository 1: https://github.com/batmandevx/techni
echo Repository 2: https://github.com/tenchisattava/S-OP-App
echo.
echo NEXT STEPS:
echo 1. npm install @clerk/nextjs
echo 2. npm run dev
echo 3. Open http://localhost:3000
echo ============================================
pause
