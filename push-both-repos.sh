#!/bin/bash

echo "============================================"
echo "Pushing to BOTH GitHub Repositories"
echo "============================================"
echo ""

echo "Step 1: Adding all files..."
git add -A

echo ""
echo "Step 2: Committing changes..."
git commit -m "Complete UI/UX overhaul - Production Ready

- Modern professional sidebar with Clerk auth
- Responsive header with notifications  
- Dynamic dashboard with real data
- Drag-drop file upload with progress tracking
- Clerk authentication (SignIn/UserButton)
- Error handling (404, error pages)
- Loading states throughout
- Dark theme with glassmorphism
- Production-ready components

Dependencies to install:
- npm install @clerk/nextjs" || echo "Nothing new to commit"

echo ""
echo "============================================"
echo "Pushing to Repo 1: batmandevx/techni"
echo "============================================"
git push origin master

echo ""
echo "============================================"
echo "Pushing to Repo 2: tenchisattava/S-OP-App"
echo "============================================"
git remote get-url sop >/dev/null 2>&1 || git remote add sop https://github.com/tenchisattava/S-OP-App.git
git push sop master

echo ""
echo "============================================"
echo "DONE! Code pushed to both repositories:"
echo ""
echo "1. https://github.com/batmandevx/techni"
echo "2. https://github.com/tenchisattava/S-OP-App"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. npm install @clerk/nextjs"
echo "2. npm run dev"
echo "3. Visit http://localhost:3000"
echo "============================================"
