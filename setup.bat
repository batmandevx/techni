@echo off
echo ==========================================
echo Tenchi S&OP - Setup Script
echo ==========================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Setting up database...
call npx prisma generate
call npx prisma migrate dev --name init
call npx prisma db seed

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser.
echo.
pause
