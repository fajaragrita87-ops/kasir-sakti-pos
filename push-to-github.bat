@echo off
echo ========================================
echo   Kasir Sakti POS - Git Push ke GitHub
echo ========================================
echo.

cd /d "c:\Users\HP\.gemini\antigravity\scratch\kasir-sakti-pos"

echo [1/5] Inisialisasi Git...
git init

echo.
echo [2/5] Menambah semua file...
git add .

echo.
echo [3/5] Commit...
git commit -m "Initial commit: Kasir Sakti POS with PWA support"

echo.
echo [4/5] Set branch ke main...
git branch -M main

echo.
echo [5/5] Hubungkan ke GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/fajaragrita87-ops/kasir-sakti-pos.git

echo.
echo ========================================
echo SEKARANG: Jalankan perintah ini:
echo   git push -u origin main
echo.
echo Saat minta password, gunakan Personal Access Token dari GitHub!
echo ========================================
pause
