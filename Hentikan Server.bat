@echo off
title Hentikan Server Antrian
cls
echo ===============================================================
echo   MENGHENTIKAN SERVER SISTEM NOMOR ANTRIAN
echo ===============================================================
echo.
echo Menutup proses Node.js server antrian di latar belakang...
echo.

taskkill /F /FI "WINDOWTITLE eq *node*server.js*" 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo ===============================================================
echo Server antrian telah berhasil dihentikan.
echo ===============================================================
echo.
pause
