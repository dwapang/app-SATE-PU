@echo off
title Buat Shortcut Desktop - Sistem Nomor Antrian
cls
echo ===============================================================
echo   PEMBUATAN SHORTCUT DESKTOP: SISTEM NOMOR ANTRIAN
echo ===============================================================
echo.
echo Sedang membuat 4 shortcut resmi di Desktop Windows Anda...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\create_shortcuts.ps1"

echo.
echo ===============================================================
echo SELESAI! Shortcut telah terpasang di Desktop Anda.
echo Anda kini dapat langsung mengklik dua kali shortcut tersebut
echo untuk membuka masing-masing aplikasi kapan saja.
echo ===============================================================
echo.
pause
