@echo off
title Pembuat Paket Distribusi Klien untuk Teman Kantor
cls
echo ===============================================================
echo   PEMBUAT PAKET APLIKASI KLIEN (UNTUK TEMAN KANTOR)
echo   Sistem Nomor Antrian Creative and Marketing PU
echo ===============================================================
echo.
echo Sedang mendeteksi IP jaringan PC Anda dan mengemas aplikasi...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\create_client_package.ps1"

echo.
echo ===============================================================
echo File "Paket-Klien-Kantor.zip" telah dibuat!
echo.
echo CARA MENDISTRIBUSIKAN:
echo 1. Kirim file "Paket-Klien-Kantor.zip" ke teman Anda (lewat WA/Flashdisk/LAN).
echo 2. Teman Anda tinggal mengekstrak file ZIP tersebut di PC mereka.
echo 3. Teman Anda langsung membuka "Operator Antrian.exe" atau "Kios Tiket.exe".
echo    (Semua antrian akan otomatis sinkron langsung ke PC Anda!).
echo ===============================================================
echo.
pause
