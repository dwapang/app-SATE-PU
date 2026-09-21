@echo off
title Sistem Nomor Antrian Creative and Marketing PU
cls
echo ===============================================================
echo   SISTEM NOMOR ANTRIAN: CREATIVE AND MARKETING PU
echo ===============================================================
echo.
echo Menjalankan server antrian multi-device...
echo.
echo Membuka browser lokal: http://localhost:3000
start http://localhost:3000
echo.
echo ===============================================================
echo CATATAN KONEKSI PC LAIN:
echo Buka browser di PC/Laptop/Tablet lain dalam jaringan Wi-Fi/LAN yang sama
echo lalu ketik alamat IP yang tampil di bawah ini:
echo ===============================================================
node server.js
pause
