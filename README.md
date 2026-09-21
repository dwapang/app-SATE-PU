# Release v1.0.1 — Standalone Desktop Executable (.EXE) & Multi-PC Synchronization Edition

Sistem Nomor Antrian **Creative and Marketing PU** kini hadir dengan pembaruan besar! Versi ini mentransformasikan aplikasi antrian berbasis web menjadi **aplikasi desktop mandiri (.EXE)** untuk sistem operasi Windows, dilengkapi sistem sinkronisasi real-time antar-PC kantor dan peluncur otomatis tanpa terminal.

---

## Highlight Pembaruan Utama (What's New)

### 1. Aplikasi Desktop Mandiri (.EXE) Tanpa Terminal
- Tidak perlu lagi membuka Command Prompt / Terminal (`cmd` / `powershell`) atau mengetik URL di browser secara manual.
- Menggunakan wrapper native C# (.NET Framework) yang ringan dan cepat.
- Jendela aplikasi terbuka dalam mode mandiri (*Dedicated App Window*) yang rapi tanpa bilah URL atau tombol navigasi browser.

### 2. Auto-Start Server di Latar Belakang (PC Induk)
- Saat membuka aplikasi di PC Induk (Komputer Server), aplikasi akan **mendeteksi dan menyalakan server Node.js secara otomatis** di latar belakang (*silent mode*) jika belum aktif.
- Dilengkapi aplikasi pengendali **`Pusat Kontrol.exe`** dengan fitur visual status server, deteksi IP LAN otomatis, tombol Start/Stop/Restart, serta salin IP 1-klik.

### 3. Dedicated Operator Meja (Meja 1 s.d Meja 6)
Kini tersedia executable terpisah untuk masing-masing petugas loket/meja pelayanan dengan ikon profil unik:
- `Operator Meja 1 - Fadel.exe` (Layanan Desain & Edit Geotag)
- `Operator Meja 2 - Aji.exe` (Layanan Proposal & Edit Geotag)
- `Operator Meja 3 - Diky.exe` (Layanan Desain, Printing, & Edit Geotag)
- `Operator Meja 4 - Youri.exe` (Layanan Desain & Edit Geotag)
- `Operator Meja 5 - Adit.exe` (Layanan Proposal)
- `Operator Meja 6 - Dian.exe` (Layanan Desain)
*Masing-masing aplikasi langsung mengunci meja operator yang bersangkutan saat dibuka.*

### 4. 1-Click Pembuat Paket Klien Kantor (`Paket-Klien-Kantor.zip`)
- Fitur otomatis untuk mendistribusikan aplikasi ke PC rekan kantor di jaringan Wi-Fi/LAN yang sama.
- Ukuran paket sangat ringan (**~380 KB**), hanya berisi file klien tanpa file database server, sehingga antrian **100% tersinkronisasi ke PC Induk**.
- Alamat IP server utama otomatis terisi saat paket di-generate melalui `Buat Paket untuk Teman Kantor.bat`.

### 5. Self-Healing Network IP Dialog
- Jika alamat IP PC Induk berubah (misal router Wi-Fi berganti), aplikasi klien akan memunculkan jendela dialog ramah pengguna untuk memperbarui IP Server tanpa perlu mengedit file konfigurasi manual.

### 6. 1-Click Pasang Shortcut ke Desktop
- Tersedia script `Buat Shortcut di Desktop.bat` yang otomatis memasang seluruh shortcut aplikasi dengan ikon resmi di Desktop Windows pengguna.

---

## Daftar File Executable & Komponen Rilis

| File Executable / Script | Peruntukan | Fungsi & Peran |
| :--- | :--- | :--- |
| **`Pusat Kontrol.exe`** | Administrator / PC Induk | Dashboard kontrol server, monitor status, info IP LAN, dan kontrol servis. |
| **`Admin Antrian.exe`** | Supervisor / Operator Umum | Panel pemanggil antrian, riwayat tiket, recall, dan kendali antrian penuh. |
| **`Operator Meja 1 - 6.exe`** | Petugas Meja 1 s.d Meja 6 | Panel pemanggilan khusus per petugas loket. |
| **`Kios Tiket.exe`** | Pengunjung / Tablet Kiosk | Layar sentuh mandiri pengambilan nomor tiket antrian. |
| **`Layar TV.exe`** | Monitor Ruang Tunggu | Display nomor antrian live, jam digital, running text, dan suara bel otomatis. |
| **`Buat Shortcut di Desktop.bat`** | Semua Pengguna | Membuat shortcut semua aplikasi ke Desktop Windows secara instan. |
| **`Buat Paket untuk Teman Kantor.bat`** | Administrator | Mengemas paket distribusi klien khusus komputer teman kantor. |
| **`Hentikan Server.bat`** | Administrator | Menghentikan proses server Node.js di latar belakang. |

---

## Kategori Layanan Antrian

1. **Kategori A — Desain**: Desain grafis, visual branding, materi promosi, & konten media sosial (Estimasi: 15 menit).
2. **Kategori B — Printing**: Cetak digital, merchandise, banner, poster, & material promosi fisik (Estimasi: 10 menit).
3. **Kategori C — Proposal**: Penyusunan & asistensi proposal program, sponsorship, & kerjasama (Estimasi: 20 menit).
4. **Kategori D — Edit Geotag**: Edit koordinat & geotagging foto dokumentasi (Tarif: Rp 5.000/pcs - Bayar Cash, Estimasi: 10 menit).

---

## Persyaratan Sistem (System Requirements)

- **Sistem Operasi**: Windows 10 / Windows 11 (64-bit / 32-bit).
- **Komponen Windows**: .NET Framework 4.5 atau lebih baru (sudah bawaan Windows 10/11).
- **PC Induk (Server)**: Memerlukan Node.js (v16+) terpasang di komputer server utama.
- **PC Klien / Meja Teman**: **Tidak memerlukan Node.js** (cukup ekstrak paket klien dan jalankan aplikasi).

---

## Panduan Singkat Penggunaan (Quick Start)

### Untuk PC Induk (Server Utama):
1. Unduh file rilis dan ekstrak ke folder kerja Anda.
2. Jalankan **`Pusat Kontrol.exe`** untuk memastikan status server aktif (`RUNNING`).
3. Jalankan **`Buat Shortcut di Desktop.bat`** untuk kemudahan akses dari Desktop.

### Untuk Komputer Klien (Rekan Kantor):
1. Di PC Induk, jalankan **`Buat Paket untuk Teman Kantor.bat`**.
2. Kirim file **`Paket-Klien-Kantor.zip`** ke PC rekan kantor.
3. Rekan kantor cukup mengekstrak ZIP dan langsung membuka aplikasi sesuai tugasnya (misal: `Operator Meja 1 - Fadel.exe`).

---

> [!NOTE]
> Untuk panduan konfigurasi lanjutan (`config.ini`) dan deployment jaringan yang lebih detail, silakan baca dokumen [PANDUAN-DEPLOYMENT.md](PANDUAN-DEPLOYMENT.md).
