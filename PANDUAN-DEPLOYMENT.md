# 🚀 Panduan Deployment & Penggunaan Aplikasi Executable (.EXE)
### Sistem Nomor Antrian — Creative and Marketing PU

Sistem nomor antrian ini kini telah dilengkapi dengan file aplikasi mandiri (**Executeable `.exe`**) untuk masing-masing peran, sehingga operator, petugas kios, dan layar TV dapat membukanya secara mudah tanpa perlu membuka terminal perintah atau browser secara manual.

---

## 📦 Daftar File Aplikasi Executable

| File Executable | Peruntukan | Deskripsi & Fitur |
| :--- | :--- | :--- |
| **`Operator Antrian.exe`** | Petugas Loket / Meja Pelayanan | Membuka panel pemanggilan antrian, recall, selesai layanan, dan timer durasi kerja. |
| **`Kios Tiket.exe`** | Pengunjung (Kios Sentuh / Tablet) | Membuka layar sentuh pengambilan tiket (Desain, Printing, Proposal) secara mandiri. |
| **`Layar TV.exe`** | Monitor Ruang Tunggu Publik | Membuka tampilan monitor TV (nomor antrian live, status meja, jam digital, ticker informasi, & suara bel otomatis). |
| **`Pusat Kontrol.exe`** | Administrator / PC Induk | Dashboard pengendali status server, info IP jaringan Wi-Fi/LAN, dan tombol satu-klik pasang shortcut desktop. |

---

## ⚡ Cara Penggunaan Cepat (Quick Start)

### 1. Di PC Induk (Komputer Utama Server)
1. Cukup klik ganda salah satu aplikasi di atas, misalnya **`Operator Antrian.exe`** atau **`Pusat Kontrol.exe`**.
2. **Otomatis Jalankan Server**: Jika server belum aktif, aplikasi akan **otomatis menyalakan server Node.js di latar belakang** tanpa jendela hitam cmd.
3. Aplikasi akan langsung terbuka di jendela mandiri (*Dedicated Desktop App Window*) tanpa bilah URL atau tombol browser yang membingungkan.

### 2. Memasang Ikon Pintas ke Desktop Windows (Desktop Shortcut)
- Klik dua kali file **`Buat Shortcut di Desktop.bat`** (atau tekan tombol **Pasang Shortcut** di dalam `Pusat Kontrol.exe`).
- Empat shortcut resmi dengan logo dan warna khas perannya akan otomatis muncul di Desktop Windows Anda.

---

## 🌐 Cara Mendistribusikan ke PC Teman Kantor (Sinkronisasi Multi-PC)

### ⚠️ Mengapa Tidak Boleh Meng-copy Seluruh Folder Begitu Saja?
Jika Anda meng-copy seluruh folder utama ke PC teman, folder tersebut masih memiliki file `server.js` dan pengaturan `Host = localhost`. Akibatnya:
- PC teman akan mencoba menyalakan **server sendiri secara terpisah** (atau muncul error jika Node.js belum terpasang).
- Database antrian mereka menjadi **terpisah/terisolasi**, sehingga tidak akan sinkron dengan antrian di PC Anda!

---

### ✅ Solusi Resmi: Gunakan "Paket Klien Kantor" (Otomatis & 100% Sinkron)

Kami telah menyiapkan fitur pembuat paket distribusi otomatis yang hanya berisi file klien yang ringan (~160 KB) dan sudah otomatis disetel ke alamat IP PC Anda (**10.1.18.32**):

#### Langkah 1: Buat Paket Klien di PC Anda
- Klik dua kali file **`Buat Paket untuk Teman Kantor.bat`** (atau tekan tombol **📦 Buat Paket Klien Kantor** di dalam `Pusat Kontrol.exe`).
- Script akan otomatis membuat file arsip: **`Paket-Klien-Kantor.zip`**.

#### Langkah 2: Kirim File ZIP ke Teman Anda
- Kirim file **`Paket-Klien-Kantor.zip`** ke teman kantor Anda (via WhatsApp Web, Telegram, Flashdisk, atau Shared Folder jaringan).

#### Langkah 3: Teman Anda Langsung Menggunakan
1. Teman Anda cukup mengekstrak file ZIP tersebut di PC/laptop mereka.
2. Klik dua kali aplikasi yang dibutuhkan:
   - **`Operator Antrian.exe`** — Khusus meja/loket pelayanan (PIN: `1234`).
   - **`Kios Tiket.exe`** — Khusus pengambilan tiket antrian pengunjung.
   - **`Layar TV.exe`** — Khusus monitor display antrian.
3. Semua nomor antrian, panggilan suara, dan tiket baru akan **langsung tersinkron secara real-time ke PC Anda**!

*(Opsional: Teman Anda juga dapat mengklik `Buat Shortcut di Desktop.bat` agar ikon aplikasi langsung muncul di layar Desktop mereka).*

---

### 💡 Fitur Pemulihan Mandiri (Self-Healing IP Dialog):
Jika suatu saat alamat IP PC Anda berubah (misal karena ganti router Wi-Fi), teman Anda tidak perlu bingung:
- Saat aplikasi di PC teman dibuka dan gagal menemukan server, akan muncul jendela bantuan:  
  *"Komputer ini adalah Klien Antrian. Masukkan Alamat IP Komputer Server Utama:"*
- Teman Anda cukup mengetik alamat IP baru PC Anda dan klik **Hubungkan**, maka pengaturan akan otomatis tersimpan!

---

### 📱 Opsi Alternatif: Buka Langsung Lewat Browser (Tanpa Install Apa pun)
Di Tablet/HP/Laptop mana pun yang terhubung ke Wi-Fi yang sama, buka browser dan ketik:
- Untuk Kios: `http://10.1.18.32:3000/?mode=kiosk`
- Untuk Layar TV: `http://10.1.18.32:3000/?mode=tv`
- Untuk Operator: `http://10.1.18.32:3000/?mode=operator` *(PIN Petugas: `1234`)*

---

## ⚙️ Kustomisasi Pengaturan (`config.ini`)

Buka file `config.ini` untuk mengatur:
- **`DefaultDesk`**: Isi dengan nomor meja (misal `DefaultDesk = 1`) agar Operator Antrian.exe langsung memilih Meja 1 saat dibuka.
- **`Mode`**: Atur ke `kiosk` jika ingin jendela terkunci layar penuh tanpa tombol keluar (ideal untuk tablet kios publik).
- **`StartMaximized`**: `true` untuk langsung memaksimalkan ukuran jendela.

---

## 🛑 Cara Mematikan Server

Jika jam operasional kantor telah selesai dan Anda ingin mematikan server:
- Buka **`Pusat Kontrol.exe`** lalu klik tombol **`⏹️ Hentikan Server`**, ATAU
- Klik ganda file **`Hentikan Server.bat`**.
