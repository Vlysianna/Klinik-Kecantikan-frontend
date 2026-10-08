# 💄 Klinik Kecantikan — Frontend

Aplikasi frontend untuk sistem manajemen **Klinik Kecantikan** berbasis **React + Vite**. Mencakup fitur POS (Point of Sale), manajemen produk, laporan penjualan harian, dan autentikasi pengguna.

---

## 🧰 Tech Stack

| Teknologi | Versi |
|---|---|
| React | ^19.2.8 |
| Vite | ^8.3.0 |
| React Router DOM | ^7.18.4 |
| Tailwind CSS | ^4.3.3 |
| Axios | ^1.20.0 |
| Lucide React | ^1.53.0 |

---

## 📁 Struktur Proyek

```
src/
├── api/            # Fungsi pemanggilan API (axios)
├── assets/         # Aset statis (gambar, ikon)
├── components/     # Komponen UI yang dapat digunakan ulang
├── context/        # React Context (AuthContext, dll.)
├── pages/          # Halaman utama aplikasi
│   ├── LoginPage.jsx
│   ├── PosPage.jsx
│   ├── ProductsPage.jsx
│   └── ReportsPage.jsx
├── utils/          # Fungsi helper/utilitas
├── App.jsx         # Root komponen & routing
├── main.jsx        # Entry point
└── index.css       # Global styles
```

---

## ⚙️ Prerequisites

Pastikan sudah terinstall:
- **Node.js** >= 18.x
- **npm** >= 9.x

---

## 🚀 Setup & Instalasi

### 1. Clone Repository

```bash
git clone <url-repository>
cd Klinik-Kecantikan-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel berikut di `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

> Sesuaikan `VITE_API_BASE_URL` dengan URL backend Laravel yang sedang berjalan.

### 4. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:5173**

---

## 📜 Daftar Script

| Script | Perintah | Keterangan |
|---|---|---|
| Dev Server | `npm run dev` | Jalankan server pengembangan |
| Build | `npm run build` | Build untuk produksi |
| Preview | `npm run preview` | Preview hasil build |
| Lint | `npm run lint` | Jalankan ESLint |




## 📄 Halaman Aplikasi

| Halaman | Route | Keterangan |
|---|---|---|
| Login | `/login` | Autentikasi pengguna |
| POS | `/pos` | Point of Sale transaksi |
| Produk | `/products` | Manajemen produk klinik |
| Laporan | `/reports` | Laporan penjualan harian |