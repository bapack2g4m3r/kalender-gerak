# Kalender Gerak 🏃

> Aplikasi web pemantau aktivitas fisik harian untuk siswa SD Indonesia.
> Mendukung rekomendasi WHO (60 menit/hari) dan program UKS.

---

## Fitur

- 🏃 **10 Jenis Aktivitas** dengan perhitungan poin otomatis
- 📊 **Dashboard Siswa** dengan progress lingkaran animasi
- 🏆 **Sistem Badge & Gamifikasi** (streak, poin, penghargaan)
- 📅 **Riwayat Kalender Bulanan** dengan color coding
- 👩‍🏫 **Dashboard Guru** dengan monitoring real-time
- 📈 **Laporan Kelas** dengan Chart.js
- 📱 **Mobile-first** + responsif desktop
- 🌐 **Multi-user publik** via Supabase

---

## Setup Supabase (Wajib)

### Langkah 1 — Buat Akun & Project

1. Buka [supabase.com](https://supabase.com) dan daftar gratis
2. Klik **"New Project"**
3. Isi nama project: `kalender-gerak`
4. Pilih region yang dekat (Singapore)
5. Buat password database (simpan!)
6. Tunggu project selesai dibuat (~2 menit)

### Langkah 2 — Dapatkan API Key

1. Masuk ke **Settings → API**
2. Salin **Project URL** (contoh: `https://abc123.supabase.co`)
3. Salin **anon public** key

### Langkah 3 — Setup Database

1. Di Supabase, masuk ke **SQL Editor**
2. Klik **"New query"**
3. Copy-paste isi file `sql/schema.sql` → Klik **Run**
4. Buat query baru, copy-paste isi `sql/seed.sql` → Klik **Run**
5. ✅ Database siap dengan 48 siswa dummy!

### Langkah 4 — Konfigurasi App

Buka file `js/config.js` dan ganti:

```javascript
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';
```

Dengan nilai yang Anda salin di Langkah 2.

### Langkah 5 — Buka Aplikasi

Buka `index.html` di browser. Selesai! 🎉

---

## Akun Demo

### Siswa
| NIS    | Kata Sandi | Nama              | Kelas |
|--------|-----------|-------------------|-------|
| 100001 | 1234      | Ahmad Rizki Pratama | 1A  |
| 400001 | 1234      | Yoga Pratama Santoso | 4A |
| 600001 | 1234      | Ogi Setiawan Putra | 6A   |
| *(dan 45 siswa lainnya)* | 1234 | | |

### Guru
| NIP   | Kata Sandi | Nama                    |
|-------|-----------|-------------------------|
| GR001 | guru123   | Bapak Ahmad Fauzi, S.Pd |
| GR002 | guru123   | Ibu Sari Dewi, S.Pd     |

---

## Sistem Poin

| Aktivitas    | 15 mnt | 30 mnt | 45 mnt | 60 mnt |
|-------------|--------|--------|--------|--------|
| Jalan Kaki  | 10     | 20     | 30     | 40     |
| Lari        | 15     | 30     | 45     | 60     |
| Sepak Bola  | 20     | 40     | 60     | 80     |
| Bersepeda   | 15     | 30     | 45     | 60     |
| Bulu Tangkis| 15     | 30     | 45     | 60     |
| Senam       | 12     | 24     | 36     | 48     |
| Lompat Tali | 20     | 40     | 60     | 80     |
| Berenang    | 25     | 50     | 75     | 100    |

**Target harian: 60 poin** (≈ 60 menit aktivitas sedang)

---

## Struktur File

```
Kalender Gerak/
├── index.html          # SPA utama (10 screens)
├── css/
│   └── main.css        # Design system lengkap
├── js/
│   ├── config.js       # Supabase URL & key ← EDIT INI
│   ├── utils.js        # Helper functions
│   ├── data.js         # Supabase data operations
│   ├── auth.js         # Login/logout
│   ├── student.js      # Screen siswa
│   ├── teacher.js      # Screen guru
│   └── app.js          # Router & controller
├── sql/
│   ├── schema.sql      # Database schema
│   └── seed.sql        # Data dummy 48 siswa
└── assets/
    └── images/
        └── kagi.jpg    # Maskot Kagi si Tupai
```

---

## Hosting (Opsional)

Untuk akses publik, Anda bisa deploy ke:

- **Netlify**: Drag & drop folder ini ke [netlify.com/drop](https://netlify.com/drop)
- **GitHub Pages**: Upload ke GitHub repo, aktifkan Pages
- **Vercel**: Connect GitHub repo

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Halaman loading terus | Periksa `js/config.js` sudah diisi |
| "NIS salah" padahal benar | Jalankan `sql/seed.sql` terlebih dahulu |
| Chart tidak muncul | Pastikan koneksi internet aktif (Chart.js CDN) |
| Data tidak tersimpan | Periksa RLS policies di Supabase |

---

## Teknologi

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: [Supabase](https://supabase.com) (PostgreSQL + REST API)
- **Charts**: [Chart.js](https://chartjs.org) v4
- **Font**: [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts)
- **Maskot**: Kagi si Tupai 🐿️

---

*Dibuat untuk mendukung kesehatan dan aktivitas fisik anak SD Indonesia* 🇮🇩
