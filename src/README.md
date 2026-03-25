## Project Structure

```bash
.
├── src/                           # Folder utama yang menyimpan seluruh source code aplikasi
│   ├── app/                       # Folder khusus untuk routing (Next.js App Router)
│   │   ├── auth/
│   │   │   └── login/            # Halaman login yang dapat diakses melalui "/auth/login"
│   │   │       └── page.tsx      # Komponen halaman login
│   │   ├── page.tsx              # Halaman utama ("/") dari aplikasi
│   │   └── layout.tsx            # Layout root global yang membungkus semua halaman
│
│   ├── components/               # Komponen UI yang dapat digunakan ulang di berbagai bagian aplikasi
│   │   ├── fragments/            # Komponen gabungan dari beberapa UI (misalnya form lengkap, kartu info)
│   │   ├── layout/               # Komponen layout (misalnya Header, Sidebar, Footer)
│   │   ├── providers/            # Provider untuk context, theming, atau state global lainnya
│   │   └── ui/                   # Komponen kecil dan independen (Button, Input, Modal, dll)
│
│   ├── config/                   # Konfigurasi global aplikasi
│   │   └── axios.ts              # Konfigurasi instance axios untuk HTTP request
│
│   ├── features/                 # Modul-modul fitur berdasarkan domain (struktur feature-based)
│   │   └── auth/                 # Modul untuk fitur autentikasi
│   │       ├── components/       # Komponen khusus untuk fitur auth (misalnya form login/register)
│   │       ├── hooks/            # Custom hook terkait fitur auth
│   │       ├── services/         # API call atau logic komunikasi ke backend
│   │       ├── types/            # Tipe data khusus untuk auth
│   │       └── authSlice.ts      # Redux slice untuk mengatur state auth
│   │
│   ├── middlewares/              # Middlewares
│
│   ├── lib/                      # Utility/library umum seperti formatter, validator, dsb
│   │   └── formatDate.ts         # Fungsi untuk memformat tanggal
│
│   ├── store/                    # Konfigurasi dan utilitas state management Redux
│   │   ├── hook.ts               # Custom hook seperti useAppSelector dan useAppDispatch
│   │   └── index.ts              # Setup dan konfigurasi root store Redux
│
│   ├── types/                    # Tipe data global untuk seluruh aplikasi
│   │   └── form.types.ts         # Tipe data terkait form-form dalam aplikasi
│
│   └── utils/                    # Fungsi bantu (helper function) yang tidak masuk ke `lib` atau `features`
│
└── public/                       # Folder untuk static asset (gambar, font, favicon, dll)
```

## Installation

1. Clone Project

   ```javascript
   git clone <repo>
   cd <repo>
   ```

2. Install Dependecies

   ```javascript
   npm install
   ```

3. Run the development server:

   ```javascript
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

   Open <http://localhost:3000> with your browser to see the result.
