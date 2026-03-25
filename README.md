## Project Structure
```bash
.
├── src/                          # Folder utama yang menyimpan source code aplikasi
│   ├── app/                      # Folder khusus untuk routing (Next.js App Router)
│   │   ├── auth/
│   │   │   └── login/            # Halaman login "/auth/login"
│   │   │       └── page.tsx      # Komponen halaman login
│   │   ├── page.tsx              # Halaman utama ("/") dari aplikasi
│   │   └── layout.tsx            # Layout root global yang membungkus semua halaman
│
│   ├── components/               # Komponen UI yang dapat digunakan secara global
│   │   ├── fragments/            # Komponen gabungan dari beberapa UI
│   │   ├── layout/               # Komponen layout (misalnya Header, Sidebar, Footer)
│   │   ├── providers/            # Provider context, theming, atau state global lainnya
│   │   └── ui/                   # Komponen kecil dan independen (Button, Input, dll)
│   ├── config/                   # Konfigurasi global aplikasi
│   │   └── axios.ts              # Konfigurasi instance axios untuk HTTP request
│
│   ├── features/                 # Modul-modul fitur berdasarkan domain
│   │   └── auth/                 # Modul untuk fitur autentikasi
│   │       ├── components/       # Komponen khusus untuk fitur auth
│   │       ├── services/         # API call atau logic komunikasi ke backend
│   │       ├── types/            # Tipe data khusus untuk auth
│   │       └── authSlice.ts      # Redux slice untuk mengatur state auth (optional)
│   │
│   ├── middlewares/              # Middleware
│
│   ├── navigation/               # Folder Navigasi
│   │   └── item/                 # Item Navigasi
│   │       └── general.tsx       # Navigasi group general
│   │       └── prd.tsx           # Navgiasi group prd
│   │   └── index.ts              # Registerer navigasi
│
│   ├── lib/                      # Utility/library umum seperti formatter
│   │   └── formatDate.ts         # Fungsi untuk memformat tanggal
│
│   ├── store/                    # Konfigurasi dan utilitas state management Redux
│   │   ├── hook.ts               # Custom hook seperti useAppSelector dan useAppDispatch
│   │   └── index.ts              # Setup dan konfigurasi root store Redux
│
│   ├── types/                    # Tipe data global untuk seluruh aplikasi
│   │   └── form.types.ts         # Tipe data terkait form-form dalam aplikasi
│
│   └── utils/                    # Fungsi bantu (helper function)
│
└── public/                       # Folder untuk static asset (gambar, font, dll)
```

## 🛠️ 1. Setup & Installation

### Copy the environment template and configure your `.env`

```bash
cp src/.env.example .env
```

Update the `NEXT_PUBLIC_API_URL` in your `.env` file based on your setup:

```yaml
NEXT_PUBLIC_API_URL=https://myapp.co/api/
```

## 🐳 Docker Development

### Run application with Docker in seconds:

```bash
# Build the application image
make build

# Start the containers
make run

# View application logs
make logs

# See all available commands
make help
```

## 💻 Local Development

```bash
cd src
npm install
npm run dev
```

App berjalan di <http://localhost:3000/>
