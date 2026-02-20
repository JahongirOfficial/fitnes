# FitnessPro CRM — CLAUDE.md

## Loyiha haqida

FitnessPro — sport zal boshqaruv tizimi (CRM). A'zolar, tashriflar, to'lovlar, mahsulotlar, hisobotlar va sozlamalarni boshqaradi. Til: **o'zbek** (uz-UZ).

## Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, globals.css (custom animatsiyalar) |
| State | Zustand (auth), TanStack React Query (server state) |
| Backend | Express.js 4, Node.js (ES Modules) |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Icons | Lucide React |
| Charts | Recharts |
| QR | qrcode (server yaratish), html5-qrcode (client skanerlash) |

## Loyiha tuzilishi

```
fitnes/
├── server/                     # Express.js backend (port 5000)
│   └── src/
│       ├── server.js           # Express app setup
│       ├── seed.js             # DB seeder
│       ├── middleware/
│       │   ├── auth.js         # verifyToken JWT middleware
│       │   └── upload.js       # Multer image upload
│       ├── models/             # Mongoose schemalar
│       │   ├── User.js         # Admin/cashier/manager
│       │   ├── Member.js       # A'zolar + subscription + qrCode
│       │   ├── Product.js      # Mahsulotlar (drink, chocolate...)
│       │   ├── Visit.js        # Kirish/chiqish qaydlari
│       │   ├── Payment.js      # Daromad/xarajat
│       │   └── Settings.js     # Zal sozlamalari
│       ├── routes/             # API endpointlar
│       │   ├── auth.js         # /api/auth/*
│       │   ├── members.js      # /api/members/*
│       │   ├── visits.js       # /api/visits/*
│       │   ├── products.js     # /api/products/*
│       │   ├── payments.js     # /api/payments/*
│       │   ├── reports.js      # /api/reports/*
│       │   ├── dashboard.js    # /api/dashboard
│       │   └── settings.js     # /api/settings
│       └── public/uploads/     # Rasm saqlash
│
├── src/                        # Next.js frontend (port 3000)
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts)
│   │   ├── page.tsx            # Landing sahifa (public)
│   │   ├── providers.tsx       # QueryClientProvider + ToastProvider
│   │   ├── globals.css         # Tailwind + custom CSS animatsiyalar
│   │   ├── (auth)/login/       # Login sahifa
│   │   └── (dashboard)/        # Himoyalangan sahifalar
│   │       ├── layout.tsx      # Sidebar + Header layout
│   │       ├── dashboard/      # Bosh panel (KPI, chartlar)
│   │       ├── members/        # A'zolar CRUD + [id] sahifa
│   │       ├── visits/         # Tashriflar + QR scanner
│   │       ├── cashier/        # Kassa (to'lov + sotuv)
│   │       ├── products/       # Mahsulotlar boshqaruvi
│   │       ├── reports/        # Hisobotlar
│   │       └── settings/       # Sozlamalar
│   ├── components/
│   │   ├── layout/             # Sidebar.tsx, Header.tsx
│   │   ├── ui/                 # Modal.tsx, Toast.tsx, Skeleton.tsx
│   │   ├── members/            # MemberModal.tsx
│   │   ├── cashier/            # PaymentModal.tsx
│   │   ├── products/           # ProductModal.tsx, SellModal.tsx
│   │   └── visits/             # QrScannerModal.tsx
│   ├── lib/
│   │   ├── api.ts              # ApiClient sinfi (fetch wrapper)
│   │   ├── hooks.ts            # React Query hooklar (barcha CRUD)
│   │   ├── utils.ts            # formatCurrency, cn, formatDate...
│   │   ├── qr-utils.ts         # parseQrData, downloadQrCode, printQrCard
│   │   ├── useDebounce.ts      # Debounce hook
│   │   └── categoryIcons.tsx   # Mahsulot kategoriya ikonlari
│   ├── store/
│   │   └── auth.ts             # Zustand: user, token, login, logout
│   ├── types/
│   │   └── index.ts            # TypeScript interfeyslar
│   └── data/                   # Statik ma'lumotlar
│
├── package.json                # Root: frontend + concurrently scripts
├── next.config.ts              # API rewrites -> localhost:5000
├── tsconfig.json               # @/* path alias
└── .env.local                  # NEXT_PUBLIC_API_URL
```

## Buyruqlar

```bash
npm run dev              # Frontend (3000) + Backend (5000) parallel
npm run dev:frontend     # Faqat Next.js
npm run dev:backend      # Faqat Express server
npm run build            # Production build (frontend + backend)
npm run seed             # DB ga boshlang'ich ma'lumot
npm run lint             # ESLint
```

## Muhit o'zgaruvchilari

**`.env.local`** (frontend):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**`server/.env`** (backend):
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=30d
```

## Arxitektura qoidalari

### Backend
- Barcha routelar `verifyToken` middleware bilan himoyalangan (auth.js dan tashqari)
- ES Modules (`import/export`) ishlatiladi — `require` emas
- Model fayllar `.js` kengaytmali, `export default` bilan
- Route fayldagi Express parametr routelar (`/:id`) statik routelardan (`/bulk-qr`) KEYIN joylashishi kerak
- Rasm yuklash multer orqali `server/public/uploads/` ga

### Frontend
- `"use client"` — barcha interaktiv komponentlarda majburiy
- API so'rovlar `src/lib/api.ts` dagi `ApiClient` sinfi orqali
- Server state → React Query hooklar (`src/lib/hooks.ts`)
- Auth state → Zustand (`src/store/auth.ts`)
- UI komponentlar `src/components/ui/` da
- Sahifa komponentlar `src/app/(dashboard)/` da
- SSR bilan ishlamaydigan kutubxonalar → `next/dynamic` bilan import (`ssr: false`)
- Toast xabarlari `useToast()` hook orqali
- Ikonlar faqat `lucide-react` dan

### Stillar
- Tailwind utility classlar asosiy
- Custom animatsiyalar `globals.css` da (`fadeIn`, `slideIn`, `scaleIn`, `scanLine`, `shimmer`)
- `cn()` funksiya — class birlashtirish (`src/lib/utils.ts`)
- Rang sxemasi: emerald (faol), blue (asosiy), amber/orange (ogohlantirish), red (xato), purple (info)

### React Query konvensiyalar
- Query key: `["resource", params]` — masalan `["members", { search, page }]`
- Mutation `onSuccess` da tegishli keshlarni `invalidateQueries` bilan yangilash
- `visits` o'zgarganda `dashboard` ham invalidate qilinadi

### Tillashtirish
- Barcha UI matni **o'zbek tilida**
- Valyuta: `UZS` (so'm) — `toLocaleString("uz-UZ")`
- Sana: `uz-UZ` formati
- HTML entities: `&apos;` → o'zbek apostrofi (`'`)

## Ma'lumotlar modeli (asosiy)

- **Member**: `fullName`, `phone`, `email`, `status` (active/expired/inactive), `subscription` (type/start/end/price), `qrCode` (base64 data URL)
- **Visit**: `memberId`, `memberName`, `checkInTime`, `checkOutTime`, `duration` (daqiqa)
- **Payment**: `type` (income/expense), `category`, `amount`, `paymentMethod` (cash/card/transfer), `memberId`
- **Product**: `name`, `category` (drink/chocolate/cocktail/yogurt), `price`, `costPrice`, `stockQuantity`, `image`
- **User**: `username`, `password` (hashed), `role` (admin/cashier/manager), `fullName`
- **Settings**: `gymName`, `pricing`, `notifications`, `workingHours`

## Komponent yaratish bo'yicha qoidalar

1. Modal komponentlar `isOpen`, `onClose` proplari bilan
2. Form validatsiya frontend da (required fieldlar), server tomonida ham tekshiruv
3. Loading holati → `Skeleton` komponent yoki `Loader2` spinner
4. Xatolar → `toast("error", message)` orqali ko'rsatish
5. Muvaffaqiyat → `toast("success", message)` orqali ko'rsatish
6. Responsive: mobile-first, `sm:`, `lg:` breakpointlar

## QR kod tizimi

- **Yaratish**: Server (`qrcode` kutubxonasi) → `JSON.stringify({ id, name })` → base64 PNG → `Member.qrCode`
- **Skanerlash**: Frontend (`html5-qrcode`) → kamera → `parseQrData()` → memberId → checkin/checkout API
- **Yuklab olish**: `downloadQrCode(dataUrl, name)` → PNG fayl
- **Chop etish**: `printQrCard(dataUrl, name, phone)` → yangi oyna → FitnessPro karta → `window.print()`
