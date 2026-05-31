# Frontend — Konvensyen Senibina (ReactJS + Bootstrap 5)

> **Projek:** Junior Innovathon 2026 — RTM
> **Vendor:** Stream.My
> **Last updated:** 2026-05-31
> **Stack:** ReactJS 18 (JavaScript / JSX — **tiada TypeScript**) · Vite · Bootstrap 5 · Axios
> **Memenuhi:** Spesifikasi § 3.2.1 (pengasingan front end / back end — SPA), web responsif

Dokumen ini menetapkan **konvensyen wajib** untuk frontend ReactJS. Pasangan kepada [`../backend/README.md`](../backend/README.md) — struktur frontend **mencerminkan** struktur role + versi backend supaya mudah difahami dan diserah ke RTM (§ 3.14).

> ⚠️ **Perubahan keputusan:** Stack asal mencatat *TypeScript*. Diputuskan **2026-05-31** untuk guna **JavaScript (JSX) sahaja** — tiada TS. Lihat `decisions-log.md`. Penjelasan tradeoff & langkah pampasan (PropTypes, Vitest) di § Cadangan.

---

## Ringkasan Keputusan

| # | Konvensyen | Ringkasan |
|---|---|---|
| 1 | **ReactJS (JS sahaja)** | React 18 + Vite + JSX. **Tiada TypeScript.** |
| 2 | **Bootstrap 5** | CSS framework — diimport via SCSS untuk tema RTM |
| 3 | **Layout ikut role** | Layout berbeza untuk Guru / Juri / Admin / Awam |
| 4 | **Mobile vs Desktop berasingan** | Setiap role ada fail layout mobile & desktop yang berasingan |
| 5 | **Axios** | Satu instance terpusat untuk semua panggilan API |
| 6 | **Env config** | Semua konfigurasi dalam `.env` (Vite `VITE_*`) |
| 7 | **Penamaan ikut Laravel** | Folder/fail ikut konvensyen Laravel (lihat § 7) |
| 8 | **Views & helpers ikut Laravel** | `views/` berkumpulan ikut role; fungsi JS berulang dalam `helpers/` |

---

## 1 & 2. React (JS) + Bootstrap 5

- **Build tool:** Vite. Komponen guna sambungan **`.jsx`** (bukan `.tsx`).
- **Tiada TypeScript** — guna **PropTypes** untuk validasi prop (pampasan keselamatan jenis; § Cadangan).
- **Bootstrap 5** diimport sebagai **SCSS** supaya boleh ubah tema (warna RTM, font) — bukan CDN. Ini selaras dengan mockup sedia ada di `proposal-drafts/design-proposals/`.

```scss
// src/styles/app.scss
$primary: #b01116;        // warna jenama RTM (contoh)
@import "bootstrap/scss/bootstrap";
```

```jsx
// src/main.jsx
import "./styles/app.scss";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
```

> Komponen interaktif Bootstrap (modal, dropdown) — guna **react-bootstrap** (pilihan, disyorkan) untuk elak manipulasi DOM langsung. Lihat § Cadangan.

---

## 3 & 4. Layout Ikut Role + Pisah Mobile/Desktop

Setiap role ada layoutnya sendiri, dan **setiap layout dipecah kepada fail mobile & desktop berasingan**. Satu komponen *resolver* memilih varian berdasarkan breakpoint Bootstrap 5.

```
src/layouts/
├── ResponsiveLayout.jsx          ← resolver: pilih Mobile/Desktop ikut breakpoint
├── guru/
│   ├── GuruLayoutDesktop.jsx
│   └── GuruLayoutMobile.jsx
├── juri/
│   ├── JuriLayoutDesktop.jsx
│   └── JuriLayoutMobile.jsx
├── admin/
│   ├── AdminLayoutDesktop.jsx
│   └── AdminLayoutMobile.jsx
└── awam/
    ├── AwamLayoutDesktop.jsx
    └── AwamLayoutMobile.jsx
```

### Resolver berdasarkan breakpoint

```jsx
// src/hooks/useBreakpoint.js — guna breakpoint Bootstrap 5 (lg = 992px)
import { useEffect, useState } from "react";

export function useIsMobile(maxWidth = 992) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < maxWidth);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < maxWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [maxWidth]);
  return isMobile;
}
```

```jsx
// src/layouts/guru/index.jsx — resolver untuk role Guru
import { useIsMobile } from "@/hooks/useBreakpoint";
import GuruLayoutDesktop from "./GuruLayoutDesktop.jsx";
import GuruLayoutMobile from "./GuruLayoutMobile.jsx";

export default function GuruLayout(props) {
  return useIsMobile()
    ? <GuruLayoutMobile {...props} />
    : <GuruLayoutDesktop {...props} />;
}
```

**Peraturan:**
- Fail mobile mengandungi navigasi mudah alih (offcanvas / bottom nav); desktop guna sidebar penuh.
- Layout role dikaitkan dengan route melalui `ProtectedRoute` (§ 8 / router).
- Juri studio (tablet) dan Guru (telefon) adalah kes utama mobile — § scale targets.

---

## 5. Axios — Satu Instance Terpusat

Satu instance Axios dikonfigurasi untuk **Sanctum SPA cookie session** (selaras backend § 6). Semua modul API guna instance ini.

```js
// src/api/http.js
import axios from "axios";
import config from "@/config";

const http = axios.create({
  baseURL: config.apiUrl,          // VITE_API_URL → .../api/v1
  withCredentials: true,           // hantar cookie session Sanctum
  withXSRFToken: true,             // sokong CSRF Laravel
  headers: { Accept: "application/json" },
});

// Sanctum: dapatkan CSRF cookie sebelum login
export const initCsrf = () =>
  axios.get(`${config.baseUrl}/sanctum/csrf-cookie`, { withCredentials: true });

// Interceptor ralat berpusat
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) window.location.assign("/login");     // sesi tamat
    if (status === 419) return initCsrf().then(() => http(err.config)); // CSRF refresh
    return Promise.reject(err);                                // 422 dikendali borang
  }
);

export default http;
```

Modul API **dikumpul ikut role/resource** — mencerminkan struktur controller backend:

```
src/api/
├── http.js
├── auth.js                       ← login, logout, me
├── guru/
│   ├── pendaftaran.js
│   └── pasukan.js
├── juri/
│   └── penjurian.js
├── admin/
│   └── pengguna.js
└── awam/
    └── sijil.js
```

```js
// src/api/guru/pendaftaran.js
import http from "@/api/http";

export const daftarPasukan = (data) => http.post("/guru/pendaftaran", data);
export const senaraiPasukan = () => http.get("/guru/pasukan");
```

**Peraturan:**
- **Tiada** `axios` diimport terus dalam komponen — selalu lalu modul `src/api/*`.
- Endpoint relatif kepada `baseURL` (`/api/v1`) — tiada hardcode domain.
- Ralat validasi 422 dikembalikan kepada borang untuk papar mesej BM.

---

## 6. Konfigurasi via Env

Semua konfigurasi disimpan dalam fail `.env` Vite (prefix wajib **`VITE_`**) dan dibaca melalui satu modul `config`.

```bash
# .env.example  (salin ke .env)
VITE_BASE_URL=https://juniorinnovathon.rtm.gov.my
VITE_API_URL=https://juniorinnovathon.rtm.gov.my/api/v1
VITE_APP_NAME="Junior Innovathon 2026"
VITE_POLL_INTERVAL=5000          # ms — polling markah studio
```

```js
// src/config/index.js — satu sumber kebenaran config
const config = {
  baseUrl: import.meta.env.VITE_BASE_URL,
  apiUrl:  import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  pollInterval: Number(import.meta.env.VITE_POLL_INTERVAL ?? 5000),
};

// validasi awal — gagal pantas jika env hilang
["baseUrl", "apiUrl"].forEach((k) => {
  if (!config[k]) console.error(`[config] VITE_ untuk "${k}" tidak ditetapkan`);
});

export default config;
```

**Peraturan:**
- `.env` **tidak** di-commit; `.env.example` di-commit sebagai templat.
- Komponen baca dari `@/config`, **bukan** `import.meta.env` terus.
- Nilai sensitif (kunci API pihak ketiga) **tidak** diletak di frontend — semua melalui backend.

---

## 7. Penamaan Ikut Konvensyen Laravel

Pemetaan konvensyen Laravel → React (JS):

| Perkara | Konvensyen Laravel | Terjemahan React (projek ini) | Contoh |
|---|---|---|---|
| Kelas (Controller/Model) | **StudlyCase** | Komponen & Layout → **PascalCase** `.jsx` | `GuruLayoutDesktop.jsx`, `Pendaftaran.jsx` |
| Folder views | **snake_case**, ikut domain | Folder `views/` & `layouts/` ikut **role** (huruf kecil) | `views/guru/`, `layouts/juri/` |
| Method / fungsi | **camelCase** | Fungsi & hooks → **camelCase** | `daftarPasukan()`, `useIsMobile()` |
| Fail bukan-kelas (helpers) | huruf kecil | Modul utiliti → huruf kecil `.js` | `http.js`, `pendaftaran.js`, `format.js` |
| Route / URL | **kebab-case** | Path React Router → **kebab-case** | `/juri/penjurian-studio` |
| Pemboleh ubah env | **UPPER_SNAKE** | `VITE_` + **UPPER_SNAKE** | `VITE_API_URL` |
| Pembekal/Context | StudlyCase | Context → **PascalCase** | `AuthContext`, `AuthProvider` |

---

## 8. Views & Fungsi Berulang Ikut Laravel

### Views — berkumpulan ikut role (cermin `resources/views`)

Seperti Laravel mengumpul Blade dalam `resources/views/{domain}/`, React mengumpul "page view" dalam `src/views/{role}/`.

```
src/views/
├── guru/
│   ├── Pendaftaran.jsx
│   ├── PasukanSenarai.jsx
│   └── PasukanButiran.jsx
├── juri/
│   ├── SaringanZon.jsx
│   └── PenjurianStudio.jsx
├── admin/
│   ├── Dashboard.jsx
│   ├── Pengguna.jsx
│   └── Laporan.jsx
└── awam/
    ├── Landing.jsx
    └── SijilSemak.jsx
```

### Fungsi JS berulang — `helpers/` (cermin Laravel helpers)

Laravel meletak fungsi berulang dalam helper (`app/Helpers` / `helpers.php`). React projek ini guna `src/helpers/`, dikumpul ikut domain, fungsi **camelCase**.

```
src/helpers/
├── format.js         ← formatTarikh(), formatMarkah(), formatIc()
├── validation.js     ← semakIc(), semakEmel()
└── string.js         ← potongTeks(), huruf besar pertama
```

```js
// src/helpers/format.js
export const formatTarikh = (iso) =>
  new Intl.DateTimeFormat("ms-MY", { dateStyle: "long" }).format(new Date(iso));

export const formatMarkah = (n) => `${Number(n).toFixed(1)} mata`;
```

> Logik UI boleh-guna-semula → `src/components/`. Logik *stateful* boleh-guna-semula → `src/hooks/`. Fungsi tulen (pure) tanpa state → `src/helpers/`.

---

## Struktur Folder Frontend (Ringkasan)

```
frontend/
├── .env.example                  ← templat (.env tidak di-commit)
├── index.html
├── vite.config.js
├── jsconfig.json                 ← path alias @/  (ganti tsconfig sebab tiada TS)
├── package.json
├── public/
└── src/
    ├── main.jsx                  ← entry
    ├── App.jsx
    ├── styles/app.scss           ← import + tema Bootstrap 5
    ├── config/index.js           ← baca VITE_* env (§6)
    ├── router/                    ← folder route khusus, ikut role (§9, cermin Laravel routes/)
    │   ├── index.jsx              ← gabung semua fail route (cermin routes/api.php)
    │   ├── ProtectedRoute.jsx     ← gate ikut role (cermin role middleware backend)
    │   └── routes/
    │       ├── guru.jsx
    │       ├── juri.jsx
    │       ├── admin.jsx
    │       └── awam.jsx
    ├── layouts/                   ← layout ikut role + mobile/desktop (§3, §4)
    ├── views/                     ← "views" ikut role (§8)
    ├── components/                ← komponen UI boleh guna semula
    ├── api/                       ← modul Axios ikut role (§5)
    ├── helpers/                   ← fungsi JS berulang (§8)
    ├── hooks/                     ← custom hooks (useIsMobile, useAuth)
    ├── context/                   ← AuthContext (sesi Sanctum)
    └── assets/
```

---

## 9. Routing — Ikut Role & Konvensyen Laravel

Route disusun dalam **folder khusus** (`src/router/`), **satu fail per role**, dan digabung di `index.jsx` — sama seperti Laravel mengumpul route dalam `routes/` dan menggabung dengan `Route::prefix()->group()`. URL ikut konvensyen Laravel: **kebab-case** + **resourceful**.

### Struktur folder route

```
src/router/
├── index.jsx              ← gabung semua + prefix role + gate  (cermin routes/api.php)
├── ProtectedRoute.jsx     ← gate ikut role (cermin role middleware backend)
└── routes/
    ├── guru.jsx           ← (cermin routes/api/v1/guru.php)
    ├── juri.jsx
    ├── admin.jsx
    └── awam.jsx
```

### Konvensyen URL — resourceful (ikut Laravel)

URL frontend memetakan corak URI resourceful Laravel. Prefix role, kebab-case, parameter `{x}` → `:x`.

| Tujuan | Laravel URI | Path React Router | View |
|---|---|---|---|
| Senarai | `GET /guru/pasukan` | `/guru/pasukan` | `views/guru/PasukanSenarai.jsx` |
| Borang cipta | `GET /guru/pasukan/create` | `/guru/pasukan/create` | `PasukanCipta.jsx` |
| Butiran (show) | `GET /guru/pasukan/{pasukan}` | `/guru/pasukan/:pasukan` | `PasukanButiran.jsx` |
| Borang edit | `GET /guru/pasukan/{pasukan}/edit` | `/guru/pasukan/:pasukan/edit` | `PasukanEdit.jsx` |
| Tindakan khas | — | `/juri/penjurian-studio` | `PenjurianStudio.jsx` |

> Nota: SPA hanya ada navigasi jenis-GET; `store`/`update`/`destroy` (POST/PUT/DELETE) dibuat melalui modul Axios (§5). Tapi **corak URI dikekalkan** supaya selari dengan backend.

### Fail route per role

Setiap fail mengeksport array *route object* (path relatif) — seperti satu fail route Laravel mengisi satu prefix group. Guna `React.lazy` untuk code-splitting ikut role.

```jsx
// src/router/routes/guru.jsx   (cermin routes/api/v1/guru.php)
import { lazy } from "react";

const GuruDashboard   = lazy(() => import("@/views/guru/Dashboard.jsx"));
const Pendaftaran     = lazy(() => import("@/views/guru/Pendaftaran.jsx"));
const PasukanSenarai  = lazy(() => import("@/views/guru/PasukanSenarai.jsx"));
const PasukanCipta    = lazy(() => import("@/views/guru/PasukanCipta.jsx"));
const PasukanButiran  = lazy(() => import("@/views/guru/PasukanButiran.jsx"));
const PasukanEdit     = lazy(() => import("@/views/guru/PasukanEdit.jsx"));

// path relatif kepada prefix "/guru" (ditetapkan di index.jsx)
export default [
  { index: true,                       element: <GuruDashboard /> },
  { path: "pendaftaran",               element: <Pendaftaran /> },
  { path: "pasukan",                   element: <PasukanSenarai /> },
  { path: "pasukan/create",            element: <PasukanCipta /> },
  { path: "pasukan/:pasukan",          element: <PasukanButiran /> },
  { path: "pasukan/:pasukan/edit",     element: <PasukanEdit /> },
];
```

### Gabungan + prefix role + gate (`index.jsx`)

```jsx
// src/router/index.jsx   (cermin routes/api.php — prefix + middleware group)
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AwamLayout  from "@/layouts/awam";
import GuruLayout  from "@/layouts/guru";
import JuriLayout  from "@/layouts/juri";
import AdminLayout from "@/layouts/admin";
import awamRoutes  from "./routes/awam.jsx";
import guruRoutes  from "./routes/guru.jsx";
import juriRoutes  from "./routes/juri.jsx";
import adminRoutes from "./routes/admin.jsx";

export const router = createBrowserRouter([
  // Awam — awam, tiada auth
  { path: "/", element: <AwamLayout />, children: awamRoutes },

  // Guru / Juri / Admin — prefix + gate ikut role (cermin middleware role:*)
  {
    path: "/guru",
    element: <ProtectedRoute role="guru"><GuruLayout /></ProtectedRoute>,
    children: guruRoutes,
  },
  {
    path: "/juri",
    element: <ProtectedRoute role="juri"><JuriLayout /></ProtectedRoute>,
    children: juriRoutes,
  },
  {
    path: "/admin",
    element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
    children: adminRoutes,
  },

  { path: "/403", element: <Larangan /> },
  { path: "*",    element: <TidakDijumpai /> },
]);
```

### Gate ikut role (`ProtectedRoute.jsx`)

Cermin role middleware backend (§1 backend): tiada sesi → `/login`; role salah → `/403`.

```jsx
// src/router/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PemuatSkeleton />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && !user.roles.includes(role)) return <Navigate to="/403" replace />;

  return children;
}
```

**Peraturan:**
- Prefix role ditetapkan **sekali** di `index.jsx` (bukan diulang dalam setiap fail) — seperti `Route::prefix('guru')` Laravel.
- Layout role jadi *parent element*; view dirender dalam `<Outlet />` layout tersebut.
- Gate route di frontend adalah UX sahaja — **penguatkuasaan sebenar tetap di backend** (role middleware + Sanctum).

---

## Cadangan Saya (tambahan)

Bukan wajib, tapi disyorkan kuat untuk projek skala gov ini (5,000 pengguna serentak, handover ke RTM):

| # | Cadangan | Kenapa |
|---|---|---|
| 1 | **PropTypes** pada setiap komponen | Tanpa TS, ini satu-satunya validasi jenis prop — kurangkan bug masa runtime |
| 2 | **TanStack Query (React Query)** + Axios | Cache server-state, auto-refetch. **`refetchInterval` padan terus dengan polling markah studio** (backend: polling dulu, Reverb kemudian) |
| 3 | **React Router v6** + `ProtectedRoute` | Gate route ikut role — cermin role middleware backend (§1 backend) |
| 4 | **react-bootstrap** | Komponen Bootstrap 5 sebagai React (modal, toast) tanpa sentuh DOM langsung |
| 5 | **ESLint + Prettier** | Kualiti & gaya konsisten — penting untuk handover |
| 6 | **Path alias `@/`** (jsconfig + vite) | Import kemas (`@/api/...`) ganti `../../..` |
| 7 | **Vitest + React Testing Library** | Ujian frontend — selari dengan Pest di backend; boleh masuk gate CI |
| 8 | **Code-splitting ikut role** (`React.lazy`) | Muat bundle role bila perlu — prestasi untuk 5,000 pengguna |
| 9 | **AuthContext** untuk sesi Sanctum | Satu sumber status log masuk + role pengguna |
| 10 | **Toast ralat berpusat** dari interceptor Axios | UX konsisten untuk ralat 401/422/500 |

**Nota tradeoff tiada-TS:** kehilangan keselamatan jenis statik dipampas dengan **PropTypes + ESLint + Vitest + JSDoc**. Sesuai jika pasukan lebih selesa JS atau mahu velositi lebih pantas; namun untuk codebase besar yang diserah ke RTM, TS biasanya beri faedah jangka panjang (refactor selamat, dokumentasi diri). Keputusan akhir JS dihormati — cadangan ini sekadar makluman.

---

## Rujukan Spesifikasi

| Perkara | Spec § |
|---|---|
| Pengasingan front/back end (SPA + API) | § 3.2.1 |
| Web responsif (mobile + desktop) | § 3.2.1 |
| Penjurian markah real-time (polling) | § 3.6.4 |
| Serahan source code ke RTM | § 3.14 |
