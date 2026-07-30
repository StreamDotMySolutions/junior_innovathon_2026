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
| 3 | **Layout ikut role** | Layout berbeza untuk 7 role (Mentor / Participant / Jury / Controller / Broadcaster / Admin / Public) |
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
├── mentor/
│   ├── MentorLayoutDesktop.jsx
│   └── MentorLayoutMobile.jsx
├── participant/
│   ├── ParticipantLayoutDesktop.jsx
│   └── ParticipantLayoutMobile.jsx
├── jury/
│   ├── JuryLayoutDesktop.jsx
│   └── JuryLayoutMobile.jsx
├── controller/                  ← studio (desktop/tablet)
│   ├── ControllerLayoutDesktop.jsx
│   └── ControllerLayoutMobile.jsx
├── broadcaster/                 ← overlay OBS: kanvas tetap, TIADA split mobile
│   └── BroadcasterLayout.jsx
├── admin/
│   ├── AdminLayoutDesktop.jsx
│   └── AdminLayoutMobile.jsx
└── public/
    ├── PublicLayoutDesktop.jsx
    └── PublicLayoutMobile.jsx
```

> **Broadcaster** dikecualikan daripada peraturan split mobile/desktop (§4): ia dirender sebagai *browser source* dalam OBS pada saiz kanvas tetap (cth. 1920×1080), bukan pada peranti pengguna — jadi satu layout sahaja, telus (transparent background) untuk overlay.

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
// src/layouts/mentor/index.jsx — resolver untuk role Mentor
import { useIsMobile } from "@/hooks/useBreakpoint";
import MentorLayoutDesktop from "./MentorLayoutDesktop.jsx";
import MentorLayoutMobile from "./MentorLayoutMobile.jsx";

export default function MentorLayout(props) {
  return useIsMobile()
    ? <MentorLayoutMobile {...props} />
    : <MentorLayoutDesktop {...props} />;
}
```

**Peraturan:**
- Fail mobile mengandungi navigasi mudah alih (offcanvas / bottom nav); desktop guna sidebar penuh.
- Layout role dikaitkan dengan route melalui `ProtectedRoute` (§ 8 / router).
- Jury studio (tablet) dan Mentor (telefon) adalah kes utama mobile — § scale targets.

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
├── mentor/
│   ├── pendaftaran.js
│   └── pasukan.js
├── participant/
│   ├── pasukan.js
│   └── sijil.js
├── jury/
│   └── penjurian.js
├── controller/
│   └── sesi.js               ← pilih projek, kawal giliran
├── broadcaster/
│   └── scoreboard.js         ← polling markah gabungan 3 juri
├── admin/
│   └── pengguna.js
└── public/
    └── sijil.js
```

```js
// src/api/mentor/pendaftaran.js
import http from "@/api/http";

export const daftarPasukan = (data) => http.post("/mentor/pendaftaran", data);
export const senaraiPasukan = () => http.get("/mentor/pasukan");
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
| Kelas (Controller/Model) | **StudlyCase** | Komponen & Layout → **PascalCase** `.jsx` | `MentorLayoutDesktop.jsx`, `Pendaftaran.jsx` |
| Folder views | **snake_case**, ikut domain | Folder `views/` & `layouts/` ikut **role** (huruf kecil) | `views/mentor/`, `layouts/jury/` |
| Method / fungsi | **camelCase** | Fungsi & hooks → **camelCase** | `daftarPasukan()`, `useIsMobile()` |
| Fail bukan-kelas (helpers) | huruf kecil | Modul utiliti → huruf kecil `.js` | `http.js`, `pendaftaran.js`, `format.js` |
| Route / URL | **kebab-case** | Path React Router → **kebab-case** | `/jury/penjurian-studio` |
| Pemboleh ubah env | **UPPER_SNAKE** | `VITE_` + **UPPER_SNAKE** | `VITE_API_URL` |
| Pembekal/Context | StudlyCase | Context → **PascalCase** | `AuthContext`, `AuthProvider` |

---

## 8. Views & Fungsi Berulang Ikut Laravel

### Views — berkumpulan ikut role (cermin `resources/views`)

Seperti Laravel mengumpul Blade dalam `resources/views/{domain}/`, React mengumpul "page view" dalam `src/views/{role}/`.

```
src/views/
├── mentor/
│   ├── Pendaftaran.jsx
│   ├── PasukanSenarai.jsx
│   └── PasukanButiran.jsx
├── participant/
│   ├── Dashboard.jsx
│   ├── PasukanSaya.jsx
│   └── SijilSaya.jsx
├── jury/
│   ├── SaringanZon.jsx
│   └── PenjurianStudio.jsx
├── controller/
│   ├── SesiKawalan.jsx        ← pilih projek → picu UI juri
│   └── ProjekSenarai.jsx
├── broadcaster/
│   └── Scoreboard.jsx         ← overlay OBS (transparent, kanvas tetap)
├── admin/
│   ├── Dashboard.jsx
│   ├── Pengguna.jsx
│   └── Laporan.jsx
└── public/
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
    │       ├── mentor.jsx
    │       ├── participant.jsx
    │       ├── jury.jsx
    │       ├── controller.jsx
    │       ├── broadcaster.jsx
    │       ├── admin.jsx
    │       └── public.jsx
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
    ├── mentor.jsx           ← (cermin routes/api/v1/mentor.php)
    ├── participant.jsx
    ├── jury.jsx
    ├── controller.jsx
    ├── broadcaster.jsx
    ├── admin.jsx
    └── public.jsx
```

### Konvensyen URL — resourceful (ikut Laravel)

URL frontend memetakan corak URI resourceful Laravel. Prefix role, kebab-case, parameter `{x}` → `:x`.

| Tujuan | Laravel URI | Path React Router | View |
|---|---|---|---|
| Senarai | `GET /mentor/pasukan` | `/mentor/pasukan` | `views/mentor/PasukanSenarai.jsx` |
| Borang cipta | `GET /mentor/pasukan/create` | `/mentor/pasukan/create` | `PasukanCipta.jsx` |
| Butiran (show) | `GET /mentor/pasukan/{pasukan}` | `/mentor/pasukan/:pasukan` | `PasukanButiran.jsx` |
| Borang edit | `GET /mentor/pasukan/{pasukan}/edit` | `/mentor/pasukan/:pasukan/edit` | `PasukanEdit.jsx` |
| Tindakan khas | — | `/jury/penjurian-studio` | `PenjurianStudio.jsx` |

> Nota: SPA hanya ada navigasi jenis-GET; `store`/`update`/`destroy` (POST/PUT/DELETE) dibuat melalui modul Axios (§5). Tapi **corak URI dikekalkan** supaya selari dengan backend.

### Fail route per role

Setiap fail mengeksport array *route object* (path relatif) — seperti satu fail route Laravel mengisi satu prefix group. Guna `React.lazy` untuk code-splitting ikut role.

```jsx
// src/router/routes/mentor.jsx   (cermin routes/api/v1/mentor.php)
import { lazy } from "react";

const MentorDashboard   = lazy(() => import("@/views/mentor/Dashboard.jsx"));
const Pendaftaran     = lazy(() => import("@/views/mentor/Pendaftaran.jsx"));
const PasukanSenarai  = lazy(() => import("@/views/mentor/PasukanSenarai.jsx"));
const PasukanCipta    = lazy(() => import("@/views/mentor/PasukanCipta.jsx"));
const PasukanButiran  = lazy(() => import("@/views/mentor/PasukanButiran.jsx"));
const PasukanEdit     = lazy(() => import("@/views/mentor/PasukanEdit.jsx"));

// path relatif kepada prefix "/mentor" (ditetapkan di index.jsx)
export default [
  { index: true,                       element: <MentorDashboard /> },
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
import PublicLayout  from "@/layouts/public";
import MentorLayout  from "@/layouts/mentor";
import ParticipantLayout from "@/layouts/participant";
import JuryLayout  from "@/layouts/jury";
import ControllerLayout from "@/layouts/controller";
import BroadcasterLayout from "@/layouts/broadcaster";
import AdminLayout from "@/layouts/admin";
import publicRoutes  from "./routes/public.jsx";
import mentorRoutes  from "./routes/mentor.jsx";
import participantRoutes from "./routes/participant.jsx";
import juryRoutes  from "./routes/jury.jsx";
import controllerRoutes from "./routes/controller.jsx";
import broadcasterRoutes from "./routes/broadcaster.jsx";
import adminRoutes from "./routes/admin.jsx";

export const router = createBrowserRouter([
  // Public — public, tiada auth
  { path: "/", element: <PublicLayout />, children: publicRoutes },

  // Mentor / Participant / Jury / Controller / Broadcaster / Admin — prefix + gate ikut role (cermin middleware role:*)
  {
    path: "/mentor",
    element: <ProtectedRoute role="mentor"><MentorLayout /></ProtectedRoute>,
    children: mentorRoutes,
  },
  {
    path: "/participant",
    element: <ProtectedRoute role="participant"><ParticipantLayout /></ProtectedRoute>,
    children: participantRoutes,
  },
  {
    path: "/jury",
    element: <ProtectedRoute role="jury"><JuryLayout /></ProtectedRoute>,
    children: juryRoutes,
  },
  {
    path: "/controller",
    element: <ProtectedRoute role="controller"><ControllerLayout /></ProtectedRoute>,
    children: controllerRoutes,
  },
  {
    path: "/broadcaster",
    element: <ProtectedRoute role="broadcaster"><BroadcasterLayout /></ProtectedRoute>,
    children: broadcasterRoutes,
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
- Prefix role ditetapkan **sekali** di `index.jsx` (bukan diulang dalam setiap fail) — seperti `Route::prefix('mentor')` Laravel.
- Layout role jadi *parent element*; view dirender dalam `<Outlet />` layout tersebut.
- Gate route di frontend adalah UX sahaja — **penguatkuasaan sebenar tetap di backend** (role middleware + Sanctum).

---

## 10. Autentikasi & Protected Route — Server yang Sahkan

**Prinsip:** frontend **tidak dipercayai** sebagai sempadan keselamatan. Setiap request membawa cookie sesi Sanctum (`withCredentials`, automatik), dan **server** mengesahkan sesi + role pada setiap panggilan API (role middleware backend §1). ProtectedRoute hanya untuk pengalaman pengguna (UX) — bukan kawalan sebenar.

### Aliran login (Sanctum SPA cookie — React TIDAK pegang token)

```
1. React   →  GET  /sanctum/csrf-cookie                    (sekali, sebelum login)
              ←  Set-Cookie: XSRF-TOKEN (boleh dibaca JS), laravel_session

2. React   →  POST /api/v1/login { email, password }       (withCredentials + X-XSRF-TOKEN)
   Laravel  →  sahkan kelayakan → regenerate session
              ←  204 No Content
                 Set-Cookie: laravel_session=…; HttpOnly; Secure; SameSite=Lax
   ⮑ Browser simpan cookie automatik — React simpan TIADA token

3. React   →  GET  /api/v1/me                              (cookie auto-dihantar)
              ←  200 { data: { id, nama, roles: [...] } }   → isi AuthContext

4. Request seterusnya  →  cookie httpOnly auto + X-XSRF-TOKEN
                       →  server sahkan sesi + role (middleware) pada SETIAP request

5. Logout  →  POST /api/v1/logout  →  server batal sesi, cookie dipadam
```

> **Token disimpan di mana?** Dalam **cookie `httpOnly`** yang diuruskan **browser** — bukan dalam React, bukan `localStorage`/`sessionStorage`. JS tak boleh baca cookie itu (kebal XSS). Mod ini hanya berfungsi jika SPA + API **sama domain** (lihat `docs/deployment/README.md`).

### Storan token — guna cookie `httpOnly`, bukan localStorage/sessionStorage

| Pilihan | Kebal XSS? | Hantar auto | Keputusan |
|---|---|---|---|
| **Cookie `httpOnly` (Sanctum SPA)** | ✅ Ya — JS tak boleh baca | ✅ Ya (`withCredentials`) | ✅ **Pilihan projek** |
| `localStorage` | ❌ Terdedah XSS | ❌ Manual header | Tidak |
| `sessionStorage` | ❌ Terdedah XSS | ❌ Manual header | Tidak (kecuali kiosk token) |

- **Token tidak disimpan dalam JavaScript.** Sesi hidup dalam cookie `httpOnly` + `Secure` + `SameSite` — diuruskan Sanctum, kebal daripada pencurian melalui XSS. CSRF dilindungi oleh token CSRF Sanctum (§5 `initCsrf`).
- Yang disimpan di frontend hanyalah **keadaan UI tak sensitif** (profil + role pengguna) dalam **memori** (AuthContext / cache TanStack Query) — **bukan** token. Boleh dicermin ke `sessionStorage` untuk UX muat-semula tab, tetapi tidak wajib dan tidak mengandungi rahsia.
- Jika satu hari perlu token JS sebenar (cth. kiosk luar SPA), barulah **`sessionStorage` lebih baik daripada `localStorage`** (jangka hayat lebih pendek, tidak dikongsi antara tab) — tetapi ini pengecualian, bukan default.

### "Sentiasa sahkan dengan API"

Sesi disahkan oleh server, bukan diandaikan dari client. Guna satu query `me` (TanStack Query) yang refetch bila tab difokus + selepas tindakan penting:

```js
// src/api/auth.js
import http from "@/api/http";
export const me     = () => http.get("/me");           // 200 = sah, 401 = tidak
export const login  = (data) => http.post("/login", data);
export const logout = () => http.post("/logout");
```

```jsx
// src/hooks/useAuth.js — server yang sahkan; cache + revalidate
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/auth";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => me().then((r) => r.data.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,        // sahkan semula bila pengguna kembali
  });
  return { user, loading: isLoading };
}
```

- `ProtectedRoute` (§9) baca `useAuth` — tiada `user` (401) → `/login`; role salah → `/403`.
- **Penguatkuasaan sebenar tetap di setiap endpoint data**: walaupun seseorang memintas gate frontend, server pulangkan **403/401** kerana role middleware + Sanctum. Itu sebabnya frontend "sentiasa hantar" (cookie) untuk disahkan server.

---

## 11. Pengendalian Ralat — Terperinci + Paparan Khas

Interceptor Axios berpusat (lanjutan §5) memetakan **setiap kod status** kepada tindakan, dan ada **halaman ralat khas** yang memaparkan mesej dari Laravel.

### Pemetaan kod status

| Status | Maksud | Tindakan frontend |
|---|---|---|
| **302** | Redirect | **Dielak pada API** — `ForceJsonResponse` (backend §1.1) memaksa **401 JSON**, bukan redirect ke halaman login. Jika 302 tetap berlaku, axios ikut auto; kita pastikan API sentiasa JSON. |
| **401** | Tidak log masuk / sesi tamat | Bersihkan cache `me` → redirect `/login` |
| **403** | Tiada kebenaran (role tak cukup) | Papar halaman khas `/403` |
| **404** | Sumber tiada | Papar `/404` (untuk navigasi; ralat *data-fetch* boleh dikendali setempat) |
| **419** | Token CSRF luput | `initCsrf()` + ulang request automatik (§5) |
| **422** | Ralat validasi | **Tidak** redirect — pulangkan `errors` ke borang (mesej BM medan demi medan) |
| **500 / 503** | Ralat pelayan | Papar `/500` + butiran ralat Laravel |
| Tiada respons | Rangkaian / offline | Papar `/ralat-rangkaian` |

```js
// src/api/http.js — sambungan interceptor (§5)
import { router } from "@/router";

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const res = err.response;
    if (!res) { router.navigate("/ralat-rangkaian"); return Promise.reject(err); }

    switch (res.status) {
      case 401: router.navigate("/login"); break;
      case 403: router.navigate("/403"); break;
      case 404: router.navigate("/404"); break;            // boleh ditindih setempat
      case 419: return initCsrf().then(() => http(err.config));
      case 422: break;                                       // dikendali borang
      case 500:
      case 503: router.navigate("/ralat-pelayan", { state: { ralat: res.data } }); break;
      default:  break;
    }
    return Promise.reject(err);
  }
);
```

### Paparkan mesej ralat dari Laravel

Laravel pulangkan JSON konsisten. Papar `message` kepada pengguna; tunjuk butiran teknikal (`exception`, `file`, `line`) **hanya dalam mod pembangunan**.

```jsonc
// Produksi (APP_DEBUG=false)
{ "message": "Server Error" }

// Pembangunan (APP_DEBUG=true)
{ "message": "...", "exception": "...", "file": "app/...", "line": 42, "trace": [ /* … */ ] }
```

```jsx
// src/views/ralat/RalatPelayan.jsx  (laluan /ralat-pelayan)
import { useLocation } from "react-router-dom";

export default function RalatPelayan() {
  const ralat = useLocation().state?.ralat;
  return (
    <div className="container text-center py-5">
      <h1 className="display-4">500 — Ralat Pelayan</h1>
      <p className="text-muted">{ralat?.message ?? "Maaf, berlaku ralat tidak dijangka."}</p>

      {/* Butiran teknikal Laravel — hanya semasa pembangunan */}
      {import.meta.env.DEV && ralat?.exception && (
        <pre className="text-start bg-light p-3 mt-4 small">
          {ralat.exception} @ {ralat.file}:{ralat.line}
        </pre>
      )}
    </div>
  );
}
```

### Halaman ralat khas + Error Boundary

```
src/views/ralat/
├── Larangan.jsx          ← 403  (laluan /403)
├── TidakDijumpai.jsx     ← 404  (laluan /404 dan catch-all "*")
├── RalatPelayan.jsx      ← 500/503 (laluan /ralat-pelayan)
└── RalatRangkaian.jsx    ← offline (laluan /ralat-rangkaian)
```

- Daftar laluan ralat ini dalam `router/index.jsx` (§9 sudah ada `/403` dan `*`).
- Bungkus app dengan **React Error Boundary** untuk tangkap ralat *render* JS (bukan HTTP) → papar `RalatPelayan` sebagai fallback.
- 422 **tidak** guna halaman khas — ralat validasi dipapar inline di borang dalam BM.

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
