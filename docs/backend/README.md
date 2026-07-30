# Backend — Konvensyen Senibina (Laravel API)

> **Projek:** Junior Innovathon 2026 — RTM
> **Vendor:** Stream.My
> **Last updated:** 2026-05-31
> **Stack:** Laravel (latest) · MySQL 8 · Redis · Sanctum · Spatie laravel-permission
> **Memenuhi:** Spesifikasi § 3.2.1 (pengasingan back end / front end — API), § 3.7 (Admin), § 3.6 (Penjurian)

Dokumen ini menetapkan **konvensyen wajib** untuk pembinaan backend Laravel projek Junior Innovathon 2026. Semua developer **mesti** ikut struktur ini supaya codebase konsisten, mudah diaudit, dan mudah diserah (handover) kepada RTM di hujung kontrak (§ 3.14).

---

## Ringkasan Keputusan Senibina

| # | Konvensyen | Ringkasan |
|---|---|---|
| 1 | **RBAC** | Guna **Spatie laravel-permission** untuk kawal *roles* dan akses *route* berdasarkan role |
| 2 | **Controller ikut role** | Controller disusun dalam folder asing mengikut nama role |
| 3 | **Service layer** | Controller **tidak** mengandungi business logic — controller panggil **Service** |
| 4 | **Validation berasingan** | Guna **Form Request** (form helper); folder validation ikut nama controller |
| 5 | **JSON sahaja** | Controller **hanya** return JSON API response |
| 6 | **Sanctum** | **Laravel Sanctum** sebagai tool utama autentikasi API |
| 7 | **API versioning** | Semua endpoint diversi di bawah prefix `/api/v1/…`; lapisan HTTP (Controller, Request, Route) di-namespace `V1` |

---

## 0. API Versioning — `/api/v1/…`

Semua endpoint API **wajib** berada di bawah prefix versi. Versi semasa ialah **`v1`**.

```
https://juniorinnovathon.rtm.gov.my/api/v1/mentor/pendaftaran
https://juniorinnovathon.rtm.gov.my/api/v1/jury/penjurian
https://juniorinnovathon.rtm.gov.my/api/v1/scroller/sesi
https://juniorinnovathon.rtm.gov.my/api/v1/broadcaster/scoreboard
https://juniorinnovathon.rtm.gov.my/api/v1/admin/pengguna
https://juniorinnovathon.rtm.gov.my/api/v1/public/sijil/{kod}
```

**Prinsip:**
- **Lapisan HTTP di-namespace ikut versi** — Controller, Form Request, dan Route fail diletak di bawah `V1`. Bila ada `v2` kelak, salin/cipta `V2` tanpa mengganggu pengguna `v1` sedia ada (§ 3.2.1 — "API versioning untuk perubahan tanpa mengganggu pengguna sedia ada").
- **Service layer TIDAK diversi.** Business logic dikongsi merentas versi. `v1` dan `v2` controller boleh panggil Service yang sama; perbezaan versi diuruskan di Controller/Resource (bentuk input/output), bukan di Service.
- **Model & migration TIDAK diversi** — satu sumber kebenaran data.
- Prefix `v1` ditetapkan sekali di `routes/api.php`; tiada hardcode `v1` di dalam controller.

```php
// routes/api.php — root versioning
Route::prefix('v1')->group(function () {
    // Public — tiada auth
    Route::prefix('public')
        ->group(base_path('routes/api/v1/public.php'));

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {
        Route::prefix('mentor')->middleware('role:mentor')
            ->group(base_path('routes/api/v1/mentor.php'));
        Route::prefix('participant')->middleware('role:participant')
            ->group(base_path('routes/api/v1/participant.php'));
        Route::prefix('jury')->middleware('role:jury')
            ->group(base_path('routes/api/v1/jury.php'));
        Route::prefix('scroller')->middleware('role:scroller')
            ->group(base_path('routes/api/v1/scroller.php'));
        Route::prefix('broadcaster')->middleware('role:broadcaster')
            ->group(base_path('routes/api/v1/broadcaster.php'));
        Route::prefix('admin')->middleware('role:admin')
            ->group(base_path('routes/api/v1/admin.php'));
    });
});
```

---

## 1. Kawalan Role & Akses — Spatie laravel-permission

Sistem menggunakan **[Spatie laravel-permission](https://spatie.be/docs/laravel-permission)** untuk Role-Based Access Control (RBAC). Akses ke setiap *route* dikawal berdasarkan **role** pengguna.

### Tujuh role asas (§ 3.2)

| Role | Slug | Keterangan |
|---|---|---|
| Mentor | `mentor` | Guru pembimbing — daftar & urus pasukan sekolah, peserta, muat naik bahan |
| Participant | `participant` | Pelajar peserta — lihat pasukan sendiri, status penyertaan, jadual, sijil |
| Jury | `jury` | Penjurian saringan zon + studio — beri markah real-time (§ 3.6.4) |
| Scroller | `scroller` | Pengawal sesi penjurian live — pilih projek untuk dinilai, memacu UI penandaan kepada 3 juri, kawal giliran/aliran projek semasa rakaman studio |
| Broadcaster | `broadcaster` | Overlay siaran — paparan gabungan markah 3 juri secara live sebagai *browser source* untuk kanvas OBS (scoreboard read-only) |
| Admin | `admin` | Pengurusan platform, kandungan CMS, laporan, pemantauan |
| Public | `public` | Penonton portal public — sijil, verifikasi |

> Catatan: `SuperAdmin` boleh dilaksana sebagai role berasingan atau `admin` + permission `*`. Keputusan akhir didokumen dalam `decisions-log.md` apabila scaffolding bermula.

### Setup

```php
// app/Models/User.php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasRoles, Notifiable;
    // 'guard_name' => 'sanctum'
}
```

### Kawalan akses di peringkat route

Route **mesti** dilindungi oleh middleware `role` (atau `permission`) Spatie. Setiap kumpulan route role berada dalam group berasingan.

Lihat § 0 untuk contoh `routes/api.php` lengkap (versioning + role middleware). Setiap fail role berada di bawah `routes/api/v1/`:

```php
// routes/api/v1/mentor.php
use App\Http\Controllers\Api\V1\Mentor\PendaftaranController;
use Illuminate\Support\Facades\Route;

Route::post('pendaftaran', [PendaftaranController::class, 'store']);
Route::get('pasukan',      [PasukanController::class, 'index']);
```

- **Permission halus (granular)** dikawal dalam Service atau Policy, bukan di route — supaya SuperAdmin boleh ubah permission tanpa libatkan developer (§ 3.7).
- Semua perubahan role/permission direkod dalam **audit log**.

---

## 1.1 Middleware — Susunan & Cadangan

Middleware disusun dalam **3 lapisan**: global (semua `/api/v1`), kumpulan auth, dan per-route sensitif.

### Lapisan 1 — Semua route `/api/v1/*`

| Middleware | Jenis | Tujuan | Spec § |
|---|---|---|---|
| `HandleCors` | Laravel | Kawal asal (origin) yang dibenarkan — hanya domain SPA RTM | — |
| `EnsureFrontendRequestsAreStateful` | Sanctum | Aktifkan auth cookie SPA untuk domain stateful | — |
| `ForceJsonResponse` | **Custom** | Paksa `Accept: application/json` → semua ralat render JSON (§ 5) | § 3.2.1 |
| `throttle:api` | Laravel | Rate limit asas — perlindungan DDoS / abuse | § 3.8.1 |
| `SetLocale` | **Custom** | Set locale **BM** sebagai default untuk mesej | — |
| `SubstituteBindings` | Laravel | Route-model binding | — |

```php
// bootstrap/app.php (Laravel 11+) — middleware group 'api'
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
    $middleware->api(append: [
        \App\Http\Middleware\ForceJsonResponse::class,
        \App\Http\Middleware\SetLocale::class,
    ]);
    $middleware->throttleApi();                 // throttle:api

    // alias Spatie
    $middleware->alias([
        'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
    ]);
});
```

### Lapisan 2 — Kumpulan berautentikasi (per role)

| Middleware | Tujuan |
|---|---|
| `auth:sanctum` | Sahkan pengguna (session SPA / token) — § 6 |
| `role:{mentor\|jury\|admin}` | Spatie — gate kasar ikut role — § 1 |
| `verified` | (Pilihan) pastikan emel disahkan sebelum akses |

```php
// routes/api.php — sudah ditunjukkan di § 0
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('admin')->middleware('role:admin')
        ->group(base_path('routes/api/v1/admin.php'));
});
```

### Lapisan 3 — Per-route sensitif

| Middleware | Guna pada | Tujuan | Spec § |
|---|---|---|---|
| `permission:{nama}` | Tindakan istimewa tertentu | Gate halus (cth. `permission:padam-pengguna`) | § 3.7 |
| `AuditLog` | Semua tindakan tulis admin | Rekod audit trail (siapa, bila, apa) untuk RTM | § 3.7, § 3.14 |
| `throttle:login` | Endpoint login | Anti brute-force (kadar lebih ketat) | § 3.8.1 |
| `throttle:upload` | Muat naik video/slaid | Hadkan beban ingest besar | § 3.6 |

```php
// Contoh penggunaan per-route
Route::delete('pengguna/{user}', [PenggunaController::class, 'destroy'])
    ->middleware(['permission:padam-pengguna', 'audit']);
```

### Named rate limiters

Tetapkan had berbeza ikut konteks dalam `App\Providers\AppServiceProvider` atau `bootstrap/app.php`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('api', fn ($r) =>
    Limit::perMinute(60)->by($r->user()?->id ?: $r->ip()));

RateLimiter::for('login', fn ($r) =>
    Limit::perMinute(5)->by($r->ip()));              // anti brute-force

RateLimiter::for('upload', fn ($r) =>
    Limit::perMinute(10)->by($r->user()?->id));
```

### Middleware custom yang perlu dibina

| Kelas | Fungsi |
|---|---|
| `ForceJsonResponse` | Set header `Accept: application/json` supaya exception handler render JSON, bukan HTML — sokong konvensyen § 5 |
| `SetLocale` | Set `app()->setLocale('ms')` (atau ikut header) untuk mesej BM |
| `AuditLog` | Log tindakan tulis (method, route, user, payload ringkas, IP, masa) ke jadual `audit_logs` — bukti pematuhan untuk RTM (§ 3.7, § 3.14) |

> **Keselamatan tambahan (§ 3.8.1):** SSL, WAF, dan perlindungan DDoS dikendalikan di lapisan **CloudFront + AWS WAF** (lihat `aws-architecture.md`), bukan middleware Laravel. Middleware aplikasi fokus pada auth, RBAC, throttle, dan audit.

---

## 2. Controller — Folder Asing Ikut Nama Role

Controller disusun dalam **subfolder mengikut role**. Ini memudahkan navigasi dan memetakan terus kepada struktur route di atas.

```
app/Http/Controllers/
├── Controller.php                  ← base controller
└── Api/
    └── V1/                         ← versi API (§ 0)
        ├── Mentor/
        │   ├── PendaftaranController.php
        │   ├── PasukanController.php       ← Team (sertai 1 Event)
        │   ├── ProjekController.php        ← cipta/urus Project (1 per Team)
        │   └── PenyertaanController.php
        ├── Participant/
        │   ├── PasukanController.php
        │   └── SijilController.php
        ├── Jury/
        │   ├── SaringanController.php
        │   └── PenjurianController.php
        ├── Scroller/
        │   ├── SesiController.php
        │   └── ProjekController.php
        ├── Broadcaster/
        │   └── ScoreboardController.php
        ├── Admin/
        │   ├── DashboardController.php
        │   ├── EventController.php         ← Admin cipta/urus Event
        │   ├── PenggunaController.php
        │   ├── CmsController.php
        │   └── LaporanController.php
        └── Public/
            ├── SijilController.php
            └── VerifikasiController.php
```

**Peraturan:**
- Namespace mengikut folder: `App\Http\Controllers\Api\V1\Mentor\PendaftaranController`.
- Satu controller = satu resource/domain dalam konteks role tersebut.
- Controller **nipis (thin)** — tiada query DB atau business logic terus.

---

## 3. Service Layer — Controller Panggil Service

**Business logic semua berada dalam Service classes.** Controller hanya:
1. Terima request (sudah divalidasi oleh Form Request),
2. Panggil method Service yang berkenaan,
3. Return JSON (lihat § 5).

```
app/Services/
├── Event/
│   └── EventService.php            ← Admin: cipta/urus Event
├── Pendaftaran/
│   ├── PendaftaranService.php      ← Team (1 Event; kuatkuasa peserta terikat)
│   └── ProjectService.php          ← Mentor: cipta Project (1 per Team)
├── Penjurian/
│   ├── SaringanService.php
│   └── StudioScoringService.php
├── Sijil/
│   └── SijilService.php
└── Pengguna/
    └── PenggunaService.php
```

### Contoh

```php
// app/Http/Controllers/Api/V1/Mentor/PendaftaranController.php
namespace App\Http\Controllers\Api\V1\Mentor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Mentor\PendaftaranController\StoreRequest;
use App\Services\Pendaftaran\PendaftaranService;
use Illuminate\Http\JsonResponse;

class PendaftaranController extends Controller
{
    public function __construct(
        private readonly PendaftaranService $pendaftaran,
    ) {}

    public function store(StoreRequest $request): JsonResponse
    {
        $pasukan = $this->pendaftaran->daftarPasukan(
            $request->user(),
            $request->validated(),
        );

        return response()->json([
            'message' => 'Pasukan berjaya didaftarkan.',
            'data'    => new PasukanResource($pasukan),
        ], 201);
    }
}
```

```php
// app/Services/Pendaftaran/PendaftaranService.php
namespace App\Services\Pendaftaran;

use App\Models\Pasukan;
use App\Models\User;

class PendaftaranService
{
    public function daftarPasukan(User $mentor, array $data): Pasukan
    {
        // ── business logic, transaction, event, dsb di sini ──
        return DB::transaction(function () use ($mentor, $data) {
            $pasukan = $mentor->pasukan()->create($data);
            // ... lookup Pangkalan Data Sekolah, hantar notifikasi, dll.
            return $pasukan;
        });
    }
}
```

**Peraturan:**
- Service **tidak** tahu tentang HTTP (tiada `Request`/`Response`). Terima primitive/DTO/Model, return Model/data.
- Service boleh panggil Service lain (composition).
- Transaction DB, event dispatch, dan integrasi luar (S3, OpenAI, WhatsApp) semua dalam Service.

---

## 4. Validation — Form Request, Folder Ikut Nama Controller

Validasi menggunakan **Laravel Form Request** (form helper). Setiap request class berada dalam folder yang **dinamakan mengikut controller** yang menggunakannya.

```
app/Http/Requests/
└── Api/
    └── V1/                              ← versi API (§ 0)
        ├── Mentor/
        │   ├── PendaftaranController/
        │   │   ├── StoreRequest.php
        │   │   └── UpdateRequest.php
        │   └── PenyertaanController/
        │       └── StoreRequest.php
        ├── Jury/
        │   └── PenjurianController/
        │       └── ScoreRequest.php
        ├── Scroller/
        │   └── SesiController/
        │       └── PilihProjekRequest.php
        └── Admin/
            └── PenggunaController/
                ├── StoreRequest.php
                └── UpdateRequest.php
```

> Pola nama: `App\Http\Requests\Api\V1\{Role}\{ControllerName}\{Action}Request`

### Contoh

```php
// app/Http/Requests/Api/V1/Mentor/PendaftaranController/StoreRequest.php
namespace App\Http\Requests\Api\V1\Mentor\PendaftaranController;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // role sudah dikawal di route; di sini check kebenaran halus jika perlu
        return $this->user()->can('daftar-pasukan');
    }

    public function rules(): array
    {
        return [
            'nama_pasukan'   => ['required', 'string', 'max:255'],
            'kod_sekolah'    => ['required', 'exists:sekolah,kod'],
            'video_url'      => ['required', 'url'],
            'ahli'           => ['required', 'array', 'min:1', 'max:5'],
            'ahli.*.nama'    => ['required', 'string', 'max:255'],
            'ahli.*.ic'      => ['required', 'string', 'size:12'],
        ];
    }

    public function messages(): array
    {
        return [
            'kod_sekolah.exists' => 'Kod sekolah tidak dijumpai dalam Pangkalan Data Sekolah.',
        ];
    }
}
```

**Peraturan:**
- Validasi **tidak** dibuat dalam controller — selalu guna Form Request.
- `authorize()` untuk kebenaran halus; role kasar dikawal di route (§ 1).
- Pesanan ralat (validation messages) dalam **Bahasa Melayu**.

---

## 5. Controller Hanya Return JSON API

Setiap controller method **mesti** return `JsonResponse`. **Tiada** view, redirect, atau Blade.

### Format response standard

```jsonc
// Berjaya
{
  "message": "Pasukan berjaya didaftarkan.",
  "data": { /* … */ }
}

// Senarai (dengan pagination meta)
{
  "data": [ /* … */ ],
  "meta": { "current_page": 1, "last_page": 4, "total": 78 }
}

// Ralat validasi (HTTP 422) — automatik oleh Laravel
{
  "message": "Data tidak sah.",
  "errors": { "kod_sekolah": ["Kod sekolah tidak dijumpai…"] }
}
```

**Peraturan:**
- Guna **API Resource** (`JsonResource` / `ResourceCollection`) untuk bentuk output yang konsisten.
- Kod status HTTP yang betul: `200`, `201`, `204`, `401`, `403`, `404`, `422`, `500`.
- Force JSON: pastikan `Accept: application/json`, atau set exception handler render JSON untuk semua route `api`.
- API versioned di bawah prefix `/api/v1/` (§ 0, § 3.2.1).

---

## 6. Autentikasi — Laravel Sanctum

**Laravel Sanctum** adalah tool autentikasi utama API.

- **Mod SPA cookie session** untuk frontend React (same-domain) — CSRF-protected, sesuai untuk portal Mentor/Jury/Admin.
- **Personal access token** untuk integrasi/perkhidmatan (cth. chatbot, kiosk) jika perlu.
- Guard `sanctum` diselaraskan dengan Spatie (`guard_name` = `sanctum`).

```php
// Route auth dilindungi
Route::middleware('auth:sanctum')->group(function () {
    // … mentor / jury / admin
});
```

```php
// config/sanctum.php — stateful domains untuk SPA
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
    'juniorinnovathon.rtm.gov.my,localhost:5173'
)),
```

**Peraturan:**
- Endpoint login/logout mengeluarkan/membatalkan session Sanctum.
- Semua route bukan-public mesti lalu `auth:sanctum` + middleware `role` (§ 1).
- Token/session dikonfigurasi dengan expiry yang sesuai; logout membatalkan token.

---

## Pemetaan Aliran Request (End-to-End)

```
HTTP Request  →  /api/v1/{role}/…                                        (§0)
   │
   ▼
routes/api/v1/{role}.php   ──►  middleware: auth:sanctum + role:{role}    (§1, §6)
   │
   ▼
App\Http\Requests\Api\V1\{Role}\{Controller}\{Action}Request   ──►  validate   (§4)
   │
   ▼
App\Http\Controllers\Api\V1\{Role}\{Controller}   ──►  thin, panggil service   (§2)
   │
   ▼
App\Services\{Domain}\{Service}   ──►  business logic, DB, integrasi  (§3, tidak diversi)
   │
   ▼
App\Http\Resources\{Resource}   ──►  JsonResponse   (§5)
```

---

## Struktur Folder Backend (Ringkasan)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/                  ← lapisan HTTP diversi (§0)
│   │   │       ├── Mentor/
│   │   │       ├── Participant/
│   │   │       ├── Jury/
│   │   │       ├── Scroller/
│   │   │       ├── Broadcaster/
│   │   │       ├── Admin/
│   │   │       └── Public/
│   │   ├── Requests/
│   │   │   └── Api/V1/
│   │   │       ├── Mentor/{ControllerName}/
│   │   │       ├── Jury/{ControllerName}/
│   │   │       ├── Scroller/{ControllerName}/
│   │   │       ├── Admin/{ControllerName}/
│   │   │       └── Public/{ControllerName}/
│   │   ├── Resources/
│   │   └── Middleware/
│   ├── Services/                        ← TIDAK diversi (shared) (§3)
│   │   ├── Pendaftaran/
│   │   ├── Penjurian/
│   │   ├── Sijil/
│   │   └── Pengguna/
│   └── Models/
├── routes/
│   ├── api.php                          ← root: Route::prefix('v1')
│   └── api/
│       └── v1/
│           ├── mentor.php
│           ├── participant.php
│           ├── jury.php
│           ├── scroller.php
│           ├── broadcaster.php
│           ├── admin.php
│           └── public.php
├── config/
│   ├── sanctum.php
│   └── permission.php
└── database/
    ├── migrations/
    └── seeders/
        └── RolePermissionSeeder.php
```

---

## Rujukan Spesifikasi

| Konvensyen | Spec § |
|---|---|
| Pengasingan backend/frontend (API) + API versioning | § 3.2.1 |
| RBAC pelbagai peranan | § 3.2, § 3.7 |
| Penjurian (markah real-time) | § 3.6, § 3.6.4 |
| Pendaftaran (lookup Pangkalan Data Sekolah) | § 3.2.5 |
| Sijil digital + verifikasi QR | § 3.2.5(c) |
| Serahan source code ke RTM | § 3.14 |
