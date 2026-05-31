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

---

## 1. Kawalan Role & Akses — Spatie laravel-permission

Sistem menggunakan **[Spatie laravel-permission](https://spatie.be/docs/laravel-permission)** untuk Role-Based Access Control (RBAC). Akses ke setiap *route* dikawal berdasarkan **role** pengguna.

### Empat role asas (§ 3.2)

| Role | Slug | Keterangan |
|---|---|---|
| Guru | `guru` | Pendaftar pasukan sekolah — urus penyertaan, peserta, muat naik bahan |
| Juri | `juri` | Penjurian saringan zon + studio (markah real-time) |
| Admin | `admin` | Pengurusan platform, kandungan CMS, laporan, pemantauan |
| Awam | `awam` | Penonton portal awam — sijil, verifikasi |

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

```php
// routes/api.php
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public — tiada auth
    Route::prefix('awam')
        ->group(base_path('routes/api/awam.php'));

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {

        Route::prefix('guru')
            ->middleware('role:guru')
            ->group(base_path('routes/api/guru.php'));

        Route::prefix('juri')
            ->middleware('role:juri')
            ->group(base_path('routes/api/juri.php'));

        Route::prefix('admin')
            ->middleware('role:admin')
            ->group(base_path('routes/api/admin.php'));
    });
});
```

- **Permission halus (granular)** dikawal dalam Service atau Policy, bukan di route — supaya SuperAdmin boleh ubah permission tanpa libatkan developer (§ 3.7).
- Semua perubahan role/permission direkod dalam **audit log**.

---

## 2. Controller — Folder Asing Ikut Nama Role

Controller disusun dalam **subfolder mengikut role**. Ini memudahkan navigasi dan memetakan terus kepada struktur route di atas.

```
app/Http/Controllers/
├── Controller.php              ← base controller
├── Guru/
│   ├── PendaftaranController.php
│   ├── PasukanController.php
│   └── PenyertaanController.php
├── Juri/
│   ├── SaringanController.php
│   └── PenjurianController.php
├── Admin/
│   ├── DashboardController.php
│   ├── PenggunaController.php
│   ├── CmsController.php
│   └── LaporanController.php
└── Awam/
    ├── SijilController.php
    └── VerifikasiController.php
```

**Peraturan:**
- Namespace mengikut folder: `App\Http\Controllers\Guru\PendaftaranController`.
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
├── Pendaftaran/
│   └── PendaftaranService.php
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
// app/Http/Controllers/Guru/PendaftaranController.php
namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\PendaftaranController\StoreRequest;
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
    public function daftarPasukan(User $guru, array $data): Pasukan
    {
        // ── business logic, transaction, event, dsb di sini ──
        return DB::transaction(function () use ($guru, $data) {
            $pasukan = $guru->pasukan()->create($data);
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
├── Guru/
│   ├── PendaftaranController/
│   │   ├── StoreRequest.php
│   │   └── UpdateRequest.php
│   └── PenyertaanController/
│       └── StoreRequest.php
├── Juri/
│   └── PenjurianController/
│       └── ScoreRequest.php
└── Admin/
    └── PenggunaController/
        ├── StoreRequest.php
        └── UpdateRequest.php
```

> Pola nama: `App\Http\Requests\{Role}\{ControllerName}\{Action}Request`

### Contoh

```php
// app/Http/Requests/Guru/PendaftaranController/StoreRequest.php
namespace App\Http\Requests\Guru\PendaftaranController;

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
- API versioned di bawah prefix `/api/v1/` (§ 3.2.1).

---

## 6. Autentikasi — Laravel Sanctum

**Laravel Sanctum** adalah tool autentikasi utama API.

- **Mod SPA cookie session** untuk frontend React (same-domain) — CSRF-protected, sesuai untuk portal Guru/Juri/Admin.
- **Personal access token** untuk integrasi/perkhidmatan (cth. chatbot, kiosk) jika perlu.
- Guard `sanctum` diselaraskan dengan Spatie (`guard_name` = `sanctum`).

```php
// Route auth dilindungi
Route::middleware('auth:sanctum')->group(function () {
    // … guru / juri / admin
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
- Semua route bukan-awam mesti lalu `auth:sanctum` + middleware `role` (§ 1).
- Token/session dikonfigurasi dengan expiry yang sesuai; logout membatalkan token.

---

## Pemetaan Aliran Request (End-to-End)

```
HTTP Request
   │
   ▼
routes/api/{role}.php   ──►  middleware: auth:sanctum + role:{role}   (§1, §6)
   │
   ▼
App\Http\Requests\{Role}\{Controller}\{Action}Request   ──►  validate   (§4)
   │
   ▼
App\Http\Controllers\{Role}\{Controller}   ──►  thin, panggil service   (§2)
   │
   ▼
App\Services\{Domain}\{Service}   ──►  business logic, DB, integrasi   (§3)
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
│   │   │   ├── Guru/
│   │   │   ├── Juri/
│   │   │   ├── Admin/
│   │   │   └── Awam/
│   │   ├── Requests/
│   │   │   ├── Guru/{ControllerName}/
│   │   │   ├── Juri/{ControllerName}/
│   │   │   ├── Admin/{ControllerName}/
│   │   │   └── Awam/{ControllerName}/
│   │   ├── Resources/
│   │   └── Middleware/
│   ├── Services/
│   │   ├── Pendaftaran/
│   │   ├── Penjurian/
│   │   ├── Sijil/
│   │   └── Pengguna/
│   └── Models/
├── routes/
│   ├── api.php
│   └── api/
│       ├── guru.php
│       ├── juri.php
│       ├── admin.php
│       └── awam.php
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
| Pengasingan backend/frontend (API) | § 3.2.1 |
| RBAC pelbagai peranan | § 3.2, § 3.7 |
| Penjurian (markah real-time) | § 3.6, § 3.6.4 |
| Pendaftaran (lookup Pangkalan Data Sekolah) | § 3.2.5 |
| Sijil digital + verifikasi QR | § 3.2.5(c) |
| Serahan source code ke RTM | § 3.14 |
