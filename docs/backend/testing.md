# Backend — Konvensyen Ujian (Pest)

> **Projek:** Junior Innovathon 2026 — RTM
> **Vendor:** Stream.My
> **Last updated:** 2026-05-31
> **Tool ujian utama:** **Pest 3.x** (di atas PHPUnit) + plugin Laravel & Arch
> **Memenuhi:** Spesifikasi § 3.10 / § 3.13 (UAT + FAT docs), § 3.11 (SLA kualiti)

Dokumen ini melengkapi [`README.md`](./README.md). **Pest** adalah rangka kerja ujian utama backend. Setiap modul mesti ada ujian sebelum dikira siap (Definition of Done).

---

## Kenapa Pest?

| Faedah | Keterangan |
|---|---|
| **Sintaks ringkas** | `it('…')->expect(…)` — kurang boilerplate berbanding PHPUnit class, lebih mudah dibaca semasa handover ke RTM (§ 3.14) |
| **100% serasi PHPUnit** | Dibina atas PHPUnit; semua tooling Laravel (`RefreshDatabase`, factories, `actingAs`) berfungsi terus |
| **Arch testing terbina** | **Boleh kuatkuasakan konvensyen senibina** (lihat § Arch) — peraturan dalam `README.md` jadi ujian, bukan setakat dokumen |
| **Datasets** | Sesuai untuk uji *matrix akses role* (Guru/Juri/Admin/Awam) tanpa ulang kod |
| **Coverage & parallel** | `--coverage` dan `--parallel` terbina; sesuai untuk gate CI |

---

## Pemasangan

```bash
composer require pestphp/pest --dev --with-all-dependencies
composer require pestphp/pest-plugin-laravel --dev
php artisan pest:install
```

`phpunit.xml` dikekalkan untuk konfigurasi (env ujian, suites). Guna **MySQL 8** berasingan atau SQLite in-memory untuk ujian — putuskan dalam `decisions-log.md`; cadangan: **SQLite in-memory** untuk laju, dengan satu suite MySQL nightly untuk pengesahan migrasi sebenar.

---

## Struktur Folder Ujian

Susunan ujian **cermin** struktur aplikasi (§ versioning + role dari `README.md`):

```
tests/
├── Pest.php                         ← bootstrap, custom expectations, helpers
├── TestCase.php
├── Feature/                         ← ujian endpoint (HTTP, end-to-end)
│   └── Api/
│       └── V1/
│           ├── Guru/
│           │   └── PendaftaranTest.php
│           ├── Juri/
│           │   └── PenjurianTest.php
│           ├── Admin/
│           │   └── PenggunaTest.php
│           └── Awam/
│               └── SijilTest.php
├── Unit/                            ← ujian Service (business logic, tiada HTTP)
│   └── Services/
│       ├── Pendaftaran/
│       │   └── PendaftaranServiceTest.php
│       └── Penjurian/
│           └── StudioScoringServiceTest.php
└── Arch/                            ← ujian senibina (kuatkuasa konvensyen)
    └── ConventionsTest.php
```

**Pembahagian:**
- **Feature** — uji setiap endpoint melalui HTTP: auth Sanctum, role gate, validasi, kod status, bentuk JSON. Ini ujian *paling penting* untuk API.
- **Unit** — uji Service secara terasing (business logic, kira markah, transaksi). Service tak sentuh HTTP, jadi senang diuji.
- **Arch** — kuatkuasakan konvensyen senibina (lihat bawah).

---

## 1. Feature Test — Endpoint API

Uji ikut konsep dari `README.md`: auth Sanctum, role middleware, Form Request, JSON-only.

```php
// tests/Feature/Api/V1/Guru/PendaftaranTest.php
use App\Models\User;
use function Pest\Laravel\{postJson, actingAs};

it('membenarkan mentor mendaftar pasukan', function () {
    $mentor = User::factory()->create()->assignRole('mentor');

    actingAs($mentor)
        ->postJson('/api/v1/mentor/pendaftaran', [
            'nama_pasukan' => 'Pasukan Cendekia',
            'kod_sekolah'  => 'JEA1234',
            'video_url'    => 'https://s3…/video.mp4',
            'ahli'         => [['nama' => 'Ali', 'ic' => '120101011234']],
        ])
        ->assertCreated()
        ->assertJsonStructure(['message', 'data' => ['id', 'nama_pasukan']]);
});

it('menolak validasi tidak lengkap dengan 422', function () {
    $mentor = User::factory()->create()->assignRole('mentor');

    actingAs($mentor)
        ->postJson('/api/v1/mentor/pendaftaran', [])
        ->assertUnprocessable()                       // HTTP 422
        ->assertJsonValidationErrors(['nama_pasukan', 'kod_sekolah']);
});
```

### Matrix akses role — guna Datasets

Uji bahawa setiap role hanya boleh akses route yang dibenarkan (§ 1 RBAC):

```php
// tests/Feature/Api/V1/AccessMatrixTest.php
it('menguatkuasa akses role pada endpoint terlindung', function (string $role, int $status) {
    $user = User::factory()->create()->assignRole($role);

    actingAs($user)
        ->getJson('/api/v1/admin/pengguna')
        ->assertStatus($status);
})->with([
    'admin diterima' => ['admin', 200],
    'mentor ditolak' => ['mentor', 403],
    'juri ditolak'   => ['juri', 403],
]);

it('menolak tetamu tanpa token dengan 401', function () {
    getJson('/api/v1/admin/pengguna')->assertUnauthorized();   // 401
});
```

---

## 2. Unit Test — Service Layer

Service diuji tanpa HTTP — sahkan business logic, transaksi, dan integrasi (mock).

```php
// tests/Unit/Services/Pendaftaran/PendaftaranServiceTest.php
use App\Models\User;
use App\Services\Pendaftaran\PendaftaranService;

it('mencipta pasukan dan mengaitkan dengan mentor', function () {
    $mentor    = User::factory()->create();
    $service = app(PendaftaranService::class);

    $pasukan = $service->daftarPasukan($mentor, [
        'nama_pasukan' => 'Pasukan Cendekia',
        'kod_sekolah'  => 'JEA1234',
    ]);

    expect($pasukan->mentor_id)->toBe($mentor->id)
        ->and($pasukan->nama_pasukan)->toBe('Pasukan Cendekia');
});
```

---

## 3. Arch Test — Kuatkuasa Konvensyen Senibina

Ini nilai tambah terbesar Pest untuk projek ini: **konvensyen dalam `README.md` jadi ujian automatik.** Jika developer langgar struktur, CI gagal.

```php
// tests/Arch/ConventionsTest.php

// §2 — Controller dalam namespace Api\V1 dan ada suffix 'Controller'
arch('controllers')
    ->expect('App\Http\Controllers\Api\V1')
    ->toHaveSuffix('Controller')
    ->toExtend('App\Http\Controllers\Controller');

// §3 — Service TIDAK bergantung pada lapisan HTTP (controller tetap nipis)
arch('services bebas HTTP')
    ->expect('App\Services')
    ->not->toUse([
        'Illuminate\Http\Request',
        'Illuminate\Http\JsonResponse',
        'App\Http\Controllers',
    ]);

// §3 — Controller mesti melalui Service (tiada query Eloquent terus dalam controller)
arch('controller tidak guna DB terus')
    ->expect('App\Http\Controllers')
    ->not->toUse('Illuminate\Support\Facades\DB');

// §4 — Form Request mesti extend FormRequest
arch('form requests')
    ->expect('App\Http\Requests')
    ->toExtend('Illuminate\Foundation\Http\FormRequest');

// Larangan debug tertinggal
arch('tiada dump/debug')
    ->expect(['dd', 'dump', 'ray', 'var_dump'])->not->toBeUsed();

// Preset keselamatan Laravel
arch()->preset()->laravel();
arch()->preset()->security();
```

> **Nota §5 (JSON-only):** Arch test tak boleh sahkan *return type* dinamik dengan tepat. Kuatkuasakan dengan **(a)** type-hint `: JsonResponse` pada setiap method controller, dan **(b)** middleware `ForceJsonResponse` + Feature test yang `assertHeader('Content-Type', 'application/json')`.

---

## Helper Bersama (`tests/Pest.php`)

```php
// tests/Pest.php
uses(Tests\TestCase::class, Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature', 'Unit');

// helper: cipta user dengan role + seed permission
function userWithRole(string $role): App\Models\User
{
    return App\Models\User::factory()->create()->assignRole($role);
}

// custom expectation
expect()->extend('toBeValidApiResponse', function () {
    return $this->toHaveKeys(['message']);
});
```

> `RolePermissionSeeder` mesti dijalankan dalam setup ujian supaya role Spatie wujud sebelum `assignRole()`.

---

## Definition of Done (setiap modul)

Satu modul **tidak** dikira siap melainkan:

1. ✅ **Feature test** untuk setiap endpoint — auth, role gate, validasi (422), happy path, kod status betul.
2. ✅ **Unit test** untuk setiap method Service yang ada business logic.
3. ✅ **Arch test** lulus (konvensyen tak dilanggar).
4. ✅ Coverage modul **≥ 80%** (`pest --coverage --min=80`).

---

## Integrasi CI (GitHub Actions)

Ujian jadi *gate* sebelum merge & deploy (sejajar pipeline GitHub Actions → ECR → ECS dalam `CLAUDE.md`).

```yaml
# .github/workflows/backend-test.yml (ringkasan)
- run: composer install --no-interaction --prefer-dist
- run: php artisan key:generate
- run: ./vendor/bin/pest --parallel --coverage --min=80
```

- Pull request **tidak boleh merge** jika Pest gagal.
- Arch + Feature + Unit dijalankan dalam satu run `--parallel`.
- Laporan coverage dilampirkan sebagai bukti kualiti untuk **FAT** (§ 3.13).

---

## Rujukan

| Perkara | Spec § |
|---|---|
| Dokumen UAT + FAT | § 3.10, § 3.13 |
| SLA kualiti / pembetulan ralat | § 3.11.3 |
| Serahan source code (termasuk ujian) ke RTM | § 3.14 |
