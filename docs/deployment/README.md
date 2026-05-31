# Deployment — Web Server (nginx) & Routing

> **Projek:** Junior Innovathon 2026 — RTM
> **Vendor:** Stream.My
> **Last updated:** 2026-05-31
> **Web server:** nginx · PHP-FPM (Laravel) · React build statik
> **Memenuhi:** § 3.2.1 (pengasingan front/back end), § 3.8.1 (SSL/keselamatan)

Dokumen ini menetapkan cara **nginx** menyajikan React SPA dan Laravel API di bawah **satu domain** (`juniorinnovathon.rtm.gov.my`), supaya **Sanctum SPA cookie session** berfungsi (lihat `../frontend/README.md` §10).

---

## Matlamat: Same-Origin

Sanctum SPA cookie hanya berfungsi jika SPA dan API berkongsi domain (cookie tak merentas domain berbeza). Maka:

```
https://juniorinnovathon.rtm.gov.my/             → React SPA (statik)
https://juniorinnovathon.rtm.gov.my/api/v1/...   → Laravel API (php-fpm)
```

Satu domain → tiada isu CORS untuk cookie, dan cookie `httpOnly` dihantar automatik.

---

## ⚠️ Pitfall utama: JANGAN double `/api`

Laravel **sudah** menambah prefix `api` pada `routes/api.php` secara automatik:

```php
// bootstrap/app.php (Laravel 11+)
->withRouting(
    web:       __DIR__.'/../routes/web.php',
    api:       __DIR__.'/../routes/api.php',
    apiPrefix: 'api',          // ← prefix /api ditambah DI SINI (default)
)
```

Dan group kita menambah `v1`:

```php
// routes/api.php  →  hasil: /api/v1/...
Route::prefix('v1')->group(function () { /* ... */ });
```

Jadi **Laravel sendiri** menghasilkan URL `/api/v1/...`. Di nginx, **hantar URI secara utuh** ke Laravel — **jangan** strip atau tambah `/api` lagi (kalau tidak jadi `/api/api/v1` atau 404).

> **Cadangan:** letak folder Laravel sebagai `/var/www/api`, tetapi **biarkan prefix `/api` datang daripada Laravel**, bukan daripada nama folder. Nama folder fizikal ≠ URL prefix. Sahkan dengan `php artisan route:list` — URL mesti terpapar `api/v1/...`.

---

## Susun atur fail (cadangan)

```
/var/www/
├── spa/            ← hasil `npm run build` (folder dist React)
│   ├── index.html
│   └── assets/
└── api/            ← aplikasi Laravel (docroot = api/public)
    ├── public/index.php
    ├── app/  routes/  ...
    └── .env
```

---

## Konfigurasi nginx (satu domain)

```nginx
server {
    listen 443 ssl http2;
    server_name juniorinnovathon.rtm.gov.my;

    # SSL (§3.8.1) — di-terminate di sini atau di CloudFront/ALB
    ssl_certificate     /etc/ssl/ji/fullchain.pem;
    ssl_certificate_key /etc/ssl/ji/privkey.pem;

    client_max_body_size 200M;              # upload video 3-min + slaid (§3.6)

    # ---------- API: /api/* → Laravel (php-fpm) ----------
    location ^~ /api/ {
        root /var/www/api/public;           # docroot Laravel
        try_files $uri /index.php?$query_string;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/api/public/index.php;
            fastcgi_param REQUEST_URI     $request_uri;   # kekalkan /api/v1/...
            fastcgi_param HTTPS           on;
        }
    }

    # ---------- SPA: selainnya → React build ----------
    root /var/www/spa;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # WAJIB: sokong React Router (refresh tak 404)
    }

    # Cache aset statik (hashed) selamanya; index.html jangan cache
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
    location = /index.html { add_header Cache-Control "no-cache"; }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}

# Alih semua HTTP → HTTPS
server { listen 80; server_name juniorinnovathon.rtm.gov.my; return 301 https://$host$request_uri; }
```

**Nota penting:**
- `try_files ... /index.html` pada SPA → tanpa ini, refresh pada `/guru/pasukan` akan 404 (server tiada fail itu; React Router yang handle).
- `location ^~ /api/` didahulukan supaya tidak jatuh ke SPA fallback.
- `REQUEST_URI $request_uri` memastikan Laravel nampak `/api/v1/...` penuh.

---

## Laravel — tetapan sokongan

```ini
# .env — same-origin
APP_URL=https://juniorinnovathon.rtm.gov.my
SESSION_DOMAIN=juniorinnovathon.rtm.gov.my
SANCTUM_STATEFUL_DOMAINS=juniorinnovathon.rtm.gov.my
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

- **TrustProxies** — bila nginx (atau ALB/CloudFront) di depan, percayai proxy supaya Laravel tahu `https` dan IP klien betul (kritikal untuk cookie `Secure` + URL betul). Laravel 11: `->withMiddleware(fn ($m) => $m->trustProxies(at: '*'))` (hadkan `at` kepada julat proxy di produksi).
- **CORS** — jika benar-benar same-origin, CORS tidak diperlukan. Kekalkan `config/cors.php` ketat (hanya domain SPA) sebagai jaring keselamatan.

---

## Alternatif AWS-native (selaras `aws-architecture.md`)

Jika menggunakan CloudFront + ECS (blueprint produksi dalam `CLAUDE.md`), capai same-origin melalui **path-based origin routing** pada satu distribution:

| Path pattern | Origin |
|---|---|
| `/api/*` | ALB → ECS Fargate (Laravel + nginx/php-fpm) |
| `/*` (default) | S3 (React build) |

- Satu domain CloudFront → cookie same-origin tanpa nginx kendiri.
- Pastikan CloudFront **forward cookie + header `X-XSRF-TOKEN`** dan **jangan cache** `/api/*`.
- Behavior `/api/*`: cache disabled, forward semua header/cookie/query.

> Kedua-dua corak sah: **nginx kendiri** (ringkas, satu instance/kontena) atau **CloudFront path routing** (skala penuh, 5,000 pengguna). Pilihan akhir bergantung topologi produksi RTM — sahkan dalam URS.

---

## Senarai semak

- [ ] `php artisan route:list` papar `api/v1/...` (bukan `api/api/...`)
- [ ] Refresh pada laluan dalam SPA (cth. `/admin/pengguna`) tidak 404
- [ ] `GET /sanctum/csrf-cookie` set cookie; login set `laravel_session` `HttpOnly`
- [ ] Cookie ada flag `Secure` + `SameSite=Lax` (TrustProxies + HTTPS betul)
- [ ] `client_max_body_size` cukup untuk upload video/slaid (atau guna S3 presigned)
- [ ] HTTP → HTTPS redirect aktif (§3.8.1)
