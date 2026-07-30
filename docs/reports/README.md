# Laporan Kemajuan (PDF)

Penjana **Laporan Kemajuan Pembangunan** untuk ditunjukkan kepada klien (RTM).
Mengambil screenshot Portal Awam secara langsung dari binaan sebenar, lalu
menghasilkan PDF A4 berjenama (tema navy/amber RTM).

## Fail

| Fail | Keterangan |
|---|---|
| `generate.mjs` | Skrip penjana (screenshot → HTML → PDF) |
| `laporan-kemajuan-ui.pdf` | Output terkini (di-commit untuk rujukan mudah) |

## Cara jana semula

Skrip menangkap dari **server preview frontend** — jadi pastikan ia berjalan dahulu:

```bash
# 1) Bina & jalankan preview frontend
cd frontend
npm install            # sekali sahaja
npm run build
npm run preview -- --port 4173 &

# 2) Jana PDF (dari root repo)
cd ..
node docs/reports/generate.mjs
```

Output: `docs/reports/laporan-kemajuan-ui.pdf`.

### Pilihan

```bash
node docs/reports/generate.mjs --url http://localhost:4173 --commit c18fc66
```

- `--url`  — alamat server preview (lalai `http://localhost:4173`).
- `--commit` — SHA binaan untuk footer (lalai: `git rev-parse --short HEAD`).

Tarikh laporan diambil automatik daripada tarikh semasa (format BM).

## Prasyarat

- **Node** + **Playwright** (`chromium`). Dalam persekitaran ini Chromium sudah
  dipasang (`PLAYWRIGHT_BROWSERS_PATH`), jadi Playwright memilihnya automatik.
  Jika di mesin lain: `npm i -D playwright && npx playwright install chromium`.

## Kandungan laporan

1. **Ringkasan Eksekutif** — jadual status komponen.
2. **Keputusan Seni Bina** — 7 peranan, model Event→Team→Project, timbunan teknologi.
3. **Antara Muka** — screenshot Home (desktop), Syarat Pertandingan, paparan telefon.
4. **Langkah Seterusnya**.

> Untuk mengemas kini kandungan teks/jadual, sunting fungsi `buildHtml()` dalam `generate.mjs`.
