// ─────────────────────────────────────────────────────────────
// Penjana Laporan Kemajuan (PDF) — Junior Innovathon 2026
//
// Menangkap screenshot Portal Awam dari server preview yang sedang
// berjalan, kemudian menghasilkan PDF A4 berjenama untuk klien.
//
// PRASYARAT — server preview frontend mesti berjalan dahulu:
//   cd frontend && npm run build && npm run preview -- --port 4173
//
// GUNA:
//   node docs/reports/generate.mjs [--url http://localhost:4173] [--commit <sha>]
//
// OUTPUT:
//   docs/reports/laporan-kemajuan-ui.pdf
// ─────────────────────────────────────────────────────────────

import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const OUT = join(__dirname, "laporan-kemajuan-ui.pdf");

// ── Muat Playwright ──────────────────────────────────────────
// Cuba pakej setempat dahulu; jika tiada, cuba lokasi global biasa
// (persekitaran Claude Code on the web memasang Playwright secara global).
async function loadChromium() {
  const candidates = [
    "playwright",
    "/opt/node22/lib/node_modules/playwright/index.mjs",
  ];
  for (const spec of candidates) {
    try {
      const mod = await import(spec);
      return mod.chromium;
    } catch {
      /* cuba seterusnya */
    }
  }
  throw new Error(
    "Playwright tidak dijumpai. Pasang dengan: npm i -D playwright && npx playwright install chromium"
  );
}
const chromium = await loadChromium();

// ── Argumen ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const URL = getArg("--url", "http://localhost:4173");

// Tarikh & commit dijana di luar Playwright (kekal deterministik)
let commit = getArg("--commit", "");
if (!commit) {
  try {
    commit = execSync("git rev-parse --short HEAD", { cwd: REPO }).toString().trim();
  } catch {
    commit = "n/a";
  }
}
const bulan = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
const now = new Date();
const DATE = `${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;

// ── Cari executable Chromium (guna Playwright bundled jika ada) ─
function chromiumPath() {
  // Playwright akan guna PLAYWRIGHT_BROWSERS_PATH secara automatik;
  // pulangkan undefined supaya Playwright memilih sendiri.
  return undefined;
}

// ── Utama ────────────────────────────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), "ji-report-"));
const shot = (name) => join(tmp, name);
const b64 = (p) => "data:image/png;base64," + readFileSync(p).toString("base64");

const exe = chromiumPath();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

try {
  // 1) Tangkap screenshot resolusi tinggi
  const desktop = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  await desktop.goto(`${URL}/`, { waitUntil: "networkidle" });
  await desktop.waitForTimeout(700);
  await desktop.screenshot({ path: shot("home-desktop.png"), fullPage: true });

  await desktop.goto(`${URL}/syarat-pertandingan`, { waitUntil: "networkidle" });
  await desktop.waitForTimeout(400);
  await desktop.screenshot({ path: shot("rules-desktop.png"), fullPage: true });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  await mobile.goto(`${URL}/`, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(700);
  await mobile.screenshot({ path: shot("home-mobile.png"), fullPage: true });

  // 2) Bina HTML laporan (imej ditanam sebagai base64 → PDF self-contained)
  const html = buildHtml({
    date: DATE,
    commit,
    homeDesktop: b64(shot("home-desktop.png")),
    rulesDesktop: b64(shot("rules-desktop.png")),
    homeMobile: b64(shot("home-mobile.png")),
  });

  // 3) Hasilkan PDF
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.pdf({
    path: OUT,
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
  });

  console.log(`✓ PDF dijana: ${OUT}`);
  console.log(`  Tarikh: ${DATE} · Binaan: ${commit}`);
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}

// ── Templat HTML ─────────────────────────────────────────────
function buildHtml({ date, commit, homeDesktop, rulesDesktop, homeMobile }) {
  return `<!doctype html><html lang="ms"><head><meta charset="utf-8">
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color:#1a2332; font-size:10.5pt; line-height:1.5; }
  h1 { font-size:19pt; color:#0d3b66; margin:0 0 2pt; letter-spacing:-.01em; }
  h2 { font-size:13pt; color:#0d3b66; margin:0 0 6pt; border-bottom:2px solid #ffc107; padding-bottom:3pt; }
  h3 { font-size:10.5pt; margin:10pt 0 3pt; color:#062c52; }
  .sub { color:#4b5563; margin:0 0 2pt; }
  .meta { color:#6c757d; font-size:8.5pt; }
  .rule { height:3px; background:#0d3b66; border:0; margin:8pt 0 12pt; }
  table { width:100%; border-collapse:collapse; margin:4pt 0 8pt; }
  th,td { border:1px solid #e5e7eb; padding:4pt 7pt; text-align:left; vertical-align:top; }
  th { background:#f1f5f9; color:#0d3b66; font-size:9pt; }
  td { font-size:9.5pt; }
  ul { margin:3pt 0 8pt; padding-left:16pt; }
  li { margin:1.5pt 0; }
  code { background:#f1f5f9; padding:1px 4px; border-radius:3px; font-size:8.5pt; }
  .shot { max-height:232mm; width:auto; max-width:100%; display:block; margin:3pt auto; border:1px solid #d5dbe3; border-radius:4px; }
  .shotwrap { page-break-inside:avoid; text-align:center; }
  .cap { font-size:8pt; color:#6c757d; margin:0 0 10pt; text-align:center; }
  .two { display:flex; gap:10pt; }
  .two .col { flex:1; }
  .mob { max-height:150mm; display:block; margin:0 auto; border:1px solid #d5dbe3; border-radius:4px; }
  .badge { display:inline-block; background:#0d3b66; color:#fff; border-radius:10px; padding:1px 8pt; font-size:8pt; margin-right:4pt; }
  .pill { display:inline-block; background:#fff3cd; color:#7a5b00; border:1px solid #ffe08a; border-radius:4px; padding:1px 6pt; font-size:8pt; }
  .pagebreak { page-break-before: always; }
  footer { position:fixed; bottom:-10mm; left:0; right:0; text-align:center; color:#9aa4b2; font-size:7.5pt; }
  header.brand { border-left:5px solid #ffc107; padding-left:10pt; margin-bottom:10pt; }
</style></head><body>

<header class="brand">
  <h1>Junior Innovathon 2026 — Laporan Kemajuan Pembangunan</h1>
  <p class="sub">Portal Sistem Pendaftaran, Saringan, Penjurian &amp; Pelaporan · Anjuran RTM</p>
  <p class="meta">Disediakan oleh Stream.My · ${date} · Rujukan binaan: ${commit}</p>
</header>
<hr class="rule">

<h2>1. Ringkasan Eksekutif</h2>
<p>Dokumen ini melaporkan kemajuan pembangunan portal <strong>Junior Innovathon 2026</strong>. Setakat ini,
seni bina sistem (backend &amp; frontend) telah dikunci sepenuhnya, dan <strong>antara muka pengguna awam (Portal Awam)</strong>
telah dibangunkan sebagai aplikasi React sebenar — bukan lagi lakaran (mockup). Semua paparan menyokong
<strong>dwibahasa (Bahasa Melayu / English)</strong> dan reka bentuk responsif (desktop &amp; telefon).</p>

<h3>Status komponen</h3>
<table>
  <tr><th>Komponen</th><th>Status</th><th>Catatan</th></tr>
  <tr><td>Seni bina backend (Laravel API)</td><td>✅ Dikunci</td><td>RBAC, service layer, /api/v1, Sanctum, Pest</td></tr>
  <tr><td>Seni bina frontend (React)</td><td>✅ Dikunci</td><td>Vite, Bootstrap 5, i18n, CSS mobile/desktop berasingan</td></tr>
  <tr><td>Skema pangkalan data</td><td>✅ Dikunci</td><td>Event → Team → Project; 7 peranan</td></tr>
  <tr><td>Aliran pendaftaran</td><td>✅ Direka</td><td>Event → Team → Project → verify (state machine)</td></tr>
  <tr><td>Portal Awam (UI)</td><td>✅ Siap dibina</td><td>Utama + Syarat Pertandingan (lihat §3)</td></tr>
  <tr><td>Modul berautentikasi</td><td>⏳ Seterusnya</td><td>Daftar/Log Masuk, Mentor, Jury, Studio</td></tr>
</table>

<h2>2. Keputusan Seni Bina (Ringkas)</h2>
<h3>Tujuh peranan sistem (RBAC — Spatie)</h3>
<p>
<span class="badge">Mentor</span><span class="badge">Participant</span><span class="badge">Jury</span>
<span class="badge">Scroller</span><span class="badge">Broadcaster</span><span class="badge">Admin</span><span class="badge">Public</span>
</p>
<table>
  <tr><th>Peranan</th><th>Fungsi</th></tr>
  <tr><td>Mentor</td><td>Guru pembimbing — daftar Team, tambah peserta, cipta Project, muat naik bahan</td></tr>
  <tr><td>Participant</td><td>Pelajar peserta — semak status penyertaan &amp; sijil</td></tr>
  <tr><td>Jury</td><td>Penjurian saringan zon &amp; studio (markah masa nyata)</td></tr>
  <tr><td>Scroller</td><td>Pengawal sesi studio langsung — pilih projek, pacu UI juri</td></tr>
  <tr><td>Broadcaster</td><td>Papar markah gabungan sebagai overlay OBS untuk siaran</td></tr>
  <tr><td>Admin</td><td>Cipta Event, pengurusan platform, laporan</td></tr>
  <tr><td>Public</td><td>Portal awam — maklumat, sijil, verifikasi</td></tr>
</table>

<h3>Model domain pertandingan</h3>
<p><code>Admin cipta Event → Mentor daftar Team (1 Event) → Mentor cipta Project (1/Team) → muat naik video 3-min + slaid → hantar untuk pengesahan Admin</code></p>

<h3>Timbunan teknologi</h3>
<table>
  <tr><th>Lapisan</th><th>Teknologi</th></tr>
  <tr><td>Frontend</td><td>ReactJS 18 · Vite · Bootstrap 5 · i18next (BM/EN)</td></tr>
  <tr><td>Backend</td><td>Laravel (API) · Sanctum · Spatie RBAC · Pest</td></tr>
  <tr><td>Data</td><td>MySQL 8 · Redis</td></tr>
  <tr><td>Awan</td><td>AWS ap-southeast-5 (Malaysia) · nginx · CloudFront</td></tr>
</table>

<div class="pagebreak"></div>
<h2>3. Antara Muka — Portal Awam</h2>

<h3>3.1 Halaman Utama (Desktop)</h3>
<div class="shotwrap"><img class="shot" src="${homeDesktop}"></div>
<p class="cap">Hero berjenama, ringkasan program, 4 fasa pertandingan, statistik penyertaan, jadual 6 episod studio,
penaja, galeri sorotan, soalan lazim, dan hubungi kami — kesemuanya dalam Bahasa Melayu (boleh tukar ke English).</p>

<div class="pagebreak"></div>
<h3>3.2 Syarat Pertandingan (Desktop)</h3>
<div class="shotwrap"><img class="shot" src="${rulesDesktop}"></div>
<p class="cap">Kelayakan, kategori penyertaan, dan keperluan penyerahan dipaparkan dengan jelas.</p>

<div class="two" style="margin-top:8pt;">
  <div class="col">
    <h3>3.3 Paparan Telefon (Responsif)</h3>
    <p style="font-size:9.5pt;">Reka bentuk mudah alih menggunakan fail CSS berasingan untuk telefon &amp; desktop:
    hero lebih padat, butang penuh lebar, susun atur satu lajur, dan grid penaja 2 lajur.
    Sesuai untuk guru &amp; pelajar yang mendaftar melalui telefon.</p>
    <p><span class="pill">i18n</span> <span class="pill">Responsif</span> <span class="pill">Tema RTM</span></p>
  </div>
  <div class="col" style="flex:0 0 62mm;">
    <img class="mob" src="${homeMobile}">
  </div>
</div>

<h2 class="pagebreak">4. Langkah Seterusnya</h2>
<ul>
  <li><strong>Modul pengesahan</strong> — borang Daftar &amp; Log Masuk disambung ke Laravel Sanctum.</li>
  <li><strong>Portal Mentor</strong> — pendaftaran Team, tambah peserta, cipta Project, muat naik video/slaid (S3).</li>
  <li><strong>Modul Penjurian</strong> — saringan zon &amp; sesi studio langsung (Scroller → Jury → Broadcaster).</li>
  <li><strong>Sambungan data langsung</strong> — statistik penyertaan &amp; jadual episod dari API.</li>
</ul>
<p class="meta">Nota: angka statistik &amp; imej galeri dalam paparan semasa adalah data contoh; akan disambung
ke pangkalan data sebenar apabila modul backend siap.</p>

<footer>Junior Innovathon 2026 · Laporan Kemajuan · Stream.My · Sulit — untuk semakan klien</footer>
</body></html>`;
}
