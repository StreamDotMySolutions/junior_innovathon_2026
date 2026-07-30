// Satu sumber kebenaran untuk konfigurasi (baca VITE_* — §6 frontend README)
const config = {
  baseUrl: import.meta.env.VITE_BASE_URL,
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME ?? "Junior Innovathon 2026",
  defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE ?? "ms",
};

// Gagal pantas jika env penting hilang (dalam mod dev)
if (import.meta.env.DEV) {
  ["baseUrl", "apiUrl"].forEach((k) => {
    if (!config[k]) console.error(`[config] VITE_ untuk "${k}" tidak ditetapkan`);
  });
}

export default config;
