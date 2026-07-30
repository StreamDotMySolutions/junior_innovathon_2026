// Konfigurasi i18n — Bahasa Melayu default, English standby.
// Guna react-i18next; kesan bahasa dari localStorage → fallback ms.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import config from "@/config";

import ms from "./locales/ms.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ms: { translation: ms },
      en: { translation: en },
    },
    fallbackLng: config.defaultLocale, // "ms"
    supportedLngs: ["ms", "en"],
    interpolation: { escapeValue: false }, // React sudah selamat dari XSS
    detection: {
      order: ["localStorage", "htmlTag", "navigator"],
      lookupLocalStorage: "ji_locale",
      caches: ["localStorage"],
    },
  });

// Selaraskan atribut <html lang> apabila bahasa bertukar
i18n.on("languageChanged", (lng) => {
  document.documentElement.setAttribute("lang", lng);
});

export default i18n;
