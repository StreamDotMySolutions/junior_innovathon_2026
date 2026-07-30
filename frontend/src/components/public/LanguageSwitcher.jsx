import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "ms", label: "BM" },
  { code: "en", label: "EN" },
];

/** Penukar bahasa ringkas (BM / EN) — simpan pilihan dalam localStorage via i18n detector. */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Language switcher">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`btn ${current === code ? "btn-light" : "btn-outline-light"}`}
          aria-pressed={current === code}
          onClick={() => i18n.changeLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
