import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

/** Header awam — jenama, navigasi, penukar bahasa, pautan Daftar & Log Masuk. */
export default function PublicHeader() {
  const { t } = useTranslation();

  const navLinkClass = ({ isActive }) =>
    `nav-link${isActive ? " active fw-semibold" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark ji-hero sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand ji-brand-mark" to="/">
          {t("app.name")}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#publicNav"
          aria-controls="publicNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="publicNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className={navLinkClass}>
                {t("nav.home")}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/syarat-pertandingan" className={navLinkClass}>
                {t("nav.rules")}
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            <LanguageSwitcher />
            <Link to="/login" className="btn btn-outline-light btn-sm">
              {t("nav.login")}
            </Link>
            <Link to="/register" className="btn btn-warning btn-sm fw-semibold">
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
