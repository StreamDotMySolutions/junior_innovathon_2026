import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Footer awam — ringkasan program, pautan pantas, hubungi, hak cipta. */
export default function PublicFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="ji-footer pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <h5 className="ji-brand-mark text-white">{t("app.name")}</h5>
            <p className="small mb-0">{t("footer.about")}</p>
          </div>

          <div className="col-md-3">
            <h6 className="text-white">{t("footer.quick_links")}</h6>
            <ul className="list-unstyled small">
              <li>
                <Link className="link-light text-decoration-none" to="/">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link className="link-light text-decoration-none" to="/syarat-pertandingan">
                  {t("nav.rules")}
                </Link>
              </li>
              <li>
                <Link className="link-light text-decoration-none" to="/register">
                  {t("nav.register")}
                </Link>
              </li>
              <li>
                <Link className="link-light text-decoration-none" to="/login">
                  {t("nav.login")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="text-white">{t("footer.contact")}</h6>
            <p className="small mb-0">
              Radio Televisyen Malaysia (RTM)
              <br />
              Angkasapuri, 50614 Kuala Lumpur
            </p>
          </div>
        </div>

        <hr className="border-secondary my-4" />
        <p className="small text-center mb-0">
          © {year} {t("app.name")}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
