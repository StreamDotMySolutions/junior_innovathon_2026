import { Outlet } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader.jsx";
import PublicFooter from "@/components/public/PublicFooter.jsx";

/**
 * Layout awam (public) — header + kandungan + footer.
 * Nota: role `public` tiada auth. Untuk role ini kita guna satu layout
 * responsif (Bootstrap grid) — pemisahan mobile/desktop dikekalkan untuk
 * role berautentikasi (Mentor/Jury/dll), lihat docs/frontend/README.md §3–4.
 */
export default function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
