import { lazy } from "react";

// Code-splitting ikut halaman (§ frontend README)
const Home = lazy(() => import("@/views/public/Home.jsx"));
const Rules = lazy(() => import("@/views/public/Rules.jsx"));
const Placeholder = lazy(() => import("@/views/public/Placeholder.jsx"));

// Path relatif kepada root "/" (PublicLayout)
export default [
  { index: true, element: <Home /> },
  { path: "syarat-pertandingan", element: <Rules /> },
  { path: "register", element: <Placeholder titleKey="nav.register" /> },
  { path: "login", element: <Placeholder titleKey="nav.login" /> },
];
