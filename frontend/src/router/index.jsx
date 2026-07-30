import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "@/layouts/public/PublicLayout.jsx";
import NotFound from "@/views/public/NotFound.jsx";
import publicRoutes from "./routes/public.jsx";

// Cermin routes/api.php — buat masa ini hanya kumpulan public (tiada auth).
// Kumpulan Mentor/Participant/Jury/Scroller/Broadcaster/Admin akan menyusul.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [...publicRoutes, { path: "*", element: <NotFound /> }],
  },
]);
