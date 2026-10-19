
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { logoutUser } from "../../features/auth/authThunks";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, status } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());

    if (logoutUser.fulfilled.match(result)) {
      navigate("/login", { replace: true });
    }
  };

  const pageTitle =
    location.pathname === "/products"
      ? "Products"
      : location.pathname === "/orders"
        ? "Orders"
        : "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-controls="marketflow-sidebar"
                aria-expanded={isMobileSidebarOpen}
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
              >
                ☰
              </button>

              <div className="min-w-0 lg:hidden">
                <p className="truncate text-sm font-bold tracking-tight">
                  MarketFlow
                </p>
                <p className="text-xs text-slate-500">Your workspace</p>
              </div>

              <div className="hidden lg:block">
                <p className="text-xs font-medium text-slate-500">
                  WORKSPACE / {pageTitle.toUpperCase()}
                </p>
                <h1 className="mt-1 text-lg font-semibold">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-48 truncate text-sm font-semibold">
                  {user?.name || "Your account"}
                </p>
                <p className="max-w-48 truncate text-xs text-slate-500">
                  {user?.email || ""}
                </p>
              </div>

              <div
                aria-label={`Signed in as ${user?.name || user?.email || "user"}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 sm:h-10 sm:w-10"
              >
                {(user?.name || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
              >
                {isLoading ? "Wait..." : "Log out"}
              </button>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
