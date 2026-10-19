import { NavLink, Link } from "react-router-dom";

const navigationItems = [
  { label: "Overview", icon: "◫", to: "/dashboard" },
  { label: "Products", icon: "▦", to: "/products" },
  { label: "Orders", icon: "▤", to: "/orders" },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        id="marketflow-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 px-5 py-7 text-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold shadow-lg shadow-indigo-500/20">
              M
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">MarketFlow</h1>
              <p className="text-xs text-slate-400">Commerce workspace</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="mt-10">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          <nav aria-label="Dashboard navigation" className="space-y-1.5">
            {navigationItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className="w-5 text-center text-lg"
                    >
                      {item.icon}
                    </span>

                    {item.label}

                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-indigo-300">
              ?
            </div>

            <p className="text-sm font-semibold text-white">Need a hand?</p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Your workspace is ready to grow.
            </p>
          </div>

          <p className="mt-6 px-1 text-xs text-slate-600">
            MarketFlow · Dashboard
          </p>
        </div>
      </aside>
    </>
  );
}
