
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-slate-900 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold">
              M
            </div>
            <span className="text-xl font-semibold tracking-tight">
              MarketFlow
            </span>
          </div>

          <div className="relative max-w-lg">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
              Commerce, simplified
            </p>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              Your business.
              <br />
              One clear view.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">
              Manage your marketplace experience with a workspace designed
              to keep everything moving.
            </p>
          </div>

          <p className="relative text-sm text-slate-500">
            © {new Date().getFullYear()} MarketFlow
          </p>
        </section>

        {/* Form panel */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold">
                M
              </div>
              <span className="text-xl font-semibold">MarketFlow</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                {title}
              </h2>
              <p className="mt-3 leading-6 text-slate-400">{subtitle}</p>
            </div>

            {children}

            <p className="mt-8 text-center text-xs leading-5 text-slate-500">
              By continuing, you agree to use MarketFlow responsibly and
              securely.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
