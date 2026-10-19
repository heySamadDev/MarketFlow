
import { useSelector } from "react-redux";

const summaryCards = [
  {
    title: "Products",
    value: "Coming soon",
    description: "Manage your product catalog.",
    icon: "▦",
  },
  {
    title: "Orders",
    value: "Coming soon",
    description: "Track orders and fulfillment.",
    icon: "▤",
  },
  {
    title: "Revenue",
    value: "Coming soon",
    description: "Monitor your store's performance.",
    icon: "↗",
  },
];

export default function Dashboard() {
  const { user, error } = useSelector((state) => state.auth);
  const displayName = user?.name || "there";

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          WORKSPACE OVERVIEW
        </div>

        <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome, {displayName}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Here's your workspace at a glance. Your store management tools
          will live here as MarketFlow grows.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </section>

      <section className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <p className="mt-4 text-xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                {card.icon}
              </div>
            </div>

            <p className="mt-3 text-sm leading-5 text-slate-500">
              {card.description}
            </p>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-400">
                Feature coming soon
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Your account</p>
            <p className="mt-1 text-sm text-slate-500">
              You're signed in to MarketFlow.
            </p>
          </div>

          <div className="max-w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="mr-2 text-slate-400">Email</span>
            <span className="break-all font-medium">
              {user?.email || "Not available"}
            </span>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-slate-200 py-5 text-xs text-slate-400">
        MarketFlow · Your commerce workspace
      </footer>
    </main>
  );
}
