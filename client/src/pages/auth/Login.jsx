import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/auth/authThunks";
import { clearAuthError } from "../../features/auth/authSlice";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const location = useLocation();
  const successMessage = location.state?.message;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    dispatch(clearAuthError());

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your MarketFlow workspace."
    >
      {successMessage && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          {successMessage}
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>
          </div>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-indigo-300 transition hover:text-indigo-200"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
