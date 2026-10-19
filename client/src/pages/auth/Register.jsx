import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../features/auth/authThunks";
import { clearAuthError } from "../../features/auth/authSlice";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
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

    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Please sign in." },
      });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with your MarketFlow workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Full name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          />
        </div>

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
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          />
          <p className="mt-2 text-xs text-slate-500">
            Use at least 8 characters.
          </p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-300 transition hover:text-indigo-200"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
