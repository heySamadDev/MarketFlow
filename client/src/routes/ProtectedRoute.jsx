import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { isAuthenticated, initialized, error } = useSelector(
    (state) => state.auth,
  );

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Checking your session...
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-300">
        <p>
          We couldn't verify your session. Please refresh the page to try again.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
