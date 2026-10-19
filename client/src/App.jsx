import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import { fetchCurrentUser } from "./features/auth/authThunks";

export default function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, initialized]);

  return <AppRoutes />;
}
