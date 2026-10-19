import api from "./api";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

const authService = {
  register,
  login,
  getCurrentUser,
  logout,
};

export default authService;
