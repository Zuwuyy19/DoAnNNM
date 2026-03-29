import api from "./api";

const TOKEN_KEY = "token";

// ================= TOKEN =================
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ================= AUTH =================

// LOGIN
export const login = async (data) => {
  const res = await api.post("/auth/login", data);

  const token = res.data.token || res.data.accessToken;

  if (token) {
    saveToken(token);
  }

  return res.data;
};

// REGISTER
export const register = async (data) => {
  return await api.post("/auth/register", data);
};

// PROFILE
export const getProfile = async () => {
  return await api.get("/user/profile");
};

// LOGOUT
export const logout = () => {
  removeToken();
};