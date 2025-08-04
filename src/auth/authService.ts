// src/auth/authService.ts
import axios from "axios";

const API = "http://localhost:3001/api/auth";

export const login = async (matricule: string, password: string) => {
  const res = await axios.post(`${API}/login`, { matricule, password });
  localStorage.setItem("user", JSON.stringify(res.data));
  return res.data;
};

export const register = async (user: any) => {
  const res = await axios.post(`${API}/register`, user);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("user");
};
