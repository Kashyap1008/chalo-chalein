import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");
      if (token) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem("user");
          }
        }
        try {
          const res = await axios.get("/auth/profile/");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (e) {
          // If profile fetch fails and refresh fails, user will be logged out by interceptor
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const persistSession = (data) => {
    const access = data.access || data.tokens?.access;
    const refresh = data.refresh || data.tokens?.refresh;
    if (access) localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post("/auth/login/", { email, password });
    persistSession(res.data);
    return res.data;
  };

  const signup = async ({ name, email, password, username }) => {
    const res = await axios.post("/auth/signup/", {
      name,
      email,
      password,
      password2: password,
      username: username || (name ? name.replace(/\s+/g, "_").toLowerCase() : undefined),
    });
    persistSession(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = async (patch) => {
    const res = await axios.patch("/auth/me/", patch);
    const updated = { ...user, ...res.data };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    await axios.delete("/auth/me/");
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
