// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api"; // axios instance

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // ✅ Keep token synced in axios + localStorage
  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete API.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // ✅ Verify user on mount (if token exists)
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get("/auth/verify");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Auth check failed:", err.response?.data || err.message);
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);
// ✅ Login
const login = async (credentials) => {
  try {
    const res = await API.post("/auth/login", credentials);
    console.log("Login response:", res.data); // 🔍 check what backend sends

    const { token: newToken, user: loggedUser } = res.data;

    if (!newToken || !loggedUser) {
      return { success: false, msg: "Invalid response from server" };
    }

    setToken(newToken);
    setUser(loggedUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(loggedUser));

    return { success: true, user: loggedUser, token: newToken };
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    return { success: false, msg: err.response?.data?.msg || "Login failed" };
  }
};


  // ✅ Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
