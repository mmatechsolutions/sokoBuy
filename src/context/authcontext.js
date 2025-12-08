import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);

  // Load logged-in user on first load
  useEffect(() => {
    if (token) {
      setLoading(false);
      // Optional: fetch user details if you have a /me endpoint
      // fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      //   .then(res => res.json())
      //   .then(data => setUser(data.user))
      //   .catch(() => signout())
      //   .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // SIGNUP
  const signup = async (formData) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  };

  // SIGNIN
  const signin = async (emailOrPhone, password) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone, password }),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  };

  // SIGNOUT
  const signout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        signin,
        signout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
