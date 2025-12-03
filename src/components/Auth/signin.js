import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const { signin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signin(form.identifier, form.password);
      if (data?.token) {
        navigate("/"); // Redirect to homepage after successful login
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: "center" }}>Sign In</h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <form
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <input
          name="identifier"
          placeholder="Phone or Email"
          value={form.identifier}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            backgroundColor: "#3a4750",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 10 }}>
        <a href="/forgot-reset">Forgot password?</a>
        <br />
        No account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
