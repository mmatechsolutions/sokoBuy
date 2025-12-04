import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/authcontext";
import { useNavigate } from "react-router-dom";
import "./signin.css";

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
        navigate("/"); // Redirect after successful login
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
    <div className="signin-container">
      <h2 className="signin-title">Sign In</h2>

      {error && <p className="signin-error">{error}</p>}

      <form onSubmit={submit} className="signin-form">
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
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="signin-footer">
        <a href="/forgot-reset">Forgot password?</a>
        <br />
        No account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
