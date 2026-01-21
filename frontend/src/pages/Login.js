import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import AuthCard from "../components/AuthCard";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      // Save auth
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      // Role based redirect
      navigate(res.data.user.role === "DONOR" ? "/donor" : "/ngo");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <AuthCard
    title="SURPLUS FOOD DONATION"
    subtitle="Reducing food waste • Feeding communities"
  >
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
      disabled={loading}
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
      disabled={loading}
    />

    {error && (
      <p
        style={{
          color: "#ff7675",
          fontSize: "13px",
          marginBottom: "10px",
          marginTop: "4px",
        }}
      >
        {error}
      </p>
    )}

    <button
      onClick={handleLogin}
      disabled={loading}
      style={{
        opacity: loading ? 0.7 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? <span className="spinner"></span> : "LOGIN"}
    </button>

    <p className="auth-link">
      New user? <Link to="/register">Create account</Link>
    </p>
  </AuthCard>
);
}

export default Login;
