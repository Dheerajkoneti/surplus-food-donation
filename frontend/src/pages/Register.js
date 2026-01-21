import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import AuthCard from "../components/AuthCard";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DONOR");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      alert("Registered successfully");
      navigate("/");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <AuthCard title="Create Account" subtitle="Join the food rescue movement">
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="DONOR">Donor</option>
        <option value="NGO">NGO</option>
      </select>

      <button onClick={handleRegister}>REGISTER</button>

      <p className="auth-link">
        Already have an account? <Link to="/">Login</Link>
      </p>
    </AuthCard>
  );
}

export default Register;
