import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import NGODashboard from "./pages/NGODashboard";

/* 🔐 Protected Route */
function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔑 LOGIN */}
        <Route
          path="/"
          element={
            <div
              className="app-bg"
              style={{ backgroundImage: "url(/images/food-bg.jpg)" }}
            >
              <Login />
            </div>
          }
        />

        {/* 📝 REGISTER */}
        <Route
          path="/register"
          element={
            <div
              className="app-bg"
              style={{ backgroundImage: "url(/images/food-bg.jpg)" }}
            >
              <Register />
            </div>
          }
        />

        {/* 🍲 DONOR DASHBOARD */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute role="DONOR">
              <div
                className="app-bg"
                style={{ backgroundImage: "url(/images/food-bg.jpg)" }}
              >
                <div className="app-container">
                  <DonorDashboard />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* 🏥 NGO DASHBOARD */}
        <Route
          path="/ngo"
          element={
            <ProtectedRoute role="NGO">
              <div
                className="app-bg"
                style={{ backgroundImage: "url(/images/food-bg.jpg)" }}
              >
                <div className="app-container">
                  <NGODashboard />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;