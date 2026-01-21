import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function NGODashboard() {
  const [foods, setFoods] = useState([]);
  const [ngoLoc, setNgoLoc] = useState(null);
  const navigate = useNavigate();

  /* 🔓 LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  /* 📍 Get NGO location */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNgoLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Location permission required")
    );
  }, []);

  /* 🔁 Fetch nearby food */
  useEffect(() => {
    if (!ngoLoc) return;

    const fetchFoods = async () => {
      try {
        const res = await api.get(
          `/food/nearby?lat=${ngoLoc.lat}&lng=${ngoLoc.lng}`
        );
        setFoods(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFoods();
    const interval = setInterval(fetchFoods, 5000);
    return () => clearInterval(interval);
  }, [ngoLoc]);

  /* 🔔 Socket updates */
  useEffect(() => {
    socket.on("food-added", () => window.location.reload());
    socket.on("food-accepted", () => window.location.reload());
    socket.on("food-completed", () => window.location.reload());
  }, []);

  /* ✅ ACCEPT FOOD */
  const acceptFood = async (id) => {
    try {
      await api.put(`/food/accept/${id}`);
      alert("Food accepted");
    } catch (err) {
      alert(err.response?.data?.message || "Accept failed");
    }
  };

  /* ✅ COMPLETE FOOD */
  const completeFood = async (id) => {
    try {
      await api.put(`/food/deliver/${id}`);
      alert("Delivery completed");
    } catch (err) {
      alert(err.response?.data?.message || "Complete failed");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 🔓 LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "-50px",
          right: "0",
          background: "#e74c3c",
          color: "#fff",
          padding: "8px 16px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Logout
      </button>

      <h2>NGO Dashboard</h2>

      {foods.length === 0 && <p>No nearby food available</p>}

      {foods.map((food) => {
        const minsLeft = Math.max(
          0,
          Math.floor((new Date(food.expiryTime) - Date.now()) / 60000)
        );

        return (
          <div key={food._id} className="ngo-card">
            <div className="ngo-card-left">
              <h3 className="food-title">{food.foodName}</h3>

              <div className="meta-row">
                <span className="pill info">🍽 {food.quantity}</span>
                <span className="pill warning">⏰ {minsLeft} mins</span>
                <span className="pill">
                  📏 {(food.distance / 1000).toFixed(2)} km
                </span>
              </div>

              <a
                className="map-link"
                href={`https://maps.google.com/?q=${food.location.coordinates[1]},${food.location.coordinates[0]}`}
                target="_blank"
                rel="noreferrer"
              >
                📍 View on Map
              </a>
            </div>

            <div className="ngo-card-actions">
              {food.status === "Available" && (
                <button
                  className="btn accept"
                  onClick={() => acceptFood(food._id)}
                >
                  ACCEPT
                </button>
              )}

              {food.status === "Accepted" && (
                <button
                  className="btn complete"
                  onClick={() => completeFood(food._id)}
                >
                  COMPLETE
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default NGODashboard;