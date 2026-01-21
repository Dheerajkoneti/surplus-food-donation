import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

/* 🧷 Fix default marker icon issue */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* 🖱️ Double-click to select location */
function SelectLocationOnDblClick({ setPosition, setLocation }) {
  useMapEvents({
    dblclick(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLocation({
        type: "Point",
        coordinates: [lng, lat],
      });
    },
  });
  return null;
}

function DonorDashboard() {
  const navigate = useNavigate();

  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [position, setPosition] = useState(null);
  const [location, setLocation] = useState(null);

  /* 🔓 LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  /* 📍 Auto-detect current location */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setPosition([lat, lng]);
        setLocation({
          type: "Point",
          coordinates: [lng, lat],
        });
      },
      () => alert("Location permission denied"),
      { enableHighAccuracy: true }
    );
  }, []);

  /* 🍲 Donate food */
  const donateFood = async () => {
    if (!foodName.trim() || !quantity.trim() || !location?.coordinates) {
      alert("Please fill all fields and confirm location");
      return;
    }

    try {
      await api.post("/food/add", {
        foodName,
        quantity,
        location: {
          type: "Point",
          coordinates: location.coordinates,
        },
      });

      alert("Food donated successfully");
      setFoodName("");
      setQuantity("");
    } catch (err) {
      console.error("DONATE ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Donation failed");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 🔴 LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          background: "#e74c3c",
          padding: "8px 16px",
          borderRadius: "10px",
          border: "none",
          color: "#fff",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <h2>Donor Dashboard</h2>

      <input
        placeholder="Food Name"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />

      <input
        placeholder="Quantity (e.g. 10 plates)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        style={{ marginTop: "10px" }}
      />

      {/* 🗺 MAP */}
      {position && (
        <div style={{ marginTop: "15px" }}>
          <p>
            <b>Select pickup location:</b>
          </p>

          <MapContainer
            center={position}
            zoom={18}
            doubleClickZoom={false}
            scrollWheelZoom
            style={{
              height: "300px",
              width: "100%",
              borderRadius: "12px",
            }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri — Maxar"
            />

            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri"
            />

            <SelectLocationOnDblClick
              setPosition={setPosition}
              setLocation={setLocation}
            />

            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  setPosition([lat, lng]);
                  setLocation({
                    type: "Point",
                    coordinates: [lng, lat],
                  });
                },
              }}
            />

            <Circle center={position} radius={30} />
          </MapContainer>

          <p style={{ color: "#2ecc71", marginTop: "8px" }}>
            📍 Location confirmed
          </p>
        </div>
      )}

      <button onClick={donateFood} style={{ marginTop: "15px" }}>
        Donate
      </button>
    </div>
  );
}

export default DonorDashboard;
