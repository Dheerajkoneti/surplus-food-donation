const express = require("express");
const mongoose = require("mongoose");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ======================================================
   ADD FOOD (Donor)
====================================================== */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { foodName, quantity, location } = req.body;

    if (!foodName || !quantity || !location?.coordinates) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cookedTime = new Date();
    const expiryTime = new Date(cookedTime.getTime() + 4 * 60 * 60 * 1000);

    const food = await Food.create({
      foodName,
      quantity,
      cookedTime,
      expiryTime,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      status: "Available",
      acceptedBy: null,
    });

    req.app.get("io")?.emit("food-added", food);

    res.status(201).json(food);
  } catch (err) {
    console.error("ADD FOOD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ACCEPT FOOD (NGO)
====================================================== */
router.put("/accept/:id", authMiddleware, async (req, res) => {
  try {
    const ngoId = req.user.id; // ✅ FROM JWT

    const food = await Food.findOneAndUpdate(
      { _id: req.params.id, status: "Available" },
      {
        status: "Accepted",
        acceptedBy: ngoId,
      },
      { new: true }
    );

    if (!food) {
      return res.status(400).json({ message: "Food already accepted" });
    }

    req.app.get("io")?.emit("food-accepted", food);

    res.json(food);
  } catch (err) {
    console.error("ACCEPT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   COMPLETE / DELIVER FOOD (NGO)
====================================================== */
router.put("/deliver/:id", authMiddleware, async (req, res) => {
  try {
    const ngoId = req.user.id;

    const food = await Food.findOne({
      _id: req.params.id,
      acceptedBy: ngoId,
    });

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    await Food.findByIdAndDelete(req.params.id);

    req.app.get("io")?.emit("food-completed", req.params.id);

    res.json({ success: true });
  } catch (err) {
    console.error("DELIVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET NEARBY FOOD (NGO)
====================================================== */
router.get("/nearby", authMiddleware, async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const ngoId = req.user.id;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const foods = await Food.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: 5000,
          query: {
            $or: [
              { status: "Available" },
              {
                status: "Accepted",
                acceptedBy: new mongoose.Types.ObjectId(ngoId),
              },
            ],
          },
        },
      },
      { $sort: { distance: 1 } },
    ]);

    res.json(foods);
  } catch (err) {
    console.error("NEARBY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;