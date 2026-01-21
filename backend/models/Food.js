const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    // 🍱 Basic food details
    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: String,
      required: true,
      trim: true,
    },

    // ⏱ Food safety timings
    cookedTime: {
      type: Date,
      required: true,
    },

    expiryTime: {
      type: Date,
      required: true,
    },

    // 📍 GeoJSON location (for nearby search)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (val) {
            return val.length === 2;
          },
          message: "Location must have [longitude, latitude]",
        },
      },
    },

    // 🚦 Donation status
    status: {
      type: String,
      enum: ["Available", "Accepted", "Delivered"],
      default: "Available",
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// 🌍 Geo index for location-based queries
foodSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Food", foodSchema);
