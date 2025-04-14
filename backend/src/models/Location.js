const mongoose = require("mongoose");

// Define schema for locations
const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "general",
    },
    // GeoJSON geometry field for storing location coordinates
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    // Additional properties for the location
    properties: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // User who created the location (for authentication)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the geometry field for geospatial queries
LocationSchema.index({ geometry: "2dsphere" });

module.exports = mongoose.model("Location", LocationSchema); 