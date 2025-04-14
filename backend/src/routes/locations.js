const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { protect } = require("../middleware/auth");
const {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getNearbyLocations,
  uploadGeoJSON,
} = require("../controllers/locationController");

// @route   GET /api/locations
// @desc    Get all locations with pagination, filtering, and sorting
// @access  Public
router.get("/", getLocations);

// @route   GET /api/locations/nearby
// @desc    Get locations within a specific radius
// @access  Public
router.get("/nearby", getNearbyLocations);

// @route   POST /api/locations/geojson
// @desc    Upload GeoJSON data and save to the database
// @access  Private
router.post("/geojson", protect, uploadGeoJSON);

// @route   POST /api/locations
// @desc    Create a new location
// @access  Private
router.post(
  "/",
  protect,
  [
    check("name", "Name is required").not().isEmpty(),
    check("geometry", "Geometry is required").not().isEmpty(),
    check("geometry.type", "Geometry type must be Point").equals("Point"),
    check("geometry.coordinates", "Coordinates are required").isArray({ min: 2, max: 2 }),
  ],
  createLocation
);

// @route   GET /api/locations/:id
// @desc    Get a location by ID
// @access  Public
router.get("/:id", getLocationById);

// @route   PUT /api/locations/:id
// @desc    Update a location
// @access  Private
router.put(
  "/:id",
  protect,
  [
    check("name", "Name is required").not().isEmpty(),
    check("geometry.type", "Geometry type must be Point").optional().equals("Point"),
    check("geometry.coordinates", "Coordinates must be an array of 2 numbers")
      .optional()
      .isArray({ min: 2, max: 2 }),
  ],
  updateLocation
);

// @route   DELETE /api/locations/:id
// @desc    Delete a location
// @access  Private
router.delete("/:id", protect, deleteLocation);

module.exports = router; 