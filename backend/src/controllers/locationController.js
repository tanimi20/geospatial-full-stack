const Location = require("../models/Location");
const { validationResult } = require("express-validator");

// @route   POST /api/locations
// @desc    Create a new location
// @access  Private
const createLocation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from request body
    const {
      name,
      description,
      category,
      geometry,
      properties = {},
    } = req.body;

    // Create location
    const location = await Location.create({
      name,
      description,
      category,
      geometry,
      properties,
      // Add the user who created the location
      createdBy: req.user ? req.user._id : null,
    });

    res.status(201).json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/locations
// @desc    Get all locations with pagination, filtering, and sorting
// @access  Public
const getLocations = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by category
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Build sort object
    let sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      sort = { createdAt: -1 }; // Default sort by createdAt in descending order
    }

    // Get locations with pagination and filtering
    const locations = await Location.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const count = await Location.countDocuments(filter);

    res.json({
      locations,
      page,
      pages: Math.ceil(count / limit),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/locations/:id
// @desc    Get a location by ID
// @access  Public
const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(location);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PUT /api/locations/:id
// @desc    Update a location
// @access  Private
const updateLocation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      category,
      geometry,
      properties,
    } = req.body;

    // Build location object
    const locationFields = {};
    if (name) locationFields.name = name;
    if (description) locationFields.description = description;
    if (category) locationFields.category = category;
    if (geometry) locationFields.geometry = geometry;
    if (properties) locationFields.properties = properties;

    // Find location by ID
    let location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Check if user owns the location
    if (req.user && location.createdBy && location.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this location" });
    }

    // Update location
    location = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: locationFields },
      { new: true }
    );

    res.json(location);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @route   DELETE /api/locations/:id
// @desc    Delete a location
// @access  Private
const deleteLocation = async (req, res) => {
  try {
    // Find location by ID
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Check if user owns the location
    if (req.user && location.createdBy && location.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this location" });
    }

    // Delete location
    await Location.findByIdAndDelete(req.params.id);

    res.json({ message: "Location removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/locations/nearby
// @desc    Get locations within a specific radius
// @access  Public
const getNearbyLocations = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10000, limit = 10 } = req.query;

    // Validate input
    if (!longitude || !latitude) {
      return res.status(400).json({ message: "Longitude and latitude are required" });
    }

    // Convert radius from meters to kilometers
    const radiusInKm = parseFloat(radius) / 1000;

    // Find locations within the radius
    const locations = await Location.find({
      geometry: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radiusInKm * 1000, // Convert back to meters for MongoDB
        },
      },
    }).limit(parseInt(limit));

    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to extract points from a LineString or Polygon
const extractPointsFromGeometry = (geometry) => {
  const points = [];
  if (geometry.type === 'LineString') {
    // Take first, middle and last points from the LineString
    const coords = geometry.coordinates;
    if (coords.length > 0) {
      // First point
      points.push({
        type: 'Point',
        coordinates: coords[0]
      });
      
      // Middle point if there are at least 3 points
      if (coords.length >= 3) {
        const middleIndex = Math.floor(coords.length / 2);
        points.push({
          type: 'Point',
          coordinates: coords[middleIndex]
        });
      }
      
      // Last point if different from first
      if (coords.length > 1) {
        points.push({
          type: 'Point',
          coordinates: coords[coords.length - 1]
        });
      }
    }
  } else if (geometry.type === 'Polygon') {
    // Extract the centroid (approximate) from the first ring
    if (geometry.coordinates && geometry.coordinates.length > 0) {
      const ring = geometry.coordinates[0];
      let sumX = 0;
      let sumY = 0;
      
      for (const coord of ring) {
        sumX += coord[0];
        sumY += coord[1];
      }
      
      points.push({
        type: 'Point',
        coordinates: [sumX / ring.length, sumY / ring.length]
      });
    }
  } else if (geometry.type === 'MultiPoint') {
    // Convert each point in the MultiPoint to a separate Point
    for (const coord of geometry.coordinates) {
      points.push({
        type: 'Point',
        coordinates: coord
      });
    }
  } else if (geometry.type === 'MultiLineString') {
    // Process each LineString
    for (const line of geometry.coordinates) {
      // Take first and last points from each LineString
      if (line.length > 0) {
        points.push({
          type: 'Point',
          coordinates: line[0]
        });
        
        if (line.length > 1) {
          points.push({
            type: 'Point',
            coordinates: line[line.length - 1]
          });
        }
      }
    }
  } else if (geometry.type === 'MultiPolygon') {
    // Extract one point from each polygon (approximate centroid)
    for (const polygon of geometry.coordinates) {
      if (polygon.length > 0) {
        const ring = polygon[0];
        let sumX = 0;
        let sumY = 0;
        
        for (const coord of ring) {
          sumX += coord[0];
          sumY += coord[1];
        }
        
        points.push({
          type: 'Point',
          coordinates: [sumX / ring.length, sumY / ring.length]
        });
      }
    }
  }
  
  return points;
};

// @route   POST /api/locations/geojson
// @desc    Upload GeoJSON data and save to the database
// @access  Private
const uploadGeoJSON = async (req, res) => {
  try {
    // Validate input is a GeoJSON object
    if (!req.body.type || req.body.type !== 'FeatureCollection' || !req.body.features || !Array.isArray(req.body.features)) {
      return res.status(400).json({ message: "Invalid GeoJSON data. Must be a FeatureCollection." });
    }

    const { features } = req.body;
    const savedLocations = [];
    const errors = [];

    // Process features and save to the database
    for (let i = 0; i < features.length; i++) {
      try {
        const feature = features[i];
        if (!feature.geometry) {
          continue; // Skip features without geometry
        }
        
        const { geometry, properties = {} } = feature;
        
        // Generate a better name if one isn't provided
        // let locationName = properties.name || properties.Name || properties.NAME;
        let locationName = properties.city || `Location #${i + 1}`;
        
        // Handle Point geometries directly
        if (geometry.type === 'Point') {
          const location = {
            name: locationName,
            description: properties.description || properties.Description || "",
            category: properties.category || properties.Category || properties.type || properties.highway || "general",
            geometry: geometry,
            properties: properties,
            createdBy: req.user ? req.user._id : null,
          };

          const savedLocation = await Location.create(location);
          savedLocations.push(savedLocation);
        } 
        // Handle non-Point geometries by converting them to Points
        else {
          const points = extractPointsFromGeometry(geometry);
          
          for (let j = 0; j < points.length; j++) {
            const pointName = points.length > 1 ? `${locationName} (Pt ${j+1})` : locationName;
            
            const location = {
              name: pointName,
              description: properties.description || properties.Description || 
                          `Derived from ${geometry.type}` || "",
              category: properties.category || properties.Category || properties.type || properties.highway || "general",
              geometry: points[j],
              properties: {
                ...properties,
                originalGeometryType: geometry.type,
                isConverted: true
              },
              createdBy: req.user ? req.user._id : null,
            };

            const savedLocation = await Location.create(location);
            savedLocations.push(savedLocation);
          }
        }
      } catch (featureError) {
        console.error("Error processing feature:", featureError);
        errors.push(featureError.message);
        // Continue processing other features
      }
    }

    if (savedLocations.length === 0) {
      return res.status(400).json({ 
        message: "No valid locations found in GeoJSON data",
        errors
      });
    }

    res.status(201).json({
      message: `${savedLocations.length} locations imported successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      locations: savedLocations,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getNearbyLocations,
  uploadGeoJSON,
}; 