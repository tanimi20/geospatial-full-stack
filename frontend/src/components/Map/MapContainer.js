import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapContainer.css';

// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import * as turf from '@turf/turf';

const PolygonFilter = ({ locations, setFilteredLocations }) => {
  const onCreated = (e) => {
    const layer = e.layer;
    const drawnGeoJSON = layer.toGeoJSON();
    const polygon = turf.polygon(drawnGeoJSON.geometry.coordinates);

    const filtered = locations.filter((loc) => {
      const point = turf.point(loc.geometry.coordinates);
      return turf.booleanPointInPolygon(point, polygon);
    });

    setFilteredLocations(filtered);
  };

  return (
    <FeatureGroup>
      <EditControl
        position="topright"
        onCreated={onCreated}
        draw={{
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
          polygon: {
            shapeOptions: {
              color: '#ff7800',
              weight: 2
            }
          }
        }}
      />
    </FeatureGroup>
  );
};

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create a highlighted marker that's visually distinct
const highlightedIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
  iconSize: [35, 57], // Much larger for emphasis
  iconAnchor: [17, 57],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'highlighted-marker' // Add a class for CSS styling
});

// Component to handle map clicks and location updates
const MapEvents = ({ onMapClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

// Component to update the map view when center changes
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};


const GeoMap = () => {
  const [locations, setLocations] = useState([]);
  const [center, setCenter] = useState([51.505, -0.09]);
  const [zoom, setZoom] = useState(13);
  const [searchRadius, setSearchRadius] = useState(1000);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clickToSearchEnabled, setClickToSearchEnabled] = useState(true);

  const [filteredLocations, setFilteredLocations] = useState([]);


  // Fetch all locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/locations', {
          params: {
            limit: 1000 // Increased from default 10 to show up to 1000 locations
          }
        });
        setLocations(response.data.locations);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch locations');
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Handle map click to search nearby locations
  const handleMapClick = async (latlng) => {
    try {
      setLoading(true);
      setCenter([latlng.lat, latlng.lng]);
      setSelectedLocation(null);

      // Get nearby locations based on click
      const response = await axios.get('/api/locations/nearby', {
        params: {
          latitude: latlng.lat,
          longitude: latlng.lng,
          radius: searchRadius,
          limit: 1000 // Increased from default to show more locations
        }
      });

      setLocations(response.data);

      if (response.data.length === 0) {
        setError('No nearby locations found within this radius.');
      } else {
        setError(null);
      }
      setLoading(false);


      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch nearby locations');
      setLoading(false);
    }
  };

  // Handle radius change
  const handleRadiusChange = (e) => {
    setSearchRadius(e.target.value);
  };

  // Handle search by coordinates
  const handleSearch = async (e) => {
    e.preventDefault();
    const lat = parseFloat(e.target.latitude.value);
    const lng = parseFloat(e.target.longitude.value);
    const rad = parseFloat(e.target.radius.value) || 1000;

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid latitude and longitude');
      return;
    }

    try {
      setLoading(true);
      setCenter([lat, lng]);
      setSearchRadius(rad);

      const response = await axios.get('/api/locations/nearby', {
        params: {
          latitude: lat,
          longitude: lng,
          radius: rad,
          limit: 1000 // Increased to show more locations
        }
      });

      setLocations(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch nearby locations');
      setLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setCenter([
      location.geometry.coordinates[1],
      location.geometry.coordinates[0]
    ]);
    setZoom(16); // Increase zoom level when selecting a location
  };

  return (
    <div className="map-container">
      <div className="search-panel">
        <h3>Search Locations</h3>

        <div className="form-group">
          <label>
            Enable click to search
            <input
              type="checkbox"
              checked={clickToSearchEnabled}
              onChange={() => setClickToSearchEnabled(!clickToSearchEnabled)}
            />
          </label>
        </div>

        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label htmlFor="latitude">Latitude:</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              placeholder="e.g. 51.505"
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude:</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              placeholder="e.g. -0.09"
            />
          </div>

          <div className="form-group">
            <label htmlFor="radius">Radius (meters):</label>
            <input
              type="number"
              id="radius"
              name="radius"
              value={searchRadius}
              onChange={handleRadiusChange}
              min="100"
              max="50000"
            />
          </div>

          <button type="submit" className="search-btn">Search</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="locations-found">
          <h4>Locations Found: {filteredLocations.length > 0 ? filteredLocations.length : locations.length}</h4>
          {filteredLocations.length > 0 && (
            <button
              className="clear-filter-btn"
              onClick={() => setFilteredLocations([])}
            >
              Clear Polygon Filter
            </button>
          )}

          {loading && <div className="loading">Loading...</div>}
          <div className="location-list-container">
            {locations.length > 50 && (
              <div className="location-count-notice">
                Showing all {locations.length} locations. Scroll to view more.
              </div>
            )}
            <ul className="location-list">
              {(filteredLocations.length ? filteredLocations : locations).map((location) => (
                <li
                  key={location._id}
                  onClick={() => handleLocationSelect(location)}
                  className={selectedLocation?._id === location._id ? 'selected' : ''}
                >
                  {location.name || "Unnamed Location"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <PolygonFilter
            locations={locations}
            setFilteredLocations={setFilteredLocations}
          />

          <ChangeMapView center={center} zoom={zoom} />
          <MapEvents onMapClick={handleMapClick} enabled={clickToSearchEnabled} />

          {center && searchRadius && (
            <Circle
              center={center}
              radius={parseFloat(searchRadius)}
              pathOptions={{
                fillColor: '#00aaff',
                fillOpacity: 0.1,
                color: '#00aaff',
                dashArray: '5, 5',
                weight: 1
              }}
            />
          )}

          {/* Render a highlight circle under the selected marker */}
          {selectedLocation && (
            <Circle
              center={[
                selectedLocation.geometry.coordinates[1],
                selectedLocation.geometry.coordinates[0]
              ]}
              radius={50}
              pathOptions={{
                fillColor: '#3388ff',
                fillOpacity: 0.3,
                color: '#3388ff',
                weight: 2
              }}
            />
          )}

          {locations.map((location) => (
            <Marker
              key={location._id}
              position={[
                location.geometry.coordinates[1],
                location.geometry.coordinates[0]
              ]}
              icon={selectedLocation?._id === location._id ? highlightedIcon : defaultIcon}
              eventHandlers={{
                click: () => handleLocationSelect(location)
              }}
            >
              <Popup>
                <div>
                  <h3>{location.name}</h3>
                  <p>{location.description}</p>
                  <p>Category: {location.category}</p>
                  <p>
                    Coordinates: {location.geometry.coordinates[1]}, {location.geometry.coordinates[0]}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GeoMap; 
