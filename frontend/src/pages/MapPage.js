import React, { useState, useContext, useCallback } from 'react';
import GeoMap from '../components/Map/MapContainer';
import GeoJSONUpload from '../components/Map/GeoJSONUpload';
import AuthContext from '../context/AuthContext';
import './MapPage.css';

const MapPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadedLocations, setUploadedLocations] = useState([]);

  // Handle successful upload to refresh map data
  const handleUploadSuccess = useCallback((locations) => {
    // Increment the refresh key to force the map to re-render
    setRefreshKey(prevKey => prevKey + 1);
    setUploadedLocations(locations || []);
  }, []);
  return (
    <div className="map-page">
      <div className="container">
        <div className="page-header">
          <h1>Interactive Geospatial Map</h1>
          <p>
            Explore locations on the map and search for points within a specific radius.
            {!isAuthenticated && " Log in to upload your own GeoJSON data."}
          </p>
        </div>
        
        {uploadedLocations.length > 0 && (
          <div className="upload-notification">
            <p>🎉 Successfully uploaded {uploadedLocations.length} locations to the map!</p>
            <button 
              className="clear-notification-btn"
              onClick={() => setUploadedLocations([])}
            >
              ✕
            </button>
          </div>
        )}
        
        <GeoMap key={refreshKey} />
        
        <GeoJSONUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
};

export default MapPage; 