import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './GeoJSONUpload.css';

const GeoJSONUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
    setJsonData(null);
    setError(null);
    setUploadStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    // Reset any previous state
    setSuccess(null);
    setError(null);
    setUploadStats(null);
    
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setJsonData(null);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate it's a proper GeoJSON FeatureCollection
          if (!data.type || data.type !== 'FeatureCollection' || !data.features || !Array.isArray(data.features)) {
            throw new Error("Invalid GeoJSON format. Must be a FeatureCollection with features array.");
          }
          
          // Count feature types for user feedback
          const typeCounts = {};
          data.features.forEach(feature => {
            if (feature.geometry && feature.geometry.type) {
              typeCounts[feature.geometry.type] = (typeCounts[feature.geometry.type] || 0) + 1;
            }
          });
          
          setJsonData(data);
          setUploadStats({
            totalFeatures: data.features.length,
            typeCounts
          });
        } catch (err) {
          setError(`Invalid JSON file: ${err.message}. Please upload a valid GeoJSON file.`);
          setFile(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError("You must be logged in to upload GeoJSON data.");
      return;
    }
    
    if (!jsonData) {
      setError("Please select a valid GeoJSON file first.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post('/api/locations/geojson', jsonData);
      
      setSuccess(`Successfully uploaded ${response.data.locations.length} locations!`);
      setLoading(false);
      
      // Reset the form for a new upload
      resetForm();
      
      // Notify parent component to refresh map data
      if (onUploadSuccess) {
        onUploadSuccess(response.data.locations);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message || 
        "Failed to upload GeoJSON data. Please check the file format and try again."
      );
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetForm();
    setSuccess(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="geojson-upload">
        <h3>Upload GeoJSON Data</h3>
        <div className="auth-message">
          Please log in to upload GeoJSON data.
        </div>
      </div>
    );
  }

  return (
    <div className="geojson-upload">
      <h3>Upload GeoJSON Data</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="geojson-file">Select GeoJSON file:</label>
          <input
            type="file"
            id="geojson-file"
            accept=".json,.geojson"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
        
        {file && (
          <div className="file-info">
            <p>Selected file: <strong>{file.name}</strong></p>
            {uploadStats && (
              <>
                <p>Total features: <strong>{uploadStats.totalFeatures}</strong></p>
                <div className="feature-types">
                  <p>Feature types:</p>
                  <ul>
                    {Object.entries(uploadStats.typeCounts).map(([type, count]) => (
                      <li key={type}>
                        {type}: {count} {type !== 'Point' ? 
                          '(will be converted to points)' : 
                          ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-actions">
          <button
            type="submit"
            className="upload-btn"
            disabled={!jsonData || loading}
          >
            {loading ? "Uploading..." : "Upload GeoJSON"}
          </button>
          
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>
      
      {jsonData && (
        <div className="json-preview">
          <h4>GeoJSON Preview:</h4>
          <pre>{JSON.stringify(jsonData, null, 2).substring(0, 300)}...</pre>
        </div>
      )}
    </div>
  );
};

export default GeoJSONUpload; 