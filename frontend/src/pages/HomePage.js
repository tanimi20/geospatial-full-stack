import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1>Visualize Geospatial Data</h1>
          <p>
            Upload, visualize, and interact with geospatial data using our
            powerful mapping tools.
          </p>
          <div className="hero-buttons">
            <Link to="/map" className="btn btn-primary">
              View Map
            </Link>
            
            {!isAuthenticated ? (
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            ) : (
              <Link to="/profile" className="btn btn-secondary">
                My Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Interactive Maps</h3>
              <p>
                Explore locations with an interactive Leaflet.js map interface.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Location Search</h3>
              <p>
                Find locations within a specific radius using geospatial queries.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3>GeoJSON Support</h3>
              <p>
                Upload and store GeoJSON data in MongoDB with 2dsphere indexing.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>User Authentication</h3>
              <p>
                Secure your data with JWT authentication and protected routes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create an Account</h3>
              <p>
                {isAuthenticated 
                  ? `Welcome, ${user?.name}! You're all set with your account.`
                  : 'Register for a free account to unlock all features including data uploads.'}
              </p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Upload Your Data</h3>
              <p>
                Upload your GeoJSON data files through our simple interface.
              </p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Visualize on the Map</h3>
              <p>
                See your data come to life on our interactive map with filtering capabilities.
              </p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Find Nearby Locations</h3>
              <p>
                Click on the map or use the search to find locations within a specific radius.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 