import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            <div className="profile-info">
              <h3>{user ? user.name : 'User'}</h3>
              <p>{user ? user.email : 'email@example.com'}</p>
              <p className="user-role">Role: {user ? user.role : 'user'}</p>
            </div>
            
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Information
              </button>
              <button
                className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                My Data
              </button>
            </div>
            
            <div className="profile-actions">
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
          
          <div className="profile-content">
            {activeTab === 'profile' && (
              <div className="profile-info-tab">
                <h2>Profile Information</h2>
                <div className="profile-card">
                  <div className="profile-field">
                    <label>Name</label>
                    <p>{user ? user.name : 'User'}</p>
                  </div>
                  
                  <div className="profile-field">
                    <label>Email</label>
                    <p>{user ? user.email : 'email@example.com'}</p>
                  </div>
                  
                  <div className="profile-field">
                    <label>Account Created</label>
                    <p>
                      {user && user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="profile-field">
                    <label>Role</label>
                    <p>{user ? user.role : 'user'}</p>
                  </div>
                </div>
                
                <div className="profile-message">
                  <p>
                    As a registered user, you can upload GeoJSON data and contribute to our
                    geospatial database.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'data' && (
              <div className="profile-data-tab">
                <h2>My Uploaded Data</h2>
                <div className="data-actions">
                  <Link to="/map" className="upload-btn">
                    Upload New Data
                  </Link>
                </div>
                
                <div className="no-data-message">
                  <p>You haven't uploaded any data yet.</p>
                  <p>
                    <Link to="/map" className="data-link">
                      Go to the map
                    </Link>{' '}
                    to upload your GeoJSON data.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 