# Geospatial Application with Leaflet.js

A full-stack MERN application for visualizing and interacting with geospatial data using Leaflet.js and MongoDB's geospatial features.

## Features

## Features

- 🗺️ Interactive map visualization with Leaflet.js
- 📍 Upload and store GeoJSON data in MongoDB
- 🔍 Search locations by proximity (geospatial queries)
- 📐 Polygon-based search for filtering locations by drawn area
- 🖱️ Click-to-search: fetch data by clicking on the map
- 👤 User authentication with JWT
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React.js, Leaflet.js, React-Leaflet
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with geospatial indexing
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.x or later)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas account)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd geospatial-app
```

### 2. Install all dependencies

The easiest way to install all dependencies for the root project, backend, and frontend at once:

```bash
npm run install-all
```

Or you can install each separately:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory with the following variables:

```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

The frontend `.env` should contain:

```
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=0
```

## Running the Application

### Option 1: Run both servers concurrently (recommended for development)

```bash
# In the root directory
npm run dev
```

This will start both the backend and frontend servers simultaneously.

### Option 2: Run servers individually

```bash
# Start the backend server (in the root directory)
npm run server

# In a separate terminal, start the frontend server (in the root directory)
npm run client
```

The backend will run on http://localhost:5001 and the frontend on http://localhost:3000.

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (protected)

### Location Endpoints

- `GET /api/locations` - Get all locations (with pagination, filtering, and sorting)
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create a new location (protected)
- `PUT /api/locations/:id` - Update a location (protected)
- `DELETE /api/locations/:id` - Delete a location (protected)
- `GET /api/locations/nearby` - Find locations within a specific radius
- `POST /api/locations/geojson` - Upload GeoJSON data (protected)

## Usage Examples

### Finding Nearby Locations

To find locations within a specific radius, use the following API endpoint:

```
GET /api/locations/nearby?latitude=40.7128&longitude=-74.0060&radius=5000
```

This will return all locations within 5km of the specified coordinates.

### Uploading GeoJSON

To upload GeoJSON data, send a POST request to `/api/locations/geojson` with a GeoJSON object containing Point features in the request body.

## Deployment

The application can be deployed to platforms like Vercel, Heroku, or Render.

### Backend Deployment
The backend can be deployed to Heroku or similar platforms that support Node.js applications.

### Frontend Deployment
The React frontend can be deployed to Vercel, Netlify, or any other static site hosting service.

## Troubleshooting

### Development Server Issues
If you encounter issues with the React development server related to allowedHosts, ensure you have the correct `.env` file in the frontend directory with the settings provided above.

### MongoDB Connection
Make sure your MongoDB server is running and the connection string in the backend `.env` file is correct.

## License

[MIT](LICENSE)

## Acknowledgements

- [Leaflet.js](https://leafletjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [React](https://reactjs.org/)
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
