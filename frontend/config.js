// ============================================================
// FRONTEND BACKEND API CONFIGURATION
// ============================================================
// The backend always runs on port 5000 during local development.
// Using window.location.hostname means the same frontend works on:
//   http://localhost:8000
//   http://127.0.0.1:8000
//   http://192.168.x.x:8000
// without changing the IP address in every fetch() call.
//
// For production, replace this with your deployed backend URL.
// ============================================================
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:5000`;
