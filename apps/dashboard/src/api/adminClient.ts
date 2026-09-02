import axios from 'axios';

// Founder ruling W-2 (2026-09-02): a deliberately SEPARATE axios instance
// and token key ('adminAccessToken', not 'accessToken') from the Company
// Console's client.ts — so an Admin session and a Company/Employee
// session can never be confused or overwrite each other in the same
// browser, and so "Do NOT collapse Company and Admin into one interface"
// holds at the data layer too, not just visually.
const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api/v1';

const adminClient = axios.create({ baseURL: API_BASE });

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAccessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminClient.interceptors.response.use(
  (res) => res.data.data ?? res.data,
  (err) => Promise.reject(err),
);

export default adminClient;
