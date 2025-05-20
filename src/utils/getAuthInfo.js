import { jwtDecode } from 'jwt-decode';

export const getAuthInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      localStorage.clear();
      return null;
    }

    return {
      role: decoded.role,
      assignedDashboard: decoded.dashboard,
      username: decoded.username
    };
  } catch (err) {
    localStorage.clear();
    return null;
  }
};
