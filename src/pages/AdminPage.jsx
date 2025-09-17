import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dashboard, setDashboard] = useState('seafdec');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/list-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
      // ถ้าไม่มีสิทธิ์อาจจะต้อง redirect
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate('/');
      }
    }
  };

  // ตรวจสอบ authentication และ authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // อ่านข้อมูลจาก localStorage ที่ LoginPage เก็บไว้
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        const storedDashboard = localStorage.getItem('dashboard');
        
        console.log('🔍 Checking auth...');
        console.log('Token:', token);
        console.log('Username:', storedUsername);
        console.log('Role:', storedRole);
        console.log('Dashboard:', storedDashboard);

        // ตรวจสอบข้อมูลพื้นฐานจาก localStorage
        if (!token || !storedUsername) {
          console.warn('[ADMIN] Missing token or username. Redirecting to login...');
          localStorage.clear();
          navigate('/');
          return;
        }

        // ตรวจสอบ role อย่างเข้มงวด - ต้องเป็น 'admin' เท่านั้น
        if (!storedRole || storedRole !== 'admin') {
          console.warn('[ADMIN] Invalid role. Expected: admin, Got:', storedRole);
          alert('Access denied. This page is for administrators only.');
          localStorage.clear();
          navigate('/');
          return;
        }

        // ตรวจสอบเพิ่มเติม admin ควรมี dashboard เป็น null หรือ 'admin'
        if (storedDashboard && storedDashboard !== 'admin' && storedDashboard !== null) {
          console.warn('[ADMIN] Admin should not have specific dashboard assigned. Dashboard:', storedDashboard);
        }

        // ตรวจสอบกับ backend เพื่อยืนยันสิทธิ์
        console.log('🔄 Verifying admin privileges with backend...');
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/list-users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // ถ้าเรียก list-users ได้สำเร็จ แสดงว่าเป็น admin
        console.log('✅ Admin privileges confirmed via backend API');
        setUsers(res.data);
        
      } catch (err) {
        console.error('[ADMIN] Authorization failed:', err);
        
        let errorMessage = 'Access denied. Please login again.';
        
        if (err.response?.status === 401) {
          errorMessage = 'Your session has expired. Please login again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. Administrator privileges required.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Server configuration error. Please contact system administrator.';
        }
        
        alert(errorMessage);
        
        localStorage.clear();
        navigate('/');
        return;
      }

      setIsAuthChecked(true);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/create-user`,
        {
          username,
          password,
          assignedDashboard: dashboard
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage(res.data.message);
      setUsername('');
      setPassword('');
      loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/api/auth/delete-user/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        loadUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setMessage('Error deleting user');
      }
    }
  };

  const handleGoToDashboard = (target) => {
    localStorage.setItem('dashboard', target);
    navigate(`/dashboard/${target}`);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying administrator privileges...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we authenticate your access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header แสดงสถานะ admin */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Page</h1>
              <p className="text-gray-600 mt-1">
                Logged in as: <span className="font-semibold text-blue-600">{localStorage.getItem('username')}</span>
                <span className="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  Admin Access
                </span>
              </p>
            </div>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Create User Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">➕ Create New User</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dashboard}
                onChange={(e) => setDashboard(e.target.value)}
              >
                <option value="seafdec">SEAFDEC</option>
                <option value="A1">A1</option>
                <option value="B1">B1</option>
                <option value="C1">C1</option>
              </select>
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleCreateUser}
            >
              Create User
            </button>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['SEAFDEC', 'A1', 'B1', 'C1'].map(dash => (
              <button
                key={dash}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                onClick={() => handleGoToDashboard(dash)}
              >
                📊 {dash}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* User Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">👥 User Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['seafdec', 'A1', 'B1', 'C1'].map(dashboard => {
              const group = users.filter(user => user.assignedDashboard === dashboard);
              return (
                <div key={dashboard} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                    📊 {dashboard}
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {group.length} users
                    </span>
                  </h3>
                  {group.length > 0 ? (
                    <ul className="space-y-2">
                      {group.map(user => (
                        <li key={user.username} className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                          <span className="text-gray-700 font-medium">👤 {user.username}</span>
                          <button
                            className="bg-red-500 text-white px-3 py-1 text-sm rounded-lg hover:bg-red-600 transition-colors"
                            onClick={() => handleDeleteUser(user.username)}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic text-center py-4">No users assigned</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
