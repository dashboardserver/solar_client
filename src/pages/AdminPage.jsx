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

  // Opening Date
  const [stations, setStations] = useState([]);
  const [openingDates, setOpeningDates] = useState({}); 
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState(null);

  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/auth/list-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate('/');
      }
    }
  };

  // Opening Date
  const loadStations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/stations`, { headers: getAuthHeaders() });
      setStations(res.data);
      const map = {};
      res.data.forEach(s => {
        const d = s.openingDate ? new Date(s.openingDate) : null;
        if (d && !isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          map[s.key] = `${yyyy}-${mm}-${dd}`;
        } else {
          map[s.key] = '';
        }
      });
      setOpeningDates(map);
    } catch (err) {
      console.warn('[OpeningDate] loadStations failed:', err?.response?.data || err.message);
    }
  };

  const saveOpeningDate = async (key, yyyyMmDd) => {
    try {
      const iso = yyyyMmDd ? new Date(yyyyMmDd + 'T00:00:00').toISOString() : null;
      await axios.patch(
        `${API_BASE}/api/stations/${key}/opening-date`,
        { openingDate: iso },
        { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } }
      );
      await loadStations();
      setMessage('✅ อัปเดตวันเปิดใช้งานเรียบร้อย');
    } catch (err) {
      console.error(err);
      setMessage('❌ ' + (err?.response?.data?.message || 'อัปเดตวันเปิดไม่สำเร็จ'));
    }
  };

  // ตรวจสอบ authentication และ authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        const storedDashboard = localStorage.getItem('dashboard');

        console.log('🔍 Checking auth...');
        console.log('Token:', token);
        console.log('Username:', storedUsername);
        console.log('Role:', storedRole);
        console.log('Dashboard:', storedDashboard);

        if (!token || !storedUsername) {
          console.warn('[ADMIN] Missing token or username. Redirecting to login...');
          localStorage.clear();
          navigate('/');
          return;
        }

        if (!storedRole || storedRole !== 'admin') {
          console.warn('[ADMIN] Invalid role. Expected: admin, Got:', storedRole);
          alert('Access denied. This page is for administrators only.');
          localStorage.clear();
          navigate('/');
          return;
        }

        if (storedDashboard && storedDashboard !== 'admin' && storedDashboard !== null) {
          console.warn('[ADMIN] Admin should not have specific dashboard assigned. Dashboard:', storedDashboard);
        }

        console.log('🔄 Verifying admin privileges with backend...');
        const res = await axios.get(`${API_BASE}/api/auth/list-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Admin privileges confirmed via backend API');
        setUsers(res.data);
      } catch (err) {
        console.error('[ADMIN] Authorization failed:', err);
        let errorMessage = 'Access denied. Please login again.';
        if (err.response?.status === 401) errorMessage = 'Your session has expired. Please login again.';
        else if (err.response?.status === 403) errorMessage = 'Access denied. Administrator privileges required.';
        else if (err.response?.status === 404) errorMessage = 'Server configuration error. Please contact system administrator.';
        alert(errorMessage);
        localStorage.clear();
        navigate('/');
        return;
      }

      setIsAuthChecked(true);
    };

    checkAuth();
  }, [navigate, API_BASE]);

  // เมื่อ auth ผ่านแล้วค่อยโหลด stations + users ให้พร้อมกัน
  useEffect(() => {
    if (isAuthChecked) {
      loadStations();
      loadUsers();
    }
  }, [isAuthChecked]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/api/auth/create-user`,
        { username, password, assignedDashboard: dashboard },
        { headers: { Authorization: `Bearer ${token}` } }
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
        await axios.delete(`${API_BASE}/api/auth/delete-user/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Page</h1>
              <p className="text-gray-600 mt-1">
                Logged in as: <span className="font-semibold text-blue-600">{localStorage.getItem('username')}</span>
                <span className="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">Admin Access</span>
              </p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Create User */}
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
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={handleCreateUser}>
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
                    {/* ตั้งวันเปิด */}
                    <button
                      className="ml-auto px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-100"
                      onClick={() => { setActiveDashboard(dashboard); setDateModalOpen(true); }}
                      title="ตั้งวันเปิด"
                    >
                      ตั้งวันเปิด
                    </button>
                  </h3>

                  {/* แสดงวันเปิดใช้งาน */}
                  <div className="text-xs text-gray-600 mb-2">
                    วันเปิดใช้งาน: {openingDates[dashboard] ? openingDates[dashboard] : '— ยังไม่ตั้ง —'}
                  </div>

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

        {/* Opening Date Modal */}
        {dateModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">ตั้งวันเปิดใช้งาน – {activeDashboard}</h3>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 w-full"
                value={openingDates[activeDashboard] || ''}
                onChange={(e) => setOpeningDates({ ...openingDates, [activeDashboard]: e.target.value })}
              />
              <div className="flex gap-2 justify-end mt-6">
                <button className="px-4 py-2 rounded-lg border" onClick={() => setDateModalOpen(false)}>ยกเลิก</button>
                <button
                  className="px-4 py-2 rounded-lg bg-black text-white"
                  onClick={async () => {
                    await saveOpeningDate(activeDashboard, openingDates[activeDashboard] || '');
                    setDateModalOpen(false);
                  }}
                >
                  บันทึก
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-3">ปล่อยค่าว่างแล้วกดบันทึก = ลบวันเปิดทำการ</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
