import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dashboard, setDashboard] = useState('seafdec');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // ตรวจสอบว่า admin เข้าสู่ระบบหรือไม่
  const loadUsers = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/list-users`);
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  //Redirect ถ้าไม่มี token (ถูกต้องตามกฎ hooks) 
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  // ฟังก์ชันสร้างผู้ใช้ใหม่
  const handleCreateUser = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/create-user`, {
        username,
        password,
        assignedDashboard: dashboard
      });
      setMessage(res.data.message);
      setUsername('');
      setPassword('');
      loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  // ฟังก์ชันลบผู้ใช้
  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/auth/delete-user/${username}`)
      loadUsers();
    }
  };

  // ฟังก์ชันเปลี่ยนหน้าไปยังแดชบอร์ดที่เลือก
  const handleGoToDashboard = (target) => {
    localStorage.setItem('dashboard', target);
    navigate(`/dashboard/${target}`);
  };


  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mt-6 mb-4">Admin Panel</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="New username"
          className="border p-2 mr-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mr-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="border p-2"
          value={dashboard}
          onChange={(e) => setDashboard(e.target.value)}
        >
          <option value="seafdec">seafdec</option>
          <option value="A1">A1</option>
          <option value="B1">B1</option>
          <option value="C1">C1</option>

        </select>
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 mb-6 rounded hover:bg-gray-700 transition-colors"
        onClick={handleCreateUser}
      >
        Create User
      </button>
      <h2 className="font-semibold mt-6 mb-2">Go to Dashboard</h2>
      <div className="flex justify-center gap-4 mb-6">
        {['seafdec', 'A1', 'B1', 'C1'].map(dash => (
          <button
            key={dash}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            onClick={() => handleGoToDashboard(dash)}
          >
            {dash}
          </button>
        ))}
      </div>


      {message && <p className="mt-4 text-green-600">{message}</p>}

      <hr className="my-6" />

      <h2 className="font-semibold mb-2">User List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mx-auto max-w-4xl">
        {['seafdec', 'A1', 'B1', 'C1',].map(dashboard => {
          const group = users.filter(user => user.assignedDashboard === dashboard);
          return (
            <div key={dashboard} className="border p-4 rounded shadow bg-white">
              <h3 className="font-bold text-lg mb-2">{dashboard}</h3>
              {group.length > 0 ? (
                <ul>
                  {group.map(user => (
                    <li key={user.username} className="mb-1 flex justify-between items-center">
                      <span>{user.username}</span>
                      <button
                        className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600 transition-colors"
                        onClick={() => handleDeleteUser(user.username)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No users</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <button
          className="bg-red-700 text-white px-4 py-2 mb-6 rounded hover:bg-gray-700 transition-colors "
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
