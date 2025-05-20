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

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/auth/delete-user/${username}`)
      loadUsers();
    }
  };
  const handleGoToDashboard = (target) => {
  // จำลองว่า admin เข้า dashboard นั้น ๆ
  localStorage.setItem('dashboard', target); 
  window.location.href = `/dashboard/${target}`;
};


  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

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
          <option value="B1">B1</option>
          <option value="C1">C1</option>
          <option value="D1">D1</option>
        </select>
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2"
        onClick={handleCreateUser}
      >
        Create User
      </button>
      <h2 className="font-semibold mt-6 mb-2">Go to Dashboard</h2>
<div className="flex justify-center gap-4 mb-6">
  {['seafdec', 'B1', 'C1', 'D1'].map(dash => (
    <button
      key={dash}
      className="bg-green-500 text-white px-4 py-2"
      onClick={() => handleGoToDashboard(dash)}
    >
      {dash}
    </button>
  ))}
</div>


      {message && <p className="mt-4 text-green-600">{message}</p>}

      <hr className="my-6" />

      <h2 className="font-semibold mb-2">User List</h2>
      <ul className="mb-6">
        {users.map((user) => (
          <li key={user.username} className="mb-2">
            {user.username} → {user.assignedDashboard}
            <button
              className="ml-4 bg-red-500 text-white px-2 py-1 text-sm"
              onClick={() => handleDeleteUser(user.username)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button
        className="bg-gray-800 text-white px-4 py-2"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
