import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginBox() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ ดึงจาก localStorage
  const selectedPage = localStorage.getItem('selectedDashboard');

  const handleLogin = async () => {
    if (!selectedPage) {
      setError('Please select a dashboard.');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`,
        { username, password, expectedDashboard: selectedPage }
      );

      const { token, role } = res.data;

      console.log("✅ saving token:", token);
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('dashboard', selectedPage);
      localStorage.setItem('username', username);
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/dashboard/${selectedPage}`);
      }

    } catch (err) {
      const msg = err.response?.data?.message || 'Login error';
      setError(msg);
    }
  };

  if (!selectedPage) {
    return <p className="text-gray-500">Please select a dashboard from the sidebar.</p>;
  }

  return (
    <div className="border p-6 w-64 border-black bg-white">
      <h2 className="text-center mb-4 font-semibold">Login</h2>
      <input
        type="text"
        placeholder="username"
        className="w-full border p-2 mb-2 border-black"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        className="w-full border p-2 mb-2 border-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button
        onClick={handleLogin}
        className="w-full bg-black text-white py-2 mt-2"
      >
        Login
      </button>
    </div>
  );
}
