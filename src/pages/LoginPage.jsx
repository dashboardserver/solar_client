import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        username,
        password
      });

      const { token, role, dashboard } = res.data;
      console.log('🔑 Token:', token);
      console.log('👤 Role:', role);
      console.log('📊 Dashboard:', dashboard);

      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);          
      localStorage.setItem('dashboard', dashboard);

      // ✅ redirect ตาม role/
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/dashboard/${dashboard}`);
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: 'url("/solar.png")' }}
    >
      <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-xl max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Solar Dashboard Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
