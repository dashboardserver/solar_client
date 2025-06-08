import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear error message ก่อน submit
    
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

      // ✅ redirect ตาม role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/dashboard/${dashboard}`);
      }

    } catch (err) {
      // แสดง error message ใต้ปุ่ม login
      if (err.response?.status === 401 || err.response?.status === 400) {
        setErrorMessage('The Username or Password is Incorrect.\nPlease try again.');
      } else {
        setErrorMessage(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: 'url("/solar.png")' }}
    >
      {/* Logo */}
      <div className="absolute left-4">
        <img
          src="solaryn.svg"
          alt="solaryn"
          className="h-40"
        />
      </div>

      {/* Login Box */}
      <div className="flex items-center justify-center min-h-screen">
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
            {errorMessage && (
              <div className="text-red-500 text-sm text-center mt-2 whitespace-pre-line">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white absolute bottom-4 left-4 border rounded-xl">
        <div className="flex items-center">
          <p className="mt-2 ml-2 text-black">Operated by</p>
          <img
            src="/solaryn.svg"
            alt="solaryn"
            className="h-20 absolute left-[90px] mt-2"
          />
        </div>
        <p className="mt-1 mb-2 ml-2 mr-2 text-black">contact (0) 2353 8600 Ext. 5504</p>
      </div>
    </div>
  );
}