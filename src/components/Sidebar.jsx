import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ ใช้ React Router

const items = ['seafdec', 'B1', 'C1', 'D1'];

export default function Sidebar() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate(); // ✅

  const filtered = items.filter(item =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleClick = (item) => {
    localStorage.setItem('selectedDashboard', item); // ✅ เก็บลง localStorage
    navigate('/'); // ✅ redirect ไป login
  };

  return (
    <div className="w-64 border border-black p-2">
      <div className="text-lg font-bold mb-2">Solar Dashboard</div>
      <input
        type="text"
        placeholder="search"
        className="w-full border px-2 py-1 mb-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.map((item) => (
        <div
          key={item}
          className="border mb-2 p-2 bg-gray-100 hover:bg-gray-200 cursor-pointer"
          onClick={() => handleClick(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
