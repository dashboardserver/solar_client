import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Seafdec() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [kpi, setKpi] = useState(null);
  
  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/seafdec/kpi/latest`);
        const data = await res.json();
        setKpi(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchKPI();
    const interval = setInterval(fetchKPI, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-purple-200 -z-10" />
      <div className="flex h-full">
        {/* ซ้าย: ภาพเมือง */}
        <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
          <div className="max-w-full max-h-full border border-gray-300 rounded overflow-hidden">
            <img
              src="https://bsv-th-authorities.com/img/DMSc.webp"
              alt="city"
              className="w-full h-auto object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* ขวา: เมนู */}
        <div className="w-[400px] md:w-[500px] p-4 flex flex-col bg-white/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <img src="/seafdeclogo.png" alt="logo" className="h-8" />
            <button
              className="text-2xl font-bold"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? 'X' : '⚙️'}
            </button>
          </div>

          {showSettings ? (
            <div className="text-right">
              <p className="mb-2 text-white drop-shadow">User: {localStorage.getItem('username')}</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 shadow-md">
                <p>⚡ กำลังผลิตวันนี้ (kWh): {kpi?.day_power ?? '-'}</p>
                <p>💰 รายได้วันนี้ (บาท): {kpi?.day_income ?? '-'}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 shadow-md">
                <p>📆 เดือนนี้ผลิตแล้ว (kWh): {kpi?.month_power ?? '-'}</p>
                <p>📦 ผลิตสะสมรวม (kWh): {kpi?.total_power ?? '-'}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 shadow-md">
                <p>🌱 พลังงานใช้ในสถานี (kWh): {kpi?.day_use_energy ?? '-'}</p>
                <p>🔌 ส่งเข้ากริด (kWh): {kpi?.day_on_grid_energy ?? '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
