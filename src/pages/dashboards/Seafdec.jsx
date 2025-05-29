import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function Seafdec() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [kpi, setKpi] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // ✅ ใช้ useCallback เพื่อให้ใช้ใน useEffect ได้โดยไม่เตือน
  const fetchKPI = useCallback(async () => {
    try {
      const url = selectedDate
        ? `${process.env.REACT_APP_API_BASE_URL}/api/seafdec/kpi/${selectedDate}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/seafdec/kpi/latest`;
      const res = await fetch(url);
      const data = await res.json();
      setKpi(data);
    } catch (err) {
      console.error('❌ Failed to fetch KPI:', err);
      setKpi(null);
    }
  }, [selectedDate]);

  // ✅ ดึงทันทีเมื่อ selectedDate เปลี่ยน
  useEffect(() => {
    fetchKPI();
  }, [fetchKPI]);

  // ✅ ตั้ง interval ทุก 10 นาที (เฉพาะตอน realtime)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedDate) {
        console.log('⏱ Auto-refresh KPI...');
        fetchKPI();
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchKPI, selectedDate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/*background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-blue-100 -z-10" />

      <div className="flex flex-col md:flex-row h-full">
        <div className="flex-1 overflow-hidden flex items-center justify-center">
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit>
            <TransformComponent>
              <img
                src="https://bsv-th-authorities.com/img/DMSc.webp"
                alt="city"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Settings and KPI display */}
        <div className="w-full md:w-[400px] p-4 flex flex-col gap-4 bg-white/30 backdrop-blur-lg">
        {/* Header with logo and settings button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 h-20">
              <img src="/seafdeclogo.png" alt="logo" className="h-12" />

            </div>
            <button
              className="text-xl font-bold text-blue-800"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? 'X' : '⚙️'}
            </button>
          </div>

          {/* Settings and KPI content */}
          {showSettings ? (
            <div className="text-right">
              <p className="mb-2 text-blue-900 font-medium">User: {localStorage.getItem('username')}</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <input
                type="date"
                className="border p-2 rounded w-full"
                max={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedDate(value);
                  setIsCustom(!!value);
                }}
              />
              {isCustom && (
                <p className="text-sm text-right text-gray-600 italic">
                  แสดงข้อมูลของวันที่ {selectedDate}
                </p>
              )}
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl font-bold">รายรับ</p>
                <p className="text-lg">วันนี้: {kpi?.day_income ?? '-'} ฿</p>
                <p className="text-lg">รวม: {kpi?.total_income ?? '-'} ฿</p>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl font-bold">พลังงานที่ผลิต</p>
                <p className="text-lg">วันนี้: {kpi?.day_power ?? '-'} kWh</p>
                <p className="text-lg">เดือนนี้: {kpi?.month_power ?? '-'} kWh</p>
                <p className="text-lg">สะสม: {kpi?.total_power ?? '-'} kWh</p>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl font-bold">พลังงานในสถานี</p>
                <p className="text-lg">ใช้: {kpi?.day_use_energy ?? '-'} kWh</p>
                <p className="text-lg">ส่งกริด: {kpi?.day_on_grid_energy ?? '-'} kWh</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
