import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

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
      {/* พื้นหลังไล่สี */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-blue-100 -z-10" />

      <div className="flex flex-col md:flex-row h-full">
        {/* ซ้าย: ภาพเมือง */}
        <div className="flex-1 overflow-hidden center flex items-center justify-center">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit
            limitToBounds={false}
            panning={{ velocityDisabled: true }}
            wheel={{ step: 50 }}
          >
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

        {/* ขวา: เมนู */}
        <div className="w-full md:w-[400px] p-4 flex flex-col gap-4 bg-white/30 backdrop-blur-lg">
          {/* หัวโลโก้ + ปุ่ม */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 h-20">
              <img src="/seafdeclogo.png" alt="logo" className="h-12" />
              <div className="text-sm text-blue-900 font-semibold">
              </div>
            </div>
            <button
              className="text-xl font-bold text-blue-800"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? 'X' : '⚙️'}
            </button>
          </div>

          {/* ข้อมูล KPI */}
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
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl text-black-800 font-bold">รายรับ</p>
                <p className="text-xl text-black-800 font-bold">วันนี้ {kpi?.day_income ?? '-'} ฿</p>
                <p className="text-xl text-black-800 font-bold">รวมทั้งหมด {kpi?.total_income ?? '-'} ฿</p>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl text-black-800 font-bold">พลังงานที่ผลิต</p>
                <p className="text-xl text-black-800 font-bold">วันนี้: {kpi?.day_power ?? '-'} kWh</p>
                <p className="text-xl text-black-800 font-bold">เดือนนี้: {kpi?.month_power ?? '-'} kWh</p>
                <p className="text-xl text-black-800 font-bold">สะสม: {kpi?.total_power ?? '-'} kWh</p>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl text-black-800 font-bold">พลังงานในสถานี</p>
                <p className="text-xl text-black-800 font-bold">ใช้: {kpi?.day_use_energy ?? '-'} kWh</p>
                <p className="text-xl text-black-800 font-bold">ส่งกริด: {kpi?.day_on_grid_energy ?? '-'} kWh</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
