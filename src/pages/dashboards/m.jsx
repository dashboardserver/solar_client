import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function Seafdec() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [kpi, setKpi] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [language, setLanguage] = useState('th');
  const [isToday, setIsToday] = useState(true);

  const t = {
    th: {
      Revenue: 'รายรับ',
      Today: 'วันนี้',
      Yesterday: 'เมื่อวาน',
      Month: 'เดือน',
      Total: 'รวม',
      Yield: 'พลังงานที่ผลิต',
      tree: 'เทียบเท่าการปลูกต้นไม้ได้',
      co2Avoided: 'ลดการปล่อย CO₂',
      trees: 'ต้น',
      ton: 'ตัน',
      eng: 'อังกฤษ',
      thai: 'ไทย',
      todayText: 'แสดงข้อมูลของวันนี้',
      yesterdayText: (date) => `แสดงข้อมูลของวันที่ ${date}`,
      name: 'ชื่อ',
      status: 'สถานะ',
      logout: 'ออกจากระบบ',
    },
    en: {
      Revenue: 'Revenue',
      Today: 'Today',
      Yesterday: 'Yesterday',
      Month: 'Month',
      Total: 'Total',
      Yield: 'Energy Yield',
      tree: 'Equivalent trees planted',
      co2Avoided: 'CO₂ avoided',
      trees: 'Tree',
      ton: 'Tons',
      eng: 'ENG',
      thai: 'TH',
      todayText: 'Show today\'s information',
      yesterdayText: (date) => `Show information of the date ${date}`,
      name: 'Name',
      status: 'Status',
      logout: 'Logout',
    },
  }[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  const updateDate = useCallback(() => {
    if (isToday) {
      setSelectedDate('');
    } else {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  }, [isToday]);

  useEffect(() => {
    updateDate();
  }, [isToday, updateDate]);

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

  useEffect(() => {
    fetchKPI();
  }, [fetchKPI]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-bgblue -z-10" />

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-row h-screen">
        <div className="flex-1 overflow-hidden relative min-h-screen flex flex-col">
          {/* LOGO */}
          <div className="bg-blueo w-full flex justify-center mt-3">
            <img src="/seafdeclogo.png" alt="logo" className="h-[120px] object-contain" />
          </div>

          {/* Structure */}
          <div className="flex-1 flex items-center justify-center">
            <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit>
              <TransformComponent>
                <div className="relative">
                  <img src="/flag.svg" alt="flag" className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-10" />
                  <img
                    src="/structure.png"
                    alt="structure"
                    className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
                    draggable={false}
                  />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>

          {/* Contact */}
          <div className="absolute bottom-2 left-4">
            <div className="flex items-start">
              {/* ข้อมูล Contact */}
              <div className="flex flex-col">
                <div className="flex items-center -mt-1">
                  <p className="text-black mt-5">Operated by</p>
                  <img
                    src="/solaryn.svg"
                    alt="solaryn"
                    className="h-[100px] absolute pl-20 pt-5"
                  />
                </div>
                <p className="text-black">Contact (0) 2353 8600 Ext. 5504</p>
              </div>

              {/* QR Code */}
              <div className="flex items-center -ml-5">
                <img
                  src="/qr.svg"
                  alt="qr"
                  className="h-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Panel - Desktop */}
        <div className="w-[450px] p-6 flex flex-col gap-6 bg-white/20 backdrop-blur-xl overflow-y-auto shadow-2xl border-l border-white/30">
          {/* Header with buttons */}
          <div className="flex justify-end items-center gap-3 h-auto">
            <button
              onClick={() => setIsToday(!isToday)}
              className="group bg-white/80 backdrop-blur-sm text-blue-700 font-medium px-4 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/20"
            >
              <img src="/calendar.png" alt="calendar" className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {isToday ? t.Today : t.Yesterday}
            </button>

            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="group bg-white/80 backdrop-blur-sm text-blue-700 font-medium px-4 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/20"
            >
              <img src="/language.png" alt="lang" className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {language === 'th' ? t.thai : t.eng}
            </button>

            <button
              className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 text-xl font-bold border border-white/20"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ?
                <span className="group-hover:rotate-90 transition-transform inline-block">✕</span> :
                <span className="group-hover:rotate-45 transition-transform inline-block">⚙️</span>
              }
            </button>
          </div>

          {showSettings ? (
            <div className="animate-fadeIn">
              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">👤</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-900 mb-1">
                    {t.user} : {localStorage.getItem('username')}
                  </p>
                  <p className="text-sm text-blue-600">{t.status} : {localStorage.getItem('role')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-medium hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🚪</span>
                  {t.logout}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Panels */}
              {isToday ? (
                <p className="text-sm text-right text-gray-600 italic">{t.todayText}</p>
              ) : (
                <p className="text-sm text-right text-gray-600 italic">
                  {t.yesterdayText(selectedDate)}
                </p>
              )}

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center">
                  <img src="/income.svg" alt="logo" className="h-20" />
                  <div>
                    <p className="text-lg font-bold text-textc">{t.Revenue}</p>
                    <p className="text-sm text-textc">{t.Today}: {kpi?.day_income ?? '-'} ฿</p>
                    <p className="text-sm text-textc">{t.Total}: {kpi?.total_income ?? '-'} ฿</p>
                  </div>

                </div>
              </div>

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-6 shadow">
                <div className="flex items-center mb-2">
                  <img src="/power.png" alt="logo" className="h-20 pl-2 ml-4" />
                  <div className="pl-2 ml-6">
                    <p className="text-lg font-bold text-textc">{t.Yield}</p>
                    <p className="text-sm text-textc">{t.Today}: {kpi?.day_power ?? '-'} kWh</p>
                    <p className="text-sm text-textc">{t.Month}: {kpi?.month_power ?? '-'} kWh</p>
                    <p className="text-sm text-textc">{t.Total}: {kpi?.total_power ?? '-'} kWh</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-6 shadow">
                <div className="flex items-center mb-2">
                  <img src="/trees.svg" alt="logo" className="h-20" />
                  <div>
                    <p className="text-xl text-textc">{t.tree}</p>
                    <p className="text-sm text-textc">{kpi?.equivalent_trees?.toFixed(0) ?? '-'} {t.trees}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-6 shadow">
                <div className="flex items-center mb-2">
                  <img src="/co2.png" alt="logo" className="h-20 pl-2 ml-4" />
                  <div className="pl-2 ml-6">
                    <p className="text-xl text-textc">{t.co2Avoided}</p>
                    <p className="text-sm text-textc">{kpi?.co2_avoided ? (kpi.co2_avoided / 1000).toFixed(2) : '-'} {t.ton}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Logo and Structure Section */}
        <div className="flex flex-col items-center py-6 px-4">
          {/* LOGO */}
          <img
            src="/seafdeclogo.png"
            alt="logo"
            className="h-[80px] object-contain"
          />

          {/* Structure */}
          <div className="w-full max-w-sm">
            <TransformWrapper initialScale={0.8} minScale={0.3} maxScale={3} centerOnInit>
              <TransformComponent>
                <img
                  src="/structure.png"
                  alt="structure"
                  className="w-full h-auto object-contain"
                  draggable={false}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>

        {/* Mobile KPI Panel */}
        <div className="p-4 flex flex-col gap-4 bg-white/20 backdrop-blur-xl shadow-2xl border-t border-white/30">
          {/* Header with buttons */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsToday(!isToday)}
              className="group bg-white/80 backdrop-blur-sm text-blue-700 font-medium px-3 py-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/20 text-sm"
            >
              <img src="/calendar.png" alt="calendar" className="h-4 w-4 group-hover:scale-110 transition-transform" />
              {isToday ? t.Today : t.Yesterday}
            </button>

            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="group bg-white/80 backdrop-blur-sm text-blue-700 font-medium px-3 py-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/20 text-sm"
            >
              <img src="/language.png" alt="lang" className="h-4 w-4 group-hover:scale-110 transition-transform" />
              {language === 'th' ? t.thai : t.eng}
            </button>

            <button
              className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 text-lg font-bold border border-white/20"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ?
                <span className="group-hover:rotate-90 transition-transform inline-block">✕</span> :
                <span className="group-hover:rotate-45 transition-transform inline-block">⚙️</span>
              }
            </button>
          </div>

          {showSettings ? (
            <div className="animate-fadeIn">
              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <span className="text-lg text-white">👤</span>
                  </div>
                  <p className="text-base font-semibold text-blue-900 mb-1">
                    {t.name} : {localStorage.getItem('username')}
                  </p>
                  <p className="text-xs text-blue-600">{t.Status} : {localStorage.getItem('role')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-medium hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Panels */}
              {isToday ? (
                <p className="text-xs text-center text-gray-600 italic">{t.todayText}</p>
              ) : (
                <p className="text-xs text-center text-gray-600 italic">
                  {t.yesterdayText(selectedDate)}
                </p>
              )}

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center">
                  <img src="/income.svg" alt="logo" className="h-20" />
                  <div>
                    <p className="text-lg font-bold text-textc">{t.Revenue}</p>
                    <p className="text-sm text-textc">{t.Today}: {kpi?.day_income ?? '-'} ฿</p>
                    <p className="text-sm text-textc">{t.Total}: {kpi?.total_income ?? '-'} ฿</p>
                  </div>

                </div>
              </div>

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-6 shadow">
                <div className="flex items-center mb-2">
                  <img src="/power.png" alt="logo" className="h-20 pl-2 ml-4" />
                  <div className="pl-2 ml-6">
                    <p className="text-lg font-bold text-textc">{t.Yield}</p>
                    <p className="text-sm text-textc">{t.Today}: {kpi?.day_power ?? '-'} kWh</p>
                    <p className="text-sm text-textc">{t.Month}: {kpi?.month_power ?? '-'} kWh</p>
                    <p className="text-sm text-textc">{t.Total}: {kpi?.total_power ?? '-'} kWh</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-6 shadow">
                <div className="flex items-center mb-2">
                  <img src="/trees.svg" alt="logo" className="h-20" />
                  <div>
                    <p className="text-xl font-bold text-textc">{t.tree}</p>
                    <p className="text-sm text-textc">{kpi?.equivalent_trees?.toFixed(0) ?? '-'} {t.trees}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-lightblue rounded-xl p-6 shadow">
                <div className="flex items-center mb-2">
                  <img src="/co2.png" alt="logo" className="h-20 pl-2 ml-4" />
                  <div className="pl-2 ml-6">
                    <p className="text-xl font-bold text-textc">{t.co2Avoided}</p>
                    <p className="text-sm text-textc">{kpi?.co2_avoided ? (kpi.co2_avoided / 1000).toFixed(2) : '-'} {t.ton}</p>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
