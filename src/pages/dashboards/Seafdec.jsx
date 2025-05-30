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
      env: 'ประโยชน์ด้านสิ่งแวดล้อม',
      tree: 'เทียบเท่าการปลูกต้นไม้ได้',
      co2Avoided: 'ลดการปล่อย CO₂',
      eng: 'Eng',
      thai: 'ไทย',
      todayText: 'แสดงข้อมูลของวันนี้',
      yesterdayText: (date) => `แสดงข้อมูลของวันที่ ${date}`,
    },
    en: {
      Revenue: 'Revenue',
      Today: 'Today',
      Yesterday: 'Yesterday',
      Month: 'Month',
      Total: 'Total',
      Yield: 'Energy Yield',
      env: 'Environment',
      tree: 'Equivalent trees planted',
      co2Avoided: 'CO₂ avoided',
      eng: 'ENG',
      thai: 'TH',
      todayText: 'Show today\'s information',
      yesterdayText: (date) => `Show information of the date ${date}`,
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
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-blue-100 -z-10" />
      <div className="flex flex-col md:flex-row h-full">
        <div className="flex-1 overflow-hidden flex items-center justify-center">
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit>
            <TransformComponent>
              <div className="flex flex-col items-center gap-2">
                <img src="/seafdeclogo.png" alt="logo" className="h-[150px] object-contain" />
                <img
                  src="https://bsv-th-authorities.com/img/DMSc.webp"
                  alt="city"
                  className="max-w-full max-h-[calc(100vh-6rem)] object-contain"
                  draggable={false}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* KPI Panel */}
        <div className="w-full md:w-[400px] p-4 flex flex-col gap-4 bg-white/30 backdrop-blur-lg">
          {/* Header with buttons */}
          <div className="flex justify-end items-center gap-2 h-10">
            <button
              onClick={() => setIsToday(!isToday)}
              className="bg-white text-blue-800 font-medium px-3 py-1 rounded shadow hover:bg-blue-100 flex items-center gap-1"
            >
              <img src="/calendar.png" alt="calendar" className="h-5 w-5" />
              {isToday ? t.Today : t.Yesterday}
            </button>

            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="bg-white text-blue-800 font-medium px-3 py-1 rounded shadow hover:bg-blue-100 flex items-center gap-1"
            >
              <img src="/language.png" alt="lang" className="h-5 w-5" />
              {language === 'th' ? t.eng : t.thai}
            </button>

            <button
              className="text-3xl font-bold text-blue-800"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? 'X' : '⚙️'}
            </button>
          </div>

          {isToday ? (
            <p className="text-sm text-right text-gray-600 italic">{t.todayText}</p>
          ) : (
            <p className="text-sm text-right text-gray-600 italic">
              {t.yesterdayText(selectedDate)}
            </p>
          )}

          {showSettings ? (
            <div className="text-right">
              <p className="mb-2 text-blue-900 font-medium">
                User: {localStorage.getItem('username')}
              </p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              {/* KPI Panels */}
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl font-bold">{t.Revenue}</p>
                <p className="text-lg">{t.Today}: {kpi?.day_income ?? '-'} ฿</p>
                <p className="text-lg">{t.Total}: {kpi?.total_income ?? '-'} ฿</p>
                <div className="flex items-right gap-2 h-30">
                  <img src="/income.png" alt="logo" className="h-20" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl font-bold">{t.Yield}</p>
                <p className="text-lg">{t.Today}: {kpi?.day_power ?? '-'} kWh</p>
                <p className="text-lg">{t.Month}: {kpi?.month_power ?? '-'} kWh</p>
                <p className="text-lg">{t.Total}: {kpi?.total_power ?? '-'} kWh</p>
                <div className="flex items-right gap-2 h-30">
                  <img src="/power.png" alt="logo" className="h-20" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-teal-100 rounded-xl p-4 shadow">
                <p className="text-xl font-bold">{t.env}</p>
                <p className="text-lg">{t.tree}: {kpi?.equivalent_trees?.toFixed(0) ?? '-'}</p>
                <div className="flex items-right gap-2 h-30">
                  <img src="/trees.png" alt="logo" className="h-20" />
                </div>
                <p className="text-lg">
                  {t.co2Avoided}: {kpi?.co2_avoided ? (kpi.co2_avoided / 1000).toFixed(2) : '-'} Tons
                </p>
                <div className="flex items-right gap-2 h-30">
                  <img src="/co2.png" alt="logo" className="h-20" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
