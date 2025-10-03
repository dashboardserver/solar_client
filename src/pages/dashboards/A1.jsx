import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function A1() {
  const navigate = useNavigate();
  const SOURCE_KEY = "yipintsoi"; // ใช้ endpoint กลางตาม sourceKey นี้

  const [showSettings, setShowSettings] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [openingDate, setOpeningDate] = useState(null);

  useEffect(() => {
    const loadOpening = async () => {
      try {
        const base = process.env.REACT_APP_API_BASE_URL;
        const res = await fetch(`${base}/api/stations`);
        const list = await res.json();
        const st = list.find((x) => String(x.key).toLowerCase() === "a1");
        setOpeningDate(st?.openingDate || null);
      } catch (err) {
        console.warn("[OpeningDate] a1 fetch failed", err);
      }
    };
    loadOpening();
  }, []);

  // Data States
  const [kpi, setKpi] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  // Language
  const [language, setLanguage] = useState(
    () => localStorage.getItem("lang") || "en"
  );
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const t =
    {
      th: {
        Revenue: "ประหยัดค่าไฟฟ้า",
        Today: "วันนี้",
        Month: "เดือน",
        Total: "รวม",
        Yield: "พลังงานที่ผลิต",
        tree: "เทียบเท่าการปลูกต้นไม้ได้",
        co2Avoided: "ลดการปล่อย CO₂",
        trees: "ต้น",
        kwh: "กิโลวัตต์",
        ton: "ตัน",
        bath: "บาท",
        eng: "อังกฤษ",
        thai: "ไทย",
        todayText: "แสดงข้อมูลของวันนี้",
        dateText: (date) => `แสดงข้อมูลของวันที่ ${date}`,
        name: "ชื่อ",
        status: "สถานะ",
        logout: "ออกจากระบบ",
        selectDate: "เลือกวันที่",
        confirm: "ยืนยัน",
        cancel: "ยกเลิก",
        openingDateLabel: "วันเปิดใช้งาน",
      },
      en: {
        Revenue: "Save electricity cost",
        Today: "Today",
        Month: "Month",
        Total: "Total",
        Yield: "Energy Yield",
        tree: "Equivalent trees planted",
        co2Avoided: "CO₂ avoided",
        trees: "Trees",
        kwh: "KWh",
        ton: "Tons",
        bath: "฿",
        eng: "ENG",
        thai: "THAI",
        todayText: "Show today's information",
        dateText: (date) => `Show information of the date ${date}`,
        name: "Name",
        status: "Status",
        logout: "Logout",
        selectDate: "Select Date",
        confirm: "Confirm",
        cancel: "Cancel",
        openingDateLabel: "On system",
      },
    }[language];

  // ✅ แปลงวันที่แบบสวยงามตามภาษา
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    if (language === "th") {
      // 4 ต.ค. 2568
      return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    // 4 Oct 2025
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // แปลง openingDate เป็นข้อความ (ใช้รูปแบบเดียวกับด้านบน)
  const openingDateText = () => {
    if (!openingDate) return null;
    const formatted = formatDateForDisplay(openingDate);
    return `${t.openingDateLabel}: ${formatted}`;
  };

  // number helpers
  const isNil = (v) => v === null || v === undefined;
  const fmt = (v, digits = 2) =>
    isNil(v)
      ? "-"
      : Number(v).toLocaleString("en-US", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        });
  const fmtInt = (v) =>
  isNil(v) ? "-" : Math.floor(Number(v)).toLocaleString("en-US");
  
  const fmtTon = (v) =>
    isNil(v)
      ? "-"
      : (Number(v) / 1000).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  // คืน “วันนี้” เป็น yyyy-mm-dd ตามโซนเวลาไทย สำหรับ input[type=date]
  const bkkToday = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/";
  }, []);

  const fetchKPI = useCallback(async () => {
    try {
      const base = process.env.REACT_APP_API_BASE_URL;
      const url = selectedDate
        ? `${base}/api/kpi/${SOURCE_KEY}/by-date?date=${selectedDate}`
        : `${base}/api/kpi/${SOURCE_KEY}/today`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setKpi(data);
    } catch (err) {
      console.error("❌ Failed to fetch KPI:", err);
      setKpi(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchKPI();
  }, [fetchKPI]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Date picker
  const handleDateModeChange = () => setShowDatePicker(true);
  const handleCustomDateConfirm = (date) => {
    setSelectedDate(date === bkkToday() ? "" : date);
    setShowDatePicker(false);
  };
  const handleCustomDateCancel = () => setShowDatePicker(false);

  // Language
  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageOptions(false);
  };

  // ข้อความวันที่มุมขวาบนของ panel
  const getDateDisplayText = () => {
    if (!selectedDate) {
      return kpi?.date
        ? `${t.todayText} (${formatDateForDisplay(kpi.date)})`
        : t.todayText;
    } else {
      return t.dateText(formatDateForDisplay(selectedDate));
    }
  };

  // Modal เลือกวันที่
  const DatePickerModal = () => {
    const [tempDate, setTempDate] = useState(selectedDate || bkkToday());
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            {t.selectDate}
          </h3>
          <input
            type="date"
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            max={bkkToday()}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCustomDateCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => handleCustomDateConfirm(tempDate)}
              className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LanguageOptions = () => (
    <div className="absolute top-full right-0 mt-2 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 overflow-hidden z-40">
      <button
        onClick={() => handleLanguageSelect("th")}
        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
          language === "th"
            ? "bg-blue-100 text-blue-700 font-semibold"
            : "text-gray-700"
        }`}
      >
        ไทย
      </button>
      <button
        onClick={() => handleLanguageSelect("en")}
        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
          language === "en"
            ? "bg-blue-100 text-blue-700 font-semibold"
            : "text-gray-700"
        }`}
      >
        ENG
      </button>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-bgblue -z-10" />

      {/* Date Picker Modal */}
      {showDatePicker && <DatePickerModal />}

      {/* ===== Desktop Layout ===== */}
      <div className="hidden xl:flex xl:flex-row h-screen">
        {/* Left: Image */}
        <div className="flex-1 relative min-h-screen flex flex-col">
          {/* LOGO */}
          <div className="w-full flex justify-center mt-3">
            <img src="/yiplogo.png" alt="logo" className="h-[120px] object-contain" />
          </div>

          {/* Only yipintsoi.png */}
          <div className="flex-1 flex items-start justify-center relative">
            <TransformWrapper initialScale={1} minScale={0.3} maxScale={1} centerOnInit>
              <TransformComponent>
                <div className="relative flex py-8">
                  <img
                    src="/yipintsoi.png"
                    alt="yipintsoi"
                    className="max-w-full max-h=[calc(100vh-10rem)] object-contain"
                    draggable={false}
                  />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>

          {/* Contact */}
          <div className="absolute bottom-2 left-4">
            <div className="flex items-start">
              <div className="flex flex-col">
                <div className="flex items-center -mt-1">
                  <p className="text-black mt-5">Operated by</p>
                  <img src="/solaryn.svg" alt="solaryn" className="h-[100px] absolute pl-20 pt-5" />
                </div>
                <p className="text-black">Contact (0) 2353 8600 Ext. 5504</p>
              </div>
              <div className="flex items-center -ml-5">
                <img src="/qr.svg" alt="qr" className="h-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: KPI Panel (Desktop) */}
        <div className="w-[600px] p-6 flex flex-col gap-4 bg-white/20 backdrop-blur-xl shadow-2xl border-l border-white/30 h-screen">
          {/* Header */}
          <div className="flex justify-between items-center h-auto">
            {/* On system */}
            {openingDate && (
              <div className="text-lg drop-shadow-sm whitespace-nowrap">
                {openingDateText()}
              </div>
            )}

            {/* buttons */}
            <div className={`flex items-center gap-3 ${!openingDate ? "ml-auto" : ""}`}>
              {/* Calendar */}
              <button
                onClick={handleDateModeChange}
                className="group bg-white/80 backdrop-blur-sm text-blue-700 p-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
              >
                <img
                  src="/calendar.png"
                  alt="calendar"
                  className="h-5 w-5 group-hover:scale-110 transition-transform"
                />
              </button>

              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                  className="group bg-white/80 backdrop-blur-sm text-blue-700 p-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  <img
                    src="/language.png"
                    alt="lang"
                    className="h-5 w-5 group-hover:scale-110 transition-transform"
                  />
                </button>
                {showLanguageOptions && <LanguageOptions />}
              </div>

              {/* Settings */}
              <button
                className="group bg-white/80 backdrop-blur-sm text-blue-700 p-3.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
                onClick={() => setShowSettings(!showSettings)}
              >
                {showSettings ? (
                  <span className="group-hover:rotate-90 transition-transform inline-block">
                    ✕
                  </span>
                ) : (
                  <span className="group-hover:rotate-45 transition-transform inline-block">
                    ⚙️
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Body */}
          {showSettings ? (
            <div className="animate-fadeIn">
              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-3xl text-white">👤</span>
                  </div>
                  <p className="text-2xl font-semibold text-blue-900 mb-1">
                    {t.name} : {localStorage.getItem("username")}
                  </p>
                  <p className="text-2lx text-blue-600">{t.status} : {localStorage.getItem("role")}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-xl text-white px-6 py-4 rounded-xl font-medium hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              <p className="text-sm text-right text-gray-600 italic">{getDateDisplayText()}</p>

              {/* Revenue */}
              <div className="bg-gradient-to-br from-lightblue rounded-2xl p-8 shadow">
                <div className="flex items-center">
                  <img src="/income.png" alt="income" className="h-24 ml-8" />
                  <div className="flex-auto ml-8 mr-16">
                    <p className="text-2xl font-bold text-textc">{t.Revenue}</p>
                    <div className="flex justify-between">
                      <p className="text-2xl text-textc">{t.Today}:</p>
                      <p className="text-2xl text-textc mr-8">
                        {fmt(kpi?.day_income, 2)} {t.bath}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-2xl text-textc">{t.Total}:</p>
                      <p className="text-2xl text-textc mr-8">
                        {fmt(kpi?.total_income, 2)} {t.bath}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yield */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-8 shadow">
                <div className="flex items-center ">
                  <img src="/power.png" alt="power" className="h-24 ml-4" />
                  <div className="flex-auto ml-8 mr-16">
                    <p className="text-2xl font-bold text-textc">{t.Yield}</p>
                    <div className="flex justify-between ">
                      <p className="text-2xl text-textc">{t.Today}:</p>
                      <p className="text-2xl text-textc">
                        {fmt(kpi?.day_power, 2)} {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-2xl text-textc">{t.Month}:</p>
                      <p className="text-2xl text-textc">
                        {fmt(kpi?.month_power, 2)} {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-2xl text-textc">{t.Total}:</p>
                      <p className="text-2xl text-textc">
                        {fmt(kpi?.total_power, 2)} {t.kwh}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trees */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-8 shadow">
                <div className="flex items-center">
                  <img src="/trees.png" alt="trees" className="h-24 pl-2" />
                  <div className="flex-1 ml-8">
                    <p className="text-2xl font-bold text-textc">{t.tree}</p>
                    <p className="text-2xl text-textc">
                      {fmtInt(kpi?.equivalent_trees)} {t.trees}
                    </p>
                  </div>
                </div>
              </div>

              {/* CO2 avoided */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-8 shadow">
                <div className="flex items-center">
                  <img src="/co2.png" alt="co2" className="h-24 pl-2" />
                  <div className="flex-auto ml-8">
                    <p className="text-2xl font-bold text-textc">{t.co2Avoided}</p>
                    <p className="text-2xl text-textc">
                      {fmtTon(kpi?.co2_avoided)} {t.ton}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== iPad Layout ===== */}
      <div className="hidden md:block xl:hidden">
        <div className="flex flex-col h-screen">
          <div className="flex flex-1 gap-4 ">
            {/* Image */}
            <div className="flex-1 flex flex-col relative">
              {/* LOGO */}
              <div className="flex justify-center items-center mt-3 mb-4">
                <img src="/slogo.png" alt="logo" className="h-[90px] object-contain" />
                <img src="/seafdeclogo.png" alt="logo" className="h-[90px] object-contain" />
              </div>

              {/* Only yipintsoi.png */}
              <div className="flex-col justify-center relative">
                <TransformWrapper initialScale={1} minScale={0.3} maxScale={1} centerOnInit>
                  <TransformComponent>
                    <div className="relative flex justify-center items-center py-4">
                      <img
                        src="/yipintsoi.png"
                        alt="yipintsoi"
                        className="max-w-full max-h-[calc(100vh-15rem)] object-contain"
                        draggable={false}
                      />
                    </div>
                  </TransformComponent>
                </TransformWrapper>

                {/* Contact */}
                <div className="ml-8 mt-4">
                  <div className="flex items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center -mt-1">
                        <p className="text-sm text-black mt-3">Operated by</p>
                        <img src="/solaryn.svg" alt="solaryn" className="h-[70px] absolute pl-16 pt-3" />
                      </div>
                      <p className="text-sm text-black">Contact (0) 2353 8600 Ext. 5504</p>
                    </div>
                    <div className="flex items-center mt-1 -ml-2">
                      <img src="/qr.svg" alt="qr" className="h-14" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Panel */}
            <div className="w-[350px] flex flex-col gap-3 bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 rounded-2xl p-4">
              {/* Header */}
              <div className="flex justify-end items-center gap-2">
                {openingDate && (
                  <div className="text-xs md:text-sm text-black/80">
                    {openingDateText()}
                  </div>
                )}
                <button
                  onClick={handleDateModeChange}
                  className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  <img
                    src="/calendar.png"
                    alt="calendar"
                    className="h-4 w-4 group-hover:scale-110 transition-transform"
                  />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                    className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
                  >
                    <img
                      src="/language.png"
                      alt="lang"
                      className="h-4 w-4 group-hover:scale-110 transition-transform"
                    />
                  </button>
                  {showLanguageOptions && <LanguageOptions />}
                </div>

                <button
                  className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 text-lg font-bold border border-white/20"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? (
                    <span className="group-hover:rotate-90 transition-transform inline-block">✕</span>
                  ) : (
                    <span className="group-hover:rotate-45 transition-transform inline-block">⚙️</span>
                  )}
                </button>
              </div>

              {showSettings ? (
                <div className="animate-fadeIn flex-1">
                  <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 h-full flex flex-col justify-center">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                        <span className="text-lg text-white">👤</span>
                      </div>
                      <p className="text-base font-semibold text-blue-900 mb-1">
                        {t.name} : {localStorage.getItem("username")}
                      </p>
                      <p className="text-sm text-blue-600">{t.status} : {localStorage.getItem("role")}</p>
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
                <div className="flex flex-col gap-3 flex-1">
                  <p className="text-xs text-right text-gray-600 italic">{getDateDisplayText()}</p>

                  {/* Revenue */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/income.png" alt="income" className="h-16 ml-2" />
                      <div className="flex-auto ml-4 pr-16">
                        <p className="text-lg font-bold text-textc">{t.Revenue}</p>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Today}:</p>
                          <p className="text-sm text-textc">{fmt(kpi?.day_income, 2)} {t.bath}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Total}:</p>
                          <p className="text-sm text-textc">{fmt(kpi?.total_income, 2)} {t.bath}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Yield */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/power.png" alt="power" className="h-16 ml-2" />
                      <div className="flex-auto ml-4 pr-9">
                        <p className="text-lg font-bold text-textc">{t.Yield}</p>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Today}:</p>
                          <p className="text-sm text-textc">{fmt(kpi?.day_power, 2)} {t.kwh}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Month}:</p>
                          <p className="text-sm text-textc">{fmt(kpi?.month_power, 2)} {t.kwh}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Total}:</p>
                          <p className="text-sm text-textc">{fmt(kpi?.total_power, 2)} {t.kwh}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trees */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/trees.png" alt="trees" className="h-16 pl-1" />
                      <div className="flex-auto ml-4">
                        <p className="text-lg font-bold text-textc">{t.tree}</p>
                        <p className="text-sm text-textc">{fmtInt(kpi?.equivalent_trees)} {t.trees}</p>
                      </div>
                    </div>
                  </div>

                  {/* Co2_avoided */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/co2.png" alt="co2" className="h-16 pl-1" />
                      <div className="flex-auto ml-4">
                        <p className="text-lg font-bold text-textc">{t.co2Avoided}</p>
                        <p className="text-sm text-textc">{fmtTon(kpi?.co2_avoided)} {t.ton}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile Layout ===== */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* LOGO */}
        <div className=" flex justify-center items-center mt-4">
          <img src="/slogo.png" alt="logo" className="h-[70px] object-contain" />
          <img src="/seafdeclogo.png" alt="logo" className="h-[70px] object-contain" />
        </div>

        {/* Only yipintsoi.png */}
        <div className="flex-1 flex justify-center items-center pt-3">
          <TransformWrapper initialScale={1} minScale={0.3} maxScale={1} centerOnInit>
            <TransformComponent>
              <div className="relative flex justify-center items-center py-8">
                <img
                  src="/yipintsoi.png"
                  alt="yipintsoi"
                  className="max-w-full max-h-[calc(100vh-10rem)] object-contain block mx-auto"
                  draggable={false}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Mobile KPI Panel */}
        <div className="p-4 flex flex-col gap-2 bg-white/20 backdrop-blur-xl shadow-2xl border-t border-white/30">
          {/* Header */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {openingDate && (
              <div className="text-xs md:text-sm text-black/80">
                {openingDateText()}
              </div>
            )}
            <button
              onClick={handleDateModeChange}
              className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <img
                src="/calendar.png"
                alt="calendar"
                className="h-4 w-4 group-hover:scale-110 transition-transform"
              />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
              >
                <img
                  src="/language.png"
                  alt="lang"
                  className="h-4 w-4 group-hover:scale-110 transition-transform"
                />
              </button>
              {showLanguageOptions && <LanguageOptions />}
            </div>

            <button
              className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 text-lg font-bold border border-white/20"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? (
                <span className="group-hover:rotate-90 transition-transform inline-block">✕</span>
              ) : (
                <span className="group-hover:rotate-45 transition-transform inline-block">⚙️</span>
              )}
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
                    {t.name} : {localStorage.getItem("username")}
                  </p>
                  <p className="text-xs text-blue-600">
                    {t.status} : {localStorage.getItem("role")}
                  </p>
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
              <p className="text-xs text-center text-gray-600 italic">
                {getDateDisplayText()}
              </p>

              {/* Revenue */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2">
                  <img src="/income.png" alt="income" className="h-20 ml-6" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">{t.Revenue}</p>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Today}:</p>
                      <p className="text-lg text-textc mr-8">
                        {fmt(kpi?.day_income, 2)} {t.bath}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Total}:</p>
                      <p className="text-lg text-textc mr-8">
                        {fmt(kpi?.total_income, 2)} {t.bath}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yield */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2 ">
                  <img src="/power.png" alt="power" className="h-20 ml-4" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">{t.Yield}</p>
                    <div className="flex justify-between ">
                      <p className="text-lg text-textc">{t.Today}:</p>
                      <p className="text-lg text-textc">
                        {fmt(kpi?.day_power, 2)} {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Month}:</p>
                      <p className="text-lg text-textc">
                        {fmt(kpi?.month_power, 2)} {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Total}:</p>
                      <p className="text-lg text-textc">
                        {fmt(kpi?.total_power, 2)} {t.kwh}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trees */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2">
                  <img src="/trees.png" alt="trees" className="h-20 pl-2" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">{t.tree}</p>
                    <p className="text-lg text-textc">
                      {fmtInt(kpi?.equivalent_trees)} {t.trees}
                    </p>
                  </div>
                </div>
              </div>

              {/* Co2_avoided */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2">
                  <img src="/co2.png" alt="co2" className="h-20 pl-2" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">{t.co2Avoided}</p>
                    <p className="text-lg text-textc">
                      {fmtTon(kpi?.co2_avoided)} {t.ton}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bottom-2 left-4">
                <div className="flex items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center -mt-1">
                      <p className="text-sm text-black mt-5">Operated by</p>
                      <img src="/solaryn.svg" alt="solaryn" className="h-[90px] absolute pl-16 pt-5" />
                    </div>
                    <p className="text-sm text-black">Contact (0) 2353 8600 Ext. 5504</p>
                  </div>
                  <div className="flex items-center mt-2 -ml-2">
                    <img src="/qr.svg" alt="qr" className="h-12" />
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
