import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Seafdec() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState("structure");
  const [kpi, setKpi] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [language, setLanguage] = useState("th");
  const t = {
    th: {
      Revenue: "ประหยัดค่าไฟฟ้า",
      Today: "วันนี้",
      Yesterday: "เมื่อวาน",
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
    },
    en: {
      Revenue: "Save electricity cost",
      Today: "Today",
      Yesterday: "Yesterday",
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
      thai: "ไทย",
      todayText: "Show today's information",
      dateText: (date) => `Show information of the date ${date}`,
      name: "Name",
      status: "Status",
      logout: "Logout",
      selectDate: "Select Date",
      confirm: "Confirm",
      cancel: "Cancel",
    },
  }[language];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  // Default to today's data (empty selectedDate means latest/today)
  useEffect(() => {
    if (!selectedDate) {
      // If no date is selected, show today's data
    }
  }, [selectedDate]);

  const fetchKPI = useCallback(async () => {
    try {
      const url = selectedDate
        ? `${process.env.REACT_APP_API_BASE_URL}/api/seafdec/kpi/${selectedDate}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/seafdec/kpi/latest`;
      const res = await fetch(url);
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

  const handleDateModeChange = () => {
    setShowDatePicker(true);
  };

  const handleCustomDateConfirm = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleCustomDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageOptions(false);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US");
  };

  const getDateDisplayText = () => {
    if (!selectedDate) {
      return t.todayText;
    } else {
      return t.dateText(formatDateForDisplay(selectedDate));
    }
  };

  // Date Picker Component
  const DatePickerModal = () => {
    const [tempDate, setTempDate] = useState(
      selectedDate || new Date().toISOString().split("T")[0]
    );

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
            max={new Date().toISOString().split("T")[0]}
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
              onClick={() => {
                if (tempDate === new Date().toISOString().split("T")[0]) {
                  // If today is selected, set selectedDate to empty (shows latest data)
                  handleCustomDateConfirm("");
                } else {
                  handleCustomDateConfirm(tempDate);
                }
              }}
              className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Language Options Component
  const LanguageOptions = () => {
    return (
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
  };

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-bgblue -z-10" />

      {/* Date Picker Modal */}
      {showDatePicker && <DatePickerModal />}

      {/* Desktop Layout */}
      <div className="hidden xl:flex xl:flex-row h-screen">
        <div className="flex-1 relative min-h-screen flex flex-col">
          {/* LOGO */}
          <div className="w-full flex justify-center mt-3">
            <img
              src="/slogo.png"
              alt="logo"
              className="h-[120px] object-contain "
            />
            <img
              src="/seafdeclogo.png"
              alt="logo"
              className="h-[120px] object-contain"
            />
          </div>

          {/* Structure */}
          <div className="flex-1 flex items-start justify-center pt-3 relative">
            <TransformWrapper
              initialScale={1}
              minScale={0.3}
              maxScale={1}
              centerOnInit
            >
              <TransformComponent>
                {selectedImage === "structure" ? (
                  <div className="relative flex py-8">
                    <img
                      src="/flag.svg"
                      alt="flag"
                      className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 h-100"
                    />
                    <img
                      src="/structure.png"
                      alt="structure"
                      className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="relative flex py-8 px-32">
                    <img
                      src="/map.png"
                      alt="map"
                      className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
                      draggable={false}
                    />
                  </div>
                )}
              </TransformComponent>
            </TransformWrapper>

            {/* Image Selection Buttons */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/20">
                <button
                  onClick={() => setSelectedImage("structure")}
                  className={`p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 border-2 hover:scale-105 ${
                    selectedImage === "structure"
                      ? "border-blue-500 bg-blue-100"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src="/structure.png"
                    alt="structure"
                    className="h-8 w-8 object-contain"
                  />
                </button>
                <button
                  onClick={() => setSelectedImage("map")}
                  className={`p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 border-2 hover:scale-105 ${
                    selectedImage === "map"
                      ? "border-blue-500 bg-blue-100"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src="/map.png"
                    alt="map"
                    className="h-8 w-8 object-contain"
                  />
                </button>
              </div>
            </div>
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
                <img src="/qr.svg" alt="qr" className="h-20" />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Panel - Desktop */}
        <div className="w-[500px] p-6 flex flex-col gap-4 bg-white/20 backdrop-blur-xl shadow-2xl border-l border-white/30 h-screen">
          {/* Header */}
          <div className="flex justify-end items-center gap-3 h-auto">
            {/* button calender */}
            <button
              onClick={handleDateModeChange}
              className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <img
                src="/calendar.png"
                alt="calendar"
                className="h-5 w-5 group-hover:scale-110 transition-transform"
              />
            </button>

            <div className="relative">
              {/* button language */}
              <button
                onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-white/20"
              >
                <img
                  src="/language.png"
                  alt="lang"
                  className="h-5 w-5 group-hover:scale-110 transition-transform"
                />
              </button>
              {showLanguageOptions && <LanguageOptions />}
            </div>

            {/* button setting */}
            <button
              className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 text-xl font-bold border border-white/20"
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

          {showSettings ? (
            <div className="animate-fadeIn">
              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">👤</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-900 mb-1">
                    {t.name} : {localStorage.getItem("username")}
                  </p>
                  <p className="text-sm text-blue-600">
                    {t.status} : {localStorage.getItem("role")}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-medium hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {/* KPI Panels */}
              <p className="text-sm text-right text-gray-600 italic">
                {getDateDisplayText()}
              </p>
              {/* Revenue */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center">
                  <img src="/income.png" alt="logo" className="h-24 ml-6" />
                  <div className="flex-auto ml-8 mr-16">
                    <p className="text-xl font-bold text-textc">{t.Revenue}</p>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">
                        {!selectedDate ? t.Today : "วัน"}:
                      </p>
                      <p className="text-lg text-textc mr-8">
                        {kpi?.day_income
                          ? Number(kpi.day_income.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.bath}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Total}:</p>
                      <p className="text-lg text-textc mr-8">
                        {kpi?.total_income
                          ? Number(kpi.total_income.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.bath}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yield */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center ">
                  <img src="/power.png" alt="logo" className="h-24 ml-4" />
                  <div className="flex-auto ml-8 mr-16">
                    <p className="text-xl font-bold text-textc">{t.Yield}</p>
                    <div className="flex justify-between ">
                      <p className="text-lg text-textc">
                        {!selectedDate ? t.Today : "วัน"}:
                      </p>
                      <p className="text-lg text-textc">
                        {kpi?.day_power
                          ? Number(kpi.day_power.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Month}:</p>
                      <p className="text-lg text-textc">
                        {kpi?.month_power
                          ? Number(kpi.month_power.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Total}:</p>
                      <p className="text-lg text-textc">
                        {kpi?.total_power
                          ? Number(kpi.total_power.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.kwh}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tree */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center">
                  <img src="/trees.png" alt="logo" className="h-24 pl-2" />
                  <div className="flex-1 ml-8">
                    <p className="text-xl font-bold text-textc">{t.tree}</p>
                    <p className="text-lg text-textc">
                      {kpi?.equivalent_trees
                        ? Number(
                            kpi.equivalent_trees.toFixed(0)
                          ).toLocaleString()
                        : "-"}{" "}
                      {t.trees}
                    </p>
                  </div>
                </div>
              </div>

              {/* Co2_avoided */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center">
                  <img src="/co2.png" alt="logo" className="h-24 pl-2" />
                  <div className="flex-auto ml-8">
                    <p className="text-xl font-bold text-textc">
                      {t.co2Avoided}
                    </p>
                    <p className="text-lg text-textc">
                      {kpi?.co2_avoided
                        ? Number(
                            (kpi.co2_avoided / 1000).toFixed(2)
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "-"}{" "}
                      {t.ton}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* iPad Layout */}
      <div className="hidden md:block xl:hidden">
        <div className="flex flex-col h-screen">
          {/* Main Content Area */}
          <div className="flex flex-1 gap-4 ">
            {/* Structure */}
            <div className="flex-1 flex flex-col relative">
              {/* LOGO */}
              <div className="flex justify-center items-center mt-3 mb-4">
                <img
                  src="/slogo.png"
                  alt="logo"
                  className="h-[90px] object-contain"
                />
                <img
                  src="/seafdeclogo.png"
                  alt="logo"
                  className="h-[90px] object-contain"
                />
              </div>

              {/* structure */}
              <div className="flex-col justify-center relative">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.3}
                  maxScale={1}
                  centerOnInit
                >
                  <TransformComponent>
                    {selectedImage === "structure" ? (
                      <div className="relative flex justify-center items-center py-4">
                        <img
                          src="/flag.svg"
                          alt="flag"
                          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 h-100"
                        />
                        <img
                          src="/structure.png"
                          alt="structure"
                          className="max-w-full max-h-[calc(100vh-15rem)] object-contain"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div className="relative flex justify-center items-center py-4 px-16">
                        <img
                          src="/map.png"
                          alt="map"
                          className="max-w-full max-h-[calc(100vh-15rem)] object-contain"
                          draggable={false}
                        />
                      </div>
                    )}
                  </TransformComponent>
                </TransformWrapper>

                {/* Image Selection Buttons */}
                <div className="flex justify-center items-center w-full">
                  <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/20">
                    <button
                      onClick={() => setSelectedImage("structure")}
                      className={`p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 border-2 hover:scale-105 ${
                        selectedImage === "structure"
                          ? "border-blue-500 bg-blue-100"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src="/structure.png"
                        alt="structure"
                        className="h-6 w-6 object-contain"
                      />
                    </button>
                    <button
                      onClick={() => setSelectedImage("map")}
                      className={`p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 border-2 hover:scale-105 ${
                        selectedImage === "map"
                          ? "border-blue-500 bg-blue-100"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src="/map.png"
                        alt="map"
                        className="h-6 w-6 object-contain"
                      />
                    </button>
                  </div>
                </div>

                {/* Contact */}
                <div className="ml-8 mt-4">
                  <div className="flex items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center -mt-1">
                        <p className="text-sm text-black mt-3">Operated by</p>
                        <img
                          src="/solaryn.svg"
                          alt="solaryn"
                          className="h-[70px] absolute pl-16 pt-3"
                        />
                      </div>
                      <p className="text-sm text-black">
                        Contact (0) 2353 8600 Ext. 5504
                      </p>
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
                {/* button calendar */}
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

                {/* button language */}
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

                {/* button settings */}
                <button
                  className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 text-lg font-bold border border-white/20"
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
                      <p className="text-sm text-blue-600">
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
                <div className="flex flex-col gap-3 flex-1">
                  <p className="text-xs text-right text-gray-600 italic">
                    {getDateDisplayText()}
                  </p>

                  {/* Revenue */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/income.png" alt="logo" className="h-16 ml-2" />
                      <div className="flex-auto ml-4 pr-16">
                        <p className="text-lg font-bold text-textc">
                          {t.Revenue}
                        </p>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">
                            {!selectedDate ? t.Today : "วัน"}:
                          </p>
                          <p className="text-sm text-textc">
                            {kpi?.day_income
                              ? Number(
                                  kpi.day_income.toFixed(2)
                                ).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "-"}{" "}
                            {t.bath}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Total}:</p>
                          <p className="text-sm text-textc">
                            {kpi?.total_income
                              ? Number(
                                  kpi.total_income.toFixed(2)
                                ).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "-"}{" "}
                            {t.bath}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Yield */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/power.png" alt="logo" className="h-16 ml-2" />
                      <div className="flex-auto ml-4 pr-9">
                        <p className="text-lg font-bold text-textc">
                          {t.Yield}
                        </p>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">
                            {!selectedDate ? t.Today : "วัน"}:
                          </p>
                          <p className="text-sm text-textc">
                            {kpi?.day_power
                              ? Number(kpi.day_power.toFixed(2)).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )
                              : "-"}{" "}
                            {t.kwh}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Month}:</p>
                          <p className="text-sm text-textc">
                            {kpi?.month_power
                              ? Number(
                                  kpi.month_power.toFixed(2)
                                ).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "-"}{" "}
                            {t.kwh}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-textc">{t.Total}:</p>
                          <p className="text-sm text-textc">
                            {kpi?.total_power
                              ? Number(
                                  kpi.total_power.toFixed(2)
                                ).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "-"}{" "}
                            {t.kwh}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trees */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/trees.png" alt="logo" className="h-16 pl-1" />
                      <div className="flex-auto ml-4">
                        <p className="text-lg font-bold text-textc">{t.tree}</p>
                        <p className="text-sm text-textc">
                          {kpi?.equivalent_trees
                            ? Number(
                                kpi.equivalent_trees.toFixed(0)
                              ).toLocaleString()
                            : "-"}{" "}
                          {t.trees}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Co2_avoided */}
                  <div className="bg-gradient-to-br from-lightblue rounded-xl p-3 shadow">
                    <div className="flex items-center">
                      <img src="/co2.png" alt="logo" className="h-16 pl-1" />
                      <div className="flex-auto ml-4">
                        <p className="text-lg font-bold text-textc">
                          {t.co2Avoided}
                        </p>
                        <p className="text-sm text-textc">
                          {kpi?.co2_avoided
                            ? Number(
                                (kpi.co2_avoided / 1000).toFixed(2)
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "-"}{" "}
                          {t.ton}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* LOGO */}
        <div className=" flex justify-start items-center mt-4">
          <img
            src="/slogo.png"
            alt="logo"
            className="h-[70px] object-contain"
          />
          <img
            src="/seafdeclogo.png"
            alt="logo"
            className="h-[70px] object-contain"
          />
        </div>

        {/* Structure */}
        <div className="flex-1 flex justify-center items-center pt-3">
          <TransformWrapper
            initialScale={1}
            minScale={0.3}
            maxScale={1.5}
            centerOnInit
          >
            <TransformComponent>
              {selectedImage === "structure" ? (
                <div className="relative flex justify-center items-center py-8">
                  <img
                    src="/flag.svg"
                    alt="flag"
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 h-100"
                  />
                  <img
                    src="/structure.png"
                    alt="structure"
                    className="max-w-full max-h-[calc(100vh-10rem)] object-contain block mx-auto"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center py-8 px-16">
                  <img
                    src="/map.png"
                    alt="map"
                    className="max-w-full max-h-[calc(100vh-10rem)] object-contain block mx-auto"
                    draggable={false}
                  />
                </div>
              )}
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Image Selection Buttons - Mobile */}
        <div className="flex justify-center">
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/20">
            <button
              onClick={() => setSelectedImage("structure")}
              className={`p-1.5 rounded-lg hover:bg-blue-50 transition-all duration-300 border-2 hover:scale-105 ${
                selectedImage === "structure"
                  ? "border-blue-500 bg-blue-100"
                  : "border-transparent"
              }`}
            >
              <img
                src="/structure.png"
                alt="structure"
                className="h-6 w-6 object-contain"
              />
            </button>
            <button
              onClick={() => setSelectedImage("map")}
              className={`p-1.5 rounded-lg hover:bg-blue-50 transition-all duration-300 border-2 hover:scale-105 ${
                selectedImage === "map"
                  ? "border-blue-500 bg-blue-100"
                  : "border-transparent"
              }`}
            >
              <img
                src="/map.png"
                alt="map"
                className="h-6 w-6 object-contain"
              />
            </button>
          </div>
        </div>

        {/* Mobile KPI Panel */}
        <div className="p-4 flex flex-col gap-2 bg-white/20 backdrop-blur-xl shadow-2xl border-t border-white/30">
          {/* Header */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {/* button calender */}
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

            {/* button language */}
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

            {/* button settings */}
            <button
              className="group bg-white/80 backdrop-blur-sm text-blue-700 p-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 text-lg font-bold border border-white/20"
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
              {/* KPI Panels */}
              <p className="text-xs text-center text-gray-600 italic">
                {getDateDisplayText()}
              </p>

              {/* Revenue */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2">
                  <img src="/income.png" alt="logo" className="h-20 ml-6" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">{t.Revenue}</p>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">
                        {!selectedDate ? t.Today : "วัน"}:
                      </p>
                      <p className="text-lg text-textc mr-8">
                        {kpi?.day_income
                          ? Number(kpi.day_income.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.bath}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Total}:</p>
                      <p className="text-lg text-textc mr-8">
                        {kpi?.total_income
                          ? Number(kpi.total_income.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.bath}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yield */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2 ">
                  <img src="/power.png" alt="logo" className="h-20 ml-4" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">{t.Yield}</p>
                    <div className="flex justify-between ">
                      <p className="text-lg text-textc">
                        {!selectedDate ? t.Today : "วัน"}:
                      </p>
                      <p className="text-lg text-textc">
                        {kpi?.day_power
                          ? Number(kpi.day_power.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Month}:</p>
                      <p className="text-lg text-textc">
                        {kpi?.month_power
                          ? Number(kpi.month_power.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.kwh}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg text-textc">{t.Total}:</p>
                      <p className="text-lg text-textc">
                        {kpi?.total_power
                          ? Number(kpi.total_power.toFixed(2)).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}{" "}
                        {t.kwh}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trees */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2">
                  <img src="/trees.png" alt="logo" className="h-20 pl-2" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">{t.tree}</p>
                    <p className="text-lg text-textc">
                      {kpi?.equivalent_trees
                        ? Number(
                            kpi.equivalent_trees.toFixed(0)
                          ).toLocaleString()
                        : "-"}{" "}
                      {t.trees}
                    </p>
                  </div>
                </div>
              </div>

              {/* Co2_avoided */}
              <div className="bg-gradient-to-br from-lightblue rounded-xl p-4 shadow">
                <div className="flex items-center mb-2">
                  <img src="/co2.png" alt="logo" className="h-20 pl-2" />
                  <div className="flex-auto ml-4">
                    <p className="text-xl font-bold text-textc">
                      {t.co2Avoided}
                    </p>
                    <p className="text-lg text-textc">
                      {kpi?.co2_avoided
                        ? Number(
                            (kpi.co2_avoided / 1000).toFixed(2)
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "-"}{" "}
                      {t.ton}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bottom-2 left-4">
                <div className="flex items-start">
                  {/* ข้อมูล Contact */}
                  <div className="flex flex-col">
                    <div className="flex items-center -mt-1">
                      <p className="text-sm text-black mt-5">Operated by</p>
                      <img
                        src="/solaryn.svg"
                        alt="solaryn"
                        className="h-[90px] absolute pl-16 pt-5"
                      />
                    </div>
                    <p className="text-sm text-black">
                      Contact (0) 2353 8600 Ext. 5504
                    </p>
                  </div>

                  {/* QR Code */}
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
