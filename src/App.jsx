import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardA1 from './pages/dashboards/A1';
import DashboardB1 from './pages/dashboards/B1';
import DashboardC1 from './pages/dashboards/C1';
import DashboardSeafdec from './pages/dashboards/Seafdec';
import AdminPage from './pages/AdminPage';
function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า Login เป็น root */}
        <Route path="/" element={<LoginPage />} />

        {/* Dashboard ของแต่ละ user */}
        <Route path="/dashboard/A1" element={<DashboardA1 />} />
        <Route path="/dashboard/B1" element={<DashboardB1 />} />
        <Route path="/dashboard/C1" element={<DashboardC1 />} />
        <Route path="/dashboard/seafdec" element={<DashboardSeafdec />} />

        {/* หน้า admin */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
