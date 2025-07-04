import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getAuthInfo } from '../../utils/getAuthInfo';

export default function A1() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuthInfo();
    if (!auth || (auth.role !== 'admin' && auth.assignedDashboard !== 'A1')) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Dashboard A1</h1>
      <button
        className="bg-red-500 text-white px-4 py-2"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
