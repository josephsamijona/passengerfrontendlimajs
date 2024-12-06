// Bottom navigation component implementation
import  'react';
import { MapPin, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-white border-t flex justify-around p-4">
      <button
        className={`flex flex-col items-center ${
          location.pathname.includes('map') ? 'text-blue-500' : 'text-gray-500'
        }`}
        onClick={() => navigate('/dashboard/map')}
      >
        <MapPin className="w-6 h-6" />
        <span>Carte</span>
      </button>
      <button
        className={`flex flex-col items-center ${
          location.pathname.includes('schedule') ? 'text-blue-500' : 'text-gray-500'
        }`}
        onClick={() => navigate('/dashboard/schedule')}
      >
        <Calendar className="w-6 h-6" />
        <span>Horaires</span>
      </button>
    </div>
  );
};

export default BottomNav;