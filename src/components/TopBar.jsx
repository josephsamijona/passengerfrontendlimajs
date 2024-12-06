import  'react';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import logo from '../assets/limajs.png';

const TopBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <img src={logo} alt="LIMAJS MOTORS" className="h-10 w-10" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">LIMAJS MOTORS S.A</h1>
          <p className="text-sm text-gray-500">Transport Dashboard</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-6 h-6 cursor-pointer text-gray-600 hover:text-blue-500 transition-colors" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            0
          </span>
        </div>
        <LogOut 
          className="w-6 h-6 cursor-pointer text-gray-600 hover:text-blue-500 transition-colors" 
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default TopBar;