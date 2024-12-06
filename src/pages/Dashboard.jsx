// Dashboard page implementation
import  'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import MapView from '../components/MapView';
import ScheduleView from '../components/ScheduleView';

const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="map" element={<MapView />} />
          <Route path="schedule" element={<ScheduleView />} />
          <Route path="/" element={<Navigate to="map" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;