import 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const AppRoutes = () => {
  // Mise à jour de la vérification d'authentification
  const isAuthenticated = () => !!localStorage.getItem('access_token');

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !isAuthenticated() ? (
            <Login />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      <Route 
        path="/dashboard/*" 
        element={
          isAuthenticated() ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;