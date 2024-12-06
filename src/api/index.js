// src/api/index.js
import axios from 'axios';

// Configuration de base de l'API
const api = axios.create({
 baseURL: 'https://limajsmotors.up.railway.app/api/v1',
 timeout: 5000,
 headers: {
   'Content-Type': 'application/json' 
 }
});

// Intercepteur pour le token d'accès
api.interceptors.request.use(
 config => {
   const token = localStorage.getItem('access_token');
   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
 },
 error => Promise.reject(error)
);

// Intercepteur pour gérer le rafraîchissement du token
api.interceptors.response.use(
 (response) => response,
 async (error) => {
   const originalRequest = error.config;

   if (error.response?.status === 401 && !originalRequest._retry) {
     originalRequest._retry = true;

     try {
       const refreshToken = localStorage.getItem('refresh_token');
       if (!refreshToken) {
         throw new Error('No refresh token available');
       }

       const response = await api.post('/token/refresh/', {
         refresh: refreshToken
       });

       const { access } = response.data;
       localStorage.setItem('access_token', access);

       originalRequest.headers.Authorization = `Bearer ${access}`;
       return api(originalRequest);  // Utiliser l'instance api au lieu de axios
     } catch (refreshError) {
       authService.logout();
       return Promise.reject(refreshError);
     }
   }
   return Promise.reject(error);
 }
);

// Service de tracking des bus
const trackingService = {
 getActiveBuses: async () => {
   try {
     const response = await api.get('/transport/tracking_bus/active_buses/');
     console.log("Données brutes de l'API:", response.data);

     // Vérification du format des coordonnées
     const firstBus = response.data[0];
     if (firstBus) {
       console.log("Format des coordonnées du premier bus:", {
         longitude: firstBus.longitude,
         latitude: firstBus.latitude,
         type_longitude: typeof firstBus.longitude,
         type_latitude: typeof firstBus.latitude
       });
     }

     return response.data.map(bus => {
       const longitude = parseFloat(bus.longitude);
       const latitude = parseFloat(bus.latitude);
       
       console.log(`Bus ${bus.device_id} - Coordonnées après conversion:`, {
         longitude,
         latitude,
         isValid: !isNaN(longitude) && !isNaN(latitude)
       });

       const currentLocation = !isNaN(longitude) && !isNaN(latitude) 
         ? [longitude, latitude]
         : [-72.3074, 18.5944]; // Coordonnées par défaut pour Port-au-Prince

       return {
         id: bus.device_id,
         name: `Bus ${bus.device_id}`,
         status: 'active',
         currentLocation,
         speed: bus.speed ? `${bus.speed.toFixed(1)} km/h` : '0 km/h',
         lastUpdate: new Date(bus.timestamp).toLocaleTimeString()
       };
     });
   } catch (error) {
     console.error('Erreur lors de la récupération des bus actifs:', error);
     throw error;
   }
 },

 getBusHistory: async (busId, duration = 15) => {
   try {
     const response = await api.get(`/transport/tracking_bus/${busId}/history/`, {
       params: { duration }
     });
     return response.data;
   } catch (error) {
     console.error(`Erreur lors de la récupération de l'historique du bus ${busId}:`, error);
     throw error;
   }
 }
};

// Service d'authentification
const authService = {
 login: async (credentials) => {
   try {
     const response = await api.post('/auth/login/', credentials);
     const { tokens, user } = response.data;
     
     localStorage.setItem('access_token', tokens.access);
     localStorage.setItem('refresh_token', tokens.refresh);
     localStorage.setItem('user_data', JSON.stringify(user));

     return {
       user: user,
       success: true
     };
   } catch (error) {
     console.error('Erreur de connexion:', error);
     throw error.response?.data || { error: 'Erreur lors de la connexion' };
   }
 },

 logout: async () => {
   try {
     const refresh_token = localStorage.getItem('refresh_token');
     if (refresh_token) {
       await api.post('/auth/logout/', { refresh_token });
     }
   } catch (error) {
     console.error('Erreur lors de la déconnexion:', error);
   } finally {
     localStorage.removeItem('access_token');
     localStorage.removeItem('refresh_token');
     localStorage.removeItem('user_data');
     window.location.href = '/login';
   }
 },

 refreshToken: async () => {
   try {
     const refresh = localStorage.getItem('refresh_token');
     if (!refresh) throw new Error('No refresh token found');

     const response = await api.post('/auth/token/refresh/', { refresh });
     const { access } = response.data;
     
     localStorage.setItem('access_token', access);
     return access;
   } catch (error) {
     console.error('Erreur lors du rafraîchissement du token:', error);
     throw error;
   }
 },

 getCurrentUser: () => {
   const userData = localStorage.getItem('user_data');
   return userData ? JSON.parse(userData) : null;
 },

 isAuthenticated: () => {
   return !!localStorage.getItem('access_token');
 }
};

export const apiService = {
 ...authService,
 ...trackingService
};

export default api;