// src/components/MapView.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
//import '../node_modules/mapbox-gl/dist/mapbox-gl.css';
import { Menu, X, Bus, Clock, Wifi } from 'lucide-react';
import { MAPBOX_TOKEN } from '../config/constants';
import { apiService } from '../api';
import 'mapbox-gl/dist/mapbox-gl.css';

const HAITI_COORDINATES = {
  center: [-72.3074, 18.5944], // Port-au-Prince
  zoom: 15.5,
  pitch: 45,
  bearing: -17.6
};

const MapView = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const sourcesRef = useRef(new Set());
  const [showSideMenu, setShowSideMenu] = useState(true);
  const [activeBus, setActiveBus] = useState(null);
  const [buses, setBuses] = useState([]);
  const [busHistory, setBusHistory] = useState(null);

  // Initialisation de la carte
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      ...HAITI_COORDINATES,
      antialias: true
    });

    mapRef.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    mapRef.current.on('style.load', () => {
      // Ajout des bâtiments 3D
      const layers = mapRef.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      mapRef.current.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    return () => mapRef.current.remove();
  }, []);

  // Charger l'historique d'un bus
  const loadBusHistory = useCallback(async (busId) => {
    try {
      const history = await apiService.getBusHistory(busId);
      setBusHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }, []);

  // Récupération des données des bus
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const data = await apiService.getActiveBuses();
        setBuses(data);

        // Si un bus est actif, charger son historique
        if (activeBus) {
          loadBusHistory(activeBus);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchBusData();
    const interval = setInterval(fetchBusData, 5000); // Mise à jour toutes les 5 secondes
    return () => clearInterval(interval);
  }, [activeBus, loadBusHistory]);

  // Mise à jour des marqueurs et trajectoires
  useEffect(() => {
    if (!mapRef.current) return;

    // Nettoyer les anciennes sources
    sourcesRef.current.forEach(sourceId => {
      if (mapRef.current.getSource(sourceId)) {
        const layerId = `layer-${sourceId}`;
        if (mapRef.current.getLayer(layerId)) {
          mapRef.current.removeLayer(layerId);
        }
        mapRef.current.removeSource(sourceId);
      }
    });
    sourcesRef.current.clear();

    // Mettre à jour les marqueurs
    buses.forEach(bus => {
      if (!markersRef.current[bus.id]) {
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.innerHTML = `
          <div class="p-2 bg-blue-500 rounded-full shadow-lg transform transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4a2 2 0 0 0-2 2v10h2m2 0h8"></path>
              <circle cx="6.5" cy="17" r="2"></circle>
              <circle cx="16.5" cy="17" r="2"></circle>
            </svg>
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat(bus.currentLocation)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-3">
                  <h3 class="font-bold text-lg mb-2">${bus.name}</h3>
                  <div class="space-y-1">
                    <p class="text-sm flex items-center">
                      <span class="font-medium">Vitesse:</span> 
                      <span class="ml-2">${bus.speed}</span>
                    </p>
                  </div>
                </div>
              `)
          )
          .addTo(mapRef.current);

        markersRef.current[bus.id] = marker;
      } else {
        markersRef.current[bus.id].setLngLat(bus.currentLocation);
      }
    });

    // Afficher l'historique si disponible
    if (busHistory && activeBus) {
      const sourceId = `history-${activeBus}`;
      sourcesRef.current.add(sourceId);

      mapRef.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: busHistory.coordinates
          }
        }
      });

      mapRef.current.addLayer({
        id: `layer-${sourceId}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    }
  }, [buses, busHistory, activeBus]);

  return (
    <div className="relative h-full">
      {/* Menu latéral */}
      <div
        className={`absolute top-0 left-0 z-10 h-full w-80 bg-white shadow-lg transform transition-transform ${
          showSideMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Véhicules en service</h2>
              <button
                onClick={() => setShowSideMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {buses.length} bus{buses.length > 1 ? 's' : ''} en circulation
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className={`bg-white rounded-lg border transition-all ${
                  activeBus === bus.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-blue-200 hover:shadow'
                } cursor-pointer`}
                onClick={() => {
                  setActiveBus(bus.id);
                  mapRef.current.flyTo({
                    center: bus.currentLocation,
                    zoom: 16,
                    duration: 1500
                  });
                }}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Bus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{bus.name}</h3>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        En service
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{bus.speed}</span>
                    </div>

                    <div className="flex items-center text-xs">
                      <Wifi className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-gray-500">
                        Dernière mise à jour: {bus.lastUpdate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!showSideMenu && (
        <button
          onClick={() => setShowSideMenu(true)}
          className="absolute top-4 left-4 z-10 p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      )}

      <div ref={mapContainerRef} className="h-full w-full" />
      
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div className="text-sm space-y-1">
          <div className="font-medium text-gray-900">État du service</div>
          <div className="flex items-center text-gray-600">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span>{buses.length} véhicules actifs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;