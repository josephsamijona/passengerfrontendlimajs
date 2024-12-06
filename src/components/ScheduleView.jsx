import { useState, useEffect } from "react";
import { Clock, MapPin, Sunset, Sunrise } from "lucide-react";

const ScheduleView = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSchedule, setActiveSchedule] = useState('morning');

  // Données des arrêts
  const schedules = {
    morning: {
      time: '07:00 - 08:00',
      title: 'Trajet aller - Matin',
      icon: <Sunrise className="w-5 h-5" />,
      stops: [
        { id: 1, name: 'Cinelex / Kafou abatwa', type: 'departure', detail: 'Point de départ' },
        { id: 2, name: 'Madeline', detail: 'An fas BUH la' },
        { id: 3, name: 'Larue', detail: 'Devan ponp gaz ki a kote Valerio canez la' },
        { id: 4, name: 'Bonnay Dugal', detail: 'Devan Lea makèt la' },
        { id: 5, name: 'Kafou lamò', detail: 'Devan boutik dlo a' },
        { id: 6, name: 'Mazère', detail: 'Anfas antre Laroche la' },
        { id: 7, name: 'Cleriste', detail: 'Devan lekòl nasyonal la' },
        { id: 8, name: 'Kafou Bonga', detail: 'Nan antre a' },
        { id: 9, name: 'Kafou des pères', detail: 'Devan ti plas la' },
        { id: 10, name: 'Cité du savoir', type: 'arrival', detail: 'Devan CPE a' }
      ]
    },
    afternoon: {
      time: '15:00 - 16:00',
      title: 'Trajet retour - Après-midi',
      icon: <Sunset className="w-5 h-5" />,
      stops: [
        { id: 10, name: 'Cité du savoir', type: 'departure', detail: 'Point de départ' },
        { id: 9, name: 'Kafou des pères', detail: 'Devan ti plas la' },
        { id: 8, name: 'Kafou Bonga', detail: 'Nan antre a' },
        { id: 7, name: 'Cleriste', detail: 'Devan lekòl nasyonal la' },
        { id: 6, name: 'Mazère', detail: 'Anfas antre Laroche la' },
        { id: 5, name: 'Kafou lamò', detail: 'Devan boutik dlo a' },
        { id: 4, name: 'Bonnay Dugal', detail: 'Devan Lea makèt la' },
        { id: 3, name: 'Larue', detail: 'Devan ponp gaz ki a kote Valerio canez la' },
        { id: 2, name: 'Madeline', detail: 'An fas BUH la' },
        { id: 1, name: 'Cinelex / Kafou abatwa', type: 'arrival', detail: 'Point d\'arrivée' }
      ]
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour >= 7 && hour < 12) {
        setActiveSchedule('morning');
      } else if (hour >= 12 && hour <= 16) {
        setActiveSchedule('afternoon');
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isWorkingDay = () => {
    const day = currentTime.getDay();
    return day >= 1 && day <= 5;
  };

  const getScheduleStatus = () => {
    if (!isWorkingDay()) {
      return {
        status: 'inactive',
        message: 'Service non disponible le weekend'
      };
    }

    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 8) {
      return {
        status: 'active',
        message: 'Trajet du matin en cours'
      };
    } else if (hour >= 15 && hour < 16) {
      return {
        status: 'active',
        message: 'Trajet de l\'après-midi en cours'
      };
    } else {
      return {
        status: 'waiting',
        message: 'En attente du prochain trajet'
      };
    }
  };

  const scheduleStatus = getScheduleStatus();

  return (
    <div className="p-4 space-y-4">
      {/* En-tête avec statut */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Horaires de Transport</h2>
              <p className="text-sm text-gray-500">Lundi à Vendredi uniquement</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {currentTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
          <div className={`mt-2 p-2 rounded-md ${
            scheduleStatus.status === 'active' 
              ? 'bg-green-100 text-green-700'
              : scheduleStatus.status === 'inactive'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}>
            {scheduleStatus.message}
          </div>
        </div>
      </div>

      {/* Navigation des horaires */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setActiveSchedule('morning')}
              className={`p-4 text-center flex items-center justify-center space-x-2 ${
                activeSchedule === 'morning' 
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sunrise className="w-4 h-4" />
              <span>Matin</span>
            </button>
            <button
              onClick={() => setActiveSchedule('afternoon')}
              className={`p-4 text-center flex items-center justify-center space-x-2 ${
                activeSchedule === 'afternoon'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sunset className="w-4 h-4" />
              <span>Après-midi</span>
            </button>
          </div>
        </div>

        {/* Liste des arrêts */}
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            {schedules[activeSchedule].icon}
            <div>
              <h3 className="font-semibold">{schedules[activeSchedule].title}</h3>
              <p className="text-sm text-gray-500">{schedules[activeSchedule].time}</p>
            </div>
          </div>

          <div className="space-y-4">
            {schedules[activeSchedule].stops.map((stop, index) => (
              <div 
                key={stop.id}
                className="relative flex items-start space-x-4"
              >
                {index !== schedules[activeSchedule].stops.length - 1 && (
                  <div className="absolute left-[0.9375rem] top-6 w-0.5 h-full bg-gray-200" />
                )}
                
                <div className={`relative z-10 rounded-full p-2 ${
                  stop.type === 'departure' 
                    ? 'bg-green-100' 
                    : stop.type === 'arrival'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                }`}>
                  <MapPin className={`w-4 h-4 ${
                    stop.type === 'departure' 
                      ? 'text-green-600' 
                      : stop.type === 'arrival'
                        ? 'text-red-600'
                        : 'text-blue-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{stop.name}</h4>
                  <p className="text-sm text-gray-500">{stop.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;