import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import logo from '../assets/limajs.png';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Tentative de connexion...');
  
    try {
      const response = await apiService.login(credentials);
      console.log('Réponse de connexion:', response);
      
      if (localStorage.getItem('access_token')) {
        console.log('Token stocké, redirection...');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('Pas de token trouvé');
        setError('Erreur d\'authentification');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(
        error.error || 
        "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Logo et titre */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logo} 
            alt="LIMAJS MOTORS" 
            className="h-20 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-center text-gray-800">
            LIMAJS MOTORS S.A
          </h1>
          <div className="w-16 h-1 bg-blue-500 mt-2 mb-4"/>
          <h2 className="text-lg text-gray-600">
            Portail de Connection
          </h2>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={credentials.email}
              onChange={(e) => setCredentials({
                ...credentials,
                email: e.target.value
              })}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              disabled={isLoading}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} LIMAJS MOTORS S.A - Tous droits réservés
        </div>
      </div>
    </div>
  );
};

export default Login;
