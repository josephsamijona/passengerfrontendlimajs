import  'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './AppRoutes';
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes />
    </Router>
  );
};

export default App;