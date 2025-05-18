import { NavLink } from 'react-router-dom';
import './styles/index.css';
import AppRoutes from './routes/AppRoutes';
import Clock from './components/Clock';
import Footer from './Footer';
import LanguageSelector from './components/LanguageSelector';

function App() {
  // You might have some authentication state here
  const userRole = 'employer'; // This should come from your auth system

  return (
    <>
      <nav className="main-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        
        {userRole === 'employer' && (
          <>
            <NavLink to="/employer/ip-settings">IP Settings</NavLink>
            <NavLink to="/employer/failed-attempts">Failed Attempts</NavLink>
          </>
        )}
        
        {userRole === 'employee' && (
          <NavLink to="/employee/clock-in">Clock In/Out</NavLink>
        )}
      </nav>
      
      <LanguageSelector />
      <Clock />
      <Footer />
    </>
  );
}

export default App;



