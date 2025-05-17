import './styles/index.css';

import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Clock from './components/Clock';
import Footer from './Footer';

function App() {
  return (
    <>
      <Clock />
      <AppRoutes />
      <Footer />
    </>
  );
}

export default App;



