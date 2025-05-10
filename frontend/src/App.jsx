import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Clock from './components/Clock';

function App() {
  return (
    <>
      <Clock />
      <AppRoutes />
    </>
  );
}

export default App;



