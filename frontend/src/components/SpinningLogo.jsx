import React from 'react';
import './SpinningLogo.css';
import logoImg from '../components/logo.png'; 

export default function SpinningLogo() {
  return (
    <div className="spinning-logo-container">
      <img src={logoImg} alt="Logo" className="spinning-logo" />
    </div>
  );
}
