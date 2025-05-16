import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import './clock.css';
=======
import './Clock.css';
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return [
    hours.toString().padStart(2, '0'),
    ':',
    minutes.toString().padStart(2, '0'),
    ':',
    seconds.toString().padStart(2, '0'),
    ' ',
    ampm,
  ].join('');
}

function formatDate(date) {
<<<<<<< HEAD
  const days = ['SUN','MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' ];
=======
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="live-clock">
      <div className="clock-time">{formatTime(now)}</div>
      <div className="clock-date">{formatDate(now)}</div>
    </div>
  );
}