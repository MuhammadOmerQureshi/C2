import React, { useEffect, useState } from 'react';
import './clock.css';

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
  const days = ['SUN','MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' ];
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

function Clock() {
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

export default Clock;