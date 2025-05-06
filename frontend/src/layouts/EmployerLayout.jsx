import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';

export default function EmployerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarLinks = [
    { name: 'Employees', icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-8 0 4 4 0 008 0zm6 4a4 4 0 10-8 0 4 4 0 008 0z" />
      </svg>
    ) },
    // Add more links here
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform transform bg-white border-r shadow-lg lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <span className="text-xl font-bold text-blue-600">Employer Panel</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            {sidebarLinks.map(link => (
              <a key={link.name} href="#" className="flex items-center px-4 py-2 text-gray-700 rounded hover:bg-blue-100 transition">
                {link.icon}
                {link.name}
              </a>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={() => logout(navigate)}
              className="flex items-center gap-2 text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        </header>
        {/* Main section */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
