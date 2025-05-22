import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../comps/AdminSidebar';
import AdminHeader from '../comps/AdminHeader';
import DashboardPanel from '../comps/DashboardPanel';
import AirlinesPanel from '../comps/AirlinesPanel';
import AircraftPanel from '../comps/AircraftPanel';
import TerminalPanel from '../comps/TerminalPanel';
import GatePanel from '../comps/GatePanel';
import PassengersPanel from '../comps/PassengersPanel';
import FlightsPanel from '../comps/FlightsPanel';
import TicketsPanel from '../comps/TicketsPanel';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false); // Set to true for now to avoid redirect
  
  useEffect(() => {
    const checkAdminStatus = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user.role === 'admin');
    };
    
    // Uncomment this when you want to enable auth check
    // checkAdminStatus();
  }, []);

  const renderActivePanel = () => {
    switch(activeSection) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'airlines':
        return <AirlinesPanel />;
      case 'aircraft':
        return <AircraftPanel />;
      case 'terminals':
        return <TerminalPanel />;
      case 'gates':
        return <GatePanel />;
      case 'passengers':
        return <PassengersPanel />;
      case 'flights':
        return <FlightsPanel />;
      case 'tickets':
        return <TicketsPanel />;
      default:
        return <DashboardPanel />;
    }
  };


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-800 mt-4">
          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}