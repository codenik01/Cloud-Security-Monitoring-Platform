import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Activity, AlertTriangle, Settings, Database } from 'lucide-react';
import Dashboard from './components/Dashboard';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  // We'll manage the socket connection status at the top level
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Shield size={24} />
          </div>
          CloudSec Mon
        </div>

        <nav>
          <div className="nav-item active">
            <LayoutDashboard size={20} />
            Dashboard
          </div>
          <div className="nav-item">
            <Activity size={20} />
            Live Traffic
          </div>
          <div className="nav-item">
            <AlertTriangle size={20} />
            Threat Alerts
          </div>
          <div className="nav-item">
            <Database size={20} />
            Logs Explorer
          </div>
          <div className="nav-item" style={{ marginTop: 'auto' }}>
            <Settings size={20} />
            Settings
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">Security Overview</h1>
          <div className="status-badge">
            <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
            {isConnected ? 'System Secure' : 'Connecting Engine...'}
          </div>
        </header>

        <Dashboard setConnectionStatus={setIsConnected} />
      </main>
    </div>
  );
}

export default App;
