import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ShieldAlert, Users, Network, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AlertsFeed from './AlertsFeed';
import { format } from 'date-fns';

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

export default function Dashboard({ setConnectionStatus }) {
  const [stats, setStats] = useState({ totalLogs: 0, totalAlerts: 0, uniqueIPs: 0 });
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${SOCKET_URL}/api/stats`);
        const statsData = await statsRes.json();
        setStats(statsData);

        const alertsRes = await fetch(`${SOCKET_URL}/api/alerts`);
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);

        const logsRes = await fetch(`${SOCKET_URL}/api/logs`);
        const logsData = await logsRes.json();
        setLogs(logsData);
        updateChart(logsData);
      } catch (err) {
        console.error('API Fetch Error:', err);
      }
    };

    fetchData();

    // Socket Connection
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => setConnectionStatus(true));
    socket.on('disconnect', () => setConnectionStatus(false));

    socket.on('new_alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
      setStats(s => ({ ...s, totalAlerts: s.totalAlerts + 1 }));
    });

    socket.on('new_log', (log) => {
      setLogs((prev) => {
        const newLogs = [log, ...prev].slice(0, 100);
        updateChart(newLogs);
        return newLogs;
      });
      setStats(s => ({ ...s, totalLogs: s.totalLogs + 1 }));
    });

    return () => socket.disconnect();
  }, [setConnectionStatus]);

  // Aggregate logs into minute-based buckets for the chart
  const updateChart = (data) => {
    const buckets = {};
    data.forEach(log => {
      const time = format(new Date(log.timestamp), 'HH:mm');
      if (!buckets[time]) {
        buckets[time] = { time, logins: 0, failed: 0, api: 0, uploads: 0 };
      }
      if (log.event === 'login_success') buckets[time].logins++;
      if (log.event === 'login_failed') buckets[time].failed++;
      if (log.event === 'api_request') buckets[time].api++;
      if (log.event === 'file_upload') buckets[time].uploads++;
    });
    
    const sorted = Object.values(buckets).sort((a, b) => a.time.localeCompare(b.time));
    setChartData(sorted);
  };

  return (
    <div className="dashboard-grid">
      {/* Top Stat Cards */}
      <div className="card stat-card">
        <div className="stat-title"><Activity size={16} style={{display:'inline', marginRight:'8px', color:'var(--accent-blue)'}}/>Total Events Processed</div>
        <div className="stat-value" style={{color: 'var(--text-primary)'}}>{stats.totalLogs.toLocaleString()}</div>
      </div>
      <div className="card stat-card">
        <div className="stat-title"><ShieldAlert size={16} style={{display:'inline', marginRight:'8px', color:'var(--accent-red)'}}/>Threat Alerts</div>
        <div className="stat-value" style={{color: 'var(--accent-red)'}}>{stats.totalAlerts.toLocaleString()}</div>
      </div>
      <div className="card stat-card">
        <div className="stat-title"><Network size={16} style={{display:'inline', marginRight:'8px', color:'var(--accent-yellow)'}}/>Unique IP Addresses</div>
        <div className="stat-value" style={{color: 'var(--accent-yellow)'}}>{stats.uniqueIPs.toLocaleString()}</div>
      </div>
      <div className="card stat-card">
        <div className="stat-title"><Users size={16} style={{display:'inline', marginRight:'8px', color:'var(--accent-green)'}}/>System Health</div>
        <div className="stat-value" style={{color: 'var(--accent-green)', fontSize: '1.5rem'}}>OPTIMAL</div>
      </div>

      {/* Main Chart */}
      <div className="card chart-card">
        <h2 className="card-title">Real-time Traffic Anatomy</h2>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Area type="monotone" dataKey="failed" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorFailed)" name="Failed Logins" />
            <Area type="monotone" dataKey="api" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorApi)" name="API Requests" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts Feed */}
      <div className="card alerts-card">
        <h2 className="card-title">Security Alerts Log</h2>
        <AlertsFeed alerts={alerts} />
      </div>

      {/* Raw Event Logs Table */}
      <div className="card table-container">
        <h2 className="card-title">Recent Raw Events</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User</th>
              <th>IP Address</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 10).map((log, idx) => (
              <tr key={log._id || idx}>
                <td className="mono">{format(new Date(log.timestamp), 'HH:mm:ss')}</td>
                <td>{log.event}</td>
                <td>{log.user}</td>
                <td className="mono" style={{color: 'var(--accent-blue)'}}>{log.ip}</td>
                <td>{log.source}</td>
                <td>
                  <span className={`badge ${log.severity}`}>{log.severity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
