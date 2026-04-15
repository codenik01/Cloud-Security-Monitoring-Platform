import React from 'react';
import { format } from 'date-fns';

export default function AlertsFeed({ alerts }) {
  return (
    <div className="alerts-feed">
      {alerts.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
          No threats detected recently.
        </div>
      ) : (
        alerts.map((alert, idx) => (
          <div key={alert._id || idx} className={`alert-item ${alert.severity}`}>
            <div className="alert-header">
              <span className="alert-type">{alert.type.replace('_', ' ')}</span>
              <span className="alert-time">
                {format(new Date(alert.timestamp), 'HH:mm:ss')}
              </span>
            </div>
            <div className="alert-message">{alert.message}</div>
            <div className="alert-meta">
              <span>IP: {alert.ip || 'Unknown'}</span>
              {alert.count && <span>Hits: {alert.count}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
