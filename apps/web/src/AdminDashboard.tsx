import { useEffect, useState } from 'react';
import { webApi } from './lib/client';

const DATE_KEYS = new Set([
  'createdAt', 'updatedAt', 'departureDate', 'arrivalTime',
  'departureTime', 'bookedAt', 'canceledAt', 'startDate', 'endDate',
]);

function formatDateTime(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('stations');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'stations') endpoint = '/stations';
      else if (activeTab === 'users') endpoint = '/users';
      else if (activeTab === 'trains') endpoint = '/trains';
      else if (activeTab === 'trips') endpoint = '/trips';
      else if (activeTab === 'reports') {
        const d = new Date();
        const start = `${d.getFullYear()}-01-01`;
        const end = `${d.getFullYear()}-12-31`;
        endpoint = `/reports/train-revenue?startDate=${start}&endDate=${end}`;
      }

      const res = await webApi.get<any>(endpoint);
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page app-page">
      <header className="topbar">
        <h1>Admin Dashboard</h1>
        <div className="topbar-actions">
          <button type="button" className="ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="grid" style={{ gridTemplateColumns: '250px 1fr' }}>
        <aside className="card stack">
          <button className={activeTab === 'stations' ? 'active' : 'ghost'} onClick={() => setActiveTab('stations')}>Stations</button>
          <button className={activeTab === 'trains' ? 'active' : 'ghost'} onClick={() => setActiveTab('trains')}>Trains & Coaches</button>
          <button className={activeTab === 'trips' ? 'active' : 'ghost'} onClick={() => setActiveTab('trips')}>Schedule Trips</button>
          <button className={activeTab === 'users' ? 'active' : 'ghost'} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'reports' ? 'active' : 'ghost'} onClick={() => setActiveTab('reports')}>Revenue Reports</button>
        </aside>

        <article className="card">
          <h2>{activeTab.toUpperCase()} Management</h2>
          {loading ? <p>Loading...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {data.length > 0 && Object.keys(data[0]).map(k => typeof data[0][k] !== 'object' && <th key={k} style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={i}>
                      {Object.keys(item).map(k => {
                        if (typeof item[k] === 'object') return null;
                        let val = item[k];
                        if (k === 'occupancyRate' && typeof val === 'number') {
                          val = val.toFixed(2);
                        } else if (DATE_KEYS.has(k) && typeof val === 'string') {
                          val = formatDateTime(val);
                        }
                        return <td key={k} style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{String(val)}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length === 0 && <p className="subtle">No records found.</p>}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
