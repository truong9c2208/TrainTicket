import { useEffect, useState, useCallback } from 'react';
import { webApi } from './lib/client';

/* ─── helpers ─── */
const DATE_KEYS = new Set(['createdAt','updatedAt','departureDate','arrivalTime','departureTime','bookedAt','canceledAt','startDate','endDate']);
function fmtDT(v: string) {
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  const p = (n: number) => String(n).padStart(2,'0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`;
}
function fmtVal(k: string, v: unknown) {
  if (k === 'occupancyRate' && typeof v === 'number') return v.toFixed(2)+'%';
  if (DATE_KEYS.has(k) && typeof v === 'string') return fmtDT(v);
  if (k === 'priceCents' && typeof v === 'number') return (v/100).toLocaleString('vi-VN')+'đ';
  return String(v ?? '');
}

/* ─── tab config ─── */
type FieldDef = { key: string; label: string; type: 'text'|'email'|'password'|'select'|'datetime-local'|'number'|'textarea'; required?: boolean; options?: string[]; placeholder?: string };

const TABS = ['stations','trains','trips','users','reports'] as const;
type Tab = typeof TABS[number];

const TAB_LABELS: Record<Tab, string> = { stations:'Stations', trains:'Trains & Coaches', trips:'Schedule Trips', users:'Users', reports:'Revenue Reports' };

const TAB_ENDPOINT: Partial<Record<Tab,string>> = { stations:'/stations', trains:'/trains', trips:'/trips', users:'/users' };

const TAB_FIELDS: Partial<Record<Tab, FieldDef[]>> = {
  stations: [
    { key:'code', label:'Code', type:'text', required:true, placeholder:'HAN' },
    { key:'name', label:'Name', type:'text', required:true, placeholder:'Hà Nội' },
    { key:'phone', label:'Phone', type:'text', placeholder:'+84...' },
    { key:'address', label:'Address', type:'text' },
    { key:'description', label:'Description', type:'textarea' },
  ],
  trains: [
    { key:'code', label:'Code', type:'text', required:true, placeholder:'SE1' },
    { key:'name', label:'Name', type:'text', required:true, placeholder:'Thống Nhất' },
  ],
  trips: [
    { key:'code', label:'Trip Code', type:'text', required:true, placeholder:'SE1-20260501' },
    { key:'trainId', label:'Train ID', type:'number', required:true },
    { key:'departureDate', label:'Departure Date/Time', type:'datetime-local', required:true },
  ],
  users: [
    { key:'email', label:'Email', type:'email', required:true },
    { key:'fullName', label:'Full Name', type:'text', required:true },
    { key:'password', label:'Password (leave blank to keep)', type:'password' },
    { key:'role', label:'Role', type:'select', options:['CUSTOMER','MANAGER'], required:true },
    { key:'phone', label:'Phone', type:'text' },
    { key:'address', label:'Address', type:'text' },
  ],
};

/* ─── Toast ─── */
type ToastState = { msg: string; ok: boolean } | null;

/* ─── component ─── */
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('stations');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // modal
  const [modalMode, setModalMode] = useState<'create'|'edit'|null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);

  // delete confirm
  const [delItem, setDelItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // toast
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* fetch */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = TAB_ENDPOINT[tab] ?? '';
      if (tab === 'reports') {
        const y = new Date().getFullYear();
        endpoint = `/reports/train-revenue?startDate=${y}-01-01&endDate=${y}-12-31`;
      }
      if (!endpoint) { setData([]); return; }
      const res = await webApi.get<any>(endpoint);
      setData(Array.isArray(res) ? res : []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* open modals */
  const openCreate = () => {
    const defaults: Record<string,string> = {};
    TAB_FIELDS[tab]?.forEach(f => { defaults[f.key] = f.options?.[0] ?? ''; });
    setForm(defaults);
    setEditItem(null);
    setModalMode('create');
  };
  const openEdit = (item: any) => {
    const pre: Record<string,string> = {};
    TAB_FIELDS[tab]?.forEach(f => {
      let v = item[f.key] ?? '';
      if (f.type === 'datetime-local' && v) {
        try { v = new Date(v).toISOString().slice(0,16); } catch { /* ignore */ }
      }
      if (f.key === 'password') v = '';
      pre[f.key] = String(v);
    });
    setForm(pre);
    setEditItem(item);
    setModalMode('edit');
  };

  /* submit */
  const handleSubmit = async () => {
    const ep = TAB_ENDPOINT[tab];
    if (!ep) return;
    setSaving(true);
    try {
      const payload: Record<string,any> = { ...form };
      // coerce numbers
      if (tab === 'trips') payload.trainId = Number(payload.trainId);
      // remove empty password on edit
      if (tab === 'users' && modalMode === 'edit' && !payload.password) delete payload.password;
      // datetime → ISO
      if (tab === 'trips' && payload.departureDate) payload.departureDate = new Date(payload.departureDate).toISOString();

      if (modalMode === 'create') {
        await webApi.post<any>(ep, payload);
        showToast('Created successfully!');
      } else {
        await webApi.put<any>(`${ep}/${editItem.id}`, payload);
        showToast('Updated successfully!');
      }
      setModalMode(null);
      fetchData();
    } catch (e: any) {
      showToast(e?.message ?? 'Error occurred', false);
    } finally { setSaving(false); }
  };

  /* delete */
  const handleDelete = async () => {
    const ep = TAB_ENDPOINT[tab];
    if (!ep || !delItem) return;
    setDeleting(true);
    try {
      await webApi.delete<any>(`${ep}/${delItem.id}`);
      showToast('Deleted successfully!');
      setDelItem(null);
      fetchData();
    } catch (e: any) {
      showToast(e?.message ?? 'Delete failed', false);
    } finally { setDeleting(false); }
  };

  /* visible columns */
  const cols = data.length > 0
    ? Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object' && typeof data[0][k] !== 'undefined')
    : [];

  const fields = TAB_FIELDS[tab];
  const canCRUD = tab !== 'reports';

  return (
    <main className="admin-page app-page">
      {/* topbar */}
      <header className="topbar">
        <h1>Admin Dashboard</h1>
        <div className="topbar-actions">
          <button type="button" className="btn ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <section className="grid" style={{ gridTemplateColumns: '220px 1fr' }}>
        {/* sidebar */}
        <aside className="card stack" style={{ padding: '20px 16px' }}>
          {TABS.map(t => (
            <button key={t} className={tab === t ? 'btn active' : 'btn ghost'} onClick={() => setTab(t)}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </aside>

        {/* main content */}
        <article className="card" style={{ padding: '28px 32px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h2 style={{ margin:0 }}>{TAB_LABELS[tab]}</h2>
            {canCRUD && fields && (
              <button className="btn" style={{ padding:'10px 22px', fontSize:'0.9rem' }} onClick={openCreate}>
                + Add New
              </button>
            )}
          </div>

          {loading ? (
            <p className="subtle">Loading...</p>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', textAlign:'left', borderCollapse:'collapse', fontSize:'0.88rem' }}>
                <thead>
                  <tr>
                    {cols.map(k => <th key={k} style={thStyle}>{k}</th>)}
                    {canCRUD && <th style={{ ...thStyle, textAlign:'center' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={i} style={{ transition:'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      {cols.map(k => (
                        <td key={k} style={tdStyle}>{fmtVal(k, item[k])}</td>
                      ))}
                      {canCRUD && (
                        <td style={{ ...tdStyle, textAlign:'center', whiteSpace:'nowrap' }}>
                          {fields && (
                            <button
                              className="btn ghost"
                              style={{ padding:'5px 14px', fontSize:'0.8rem', marginRight:6 }}
                              onClick={() => openEdit(item)}>
                              Edit
                            </button>
                          )}
                          <button
                            className="btn"
                            style={{ padding:'5px 14px', fontSize:'0.8rem', background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)', boxShadow:'none' }}
                            onClick={() => setDelItem(item)}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length === 0 && <p className="subtle" style={{ marginTop:20 }}>No records found.</p>}
            </div>
          )}
        </article>
      </section>

      {/* ─── Create / Edit Modal ─── */}
      {modalMode && fields && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) setModalMode(null); }}>
          <div style={modalStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ margin:0, fontSize:'1.2rem', fontWeight:700 }}>
                {modalMode === 'create' ? 'Add New' : 'Edit'} {TAB_LABELS[tab]}
              </h3>
              <button onClick={() => setModalMode(null)} style={closeBtnStyle}>✕</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16, maxHeight:'65vh', overflowY:'auto', paddingRight:4 }}>
              {fields.map(f => (
                <label key={f.key} className="field">
                  {f.label}{f.required && <span style={{ color:'#f87171' }}>*</span>}
                  {f.type === 'select' ? (
                    <select value={form[f.key] ?? ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={form[f.key] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ padding:'12px 16px', border:'1px solid var(--input-border)', borderRadius:12, background:'var(--input-bg)', color:'var(--text-primary)', fontFamily:'inherit', fontSize:'1rem', resize:'vertical', outline:'none' }}
                    />
                  ) : (
                    <input
                      type={f.type}
                      value={form[f.key] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      required={f.required}
                    />
                  )}
                </label>
              ))}
            </div>

            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button className="btn ghost" onClick={() => setModalMode(null)} disabled={saving}>Cancel</button>
              <button className="btn" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ─── */}
      {delItem && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget && !deleting) setDelItem(null); }}>
          <div style={{ ...modalStyle, maxWidth:420 }}>
            <h3 style={{ margin:'0 0 12px', fontSize:'1.1rem', fontWeight:700 }}>Confirm Delete</h3>
            <p style={{ margin:'0 0 24px', color:'var(--text-secondary)', fontSize:'0.95rem' }}>
              Are you sure you want to delete record <strong>#{delItem.id}</strong>? This action cannot be undone.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button className="btn ghost" onClick={() => setDelItem(null)} disabled={deleting}>Cancel</button>
              <button
                className="btn"
                style={{ background:'#dc2626', boxShadow:'0 4px 12px rgba(220,38,38,0.3)' }}
                onClick={handleDelete}
                disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div style={{
          position:'fixed', bottom:32, right:32, zIndex:10000,
          padding:'14px 22px',
          background: toast.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius:12,
          color: toast.ok ? '#6ee7b7' : '#fca5a5',
          fontWeight:600, fontSize:'0.9rem',
          backdropFilter:'blur(16px)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
          animation:'fadeIn 0.3s ease',
        }}>
          {toast.ok ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}
    </main>
  );
}

/* ─── style constants ─── */
const thStyle: React.CSSProperties = {
  borderBottom:'1px solid var(--surface-border)',
  padding:'10px 12px',
  fontWeight:600,
  fontSize:'0.8rem',
  color:'var(--text-secondary)',
  textTransform:'uppercase',
  letterSpacing:'0.5px',
};
const tdStyle: React.CSSProperties = {
  borderBottom:'1px solid var(--surface-border)',
  padding:'10px 12px',
  maxWidth:200,
  overflow:'hidden',
  textOverflow:'ellipsis',
  whiteSpace:'nowrap',
};
const overlayStyle: React.CSSProperties = {
  position:'fixed', inset:0, zIndex:9000,
  background:'rgba(0,0,0,0.6)',
  backdropFilter:'blur(6px)',
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:24,
};
const modalStyle: React.CSSProperties = {
  background:'var(--surface-bg)',
  border:'1px solid var(--surface-border)',
  borderRadius:20,
  padding:'32px 36px',
  width:'100%', maxWidth:560,
  boxShadow:'0 24px 64px rgba(0,0,0,0.4)',
  animation:'fadeIn 0.25s cubic-bezier(0.4,0,0.2,1)',
};
const closeBtnStyle: React.CSSProperties = {
  background:'none', border:'none', color:'var(--text-secondary)',
  fontSize:'1.2rem', cursor:'pointer', lineHeight:1, padding:4,
};
