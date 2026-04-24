import Sidebar from '@/components/Sidebar';

export default function EmailsLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div className="skeleton" style={{ width: 100, height: 10, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 140, height: 48 }} />
          </div>
          <div className="skeleton" style={{ width: 130, height: 38, borderRadius: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[60, 80, 70, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 26, borderRadius: 999 }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 58, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
