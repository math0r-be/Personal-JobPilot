import Sidebar from '@/components/Sidebar';

export default function CvLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 120, height: 48 }} />
          </div>
          <div className="skeleton" style={{ width: 110, height: 38, borderRadius: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 180, borderRadius: 0 }} />
              <div style={{ padding: '10px 14px' }}>
                <div className="skeleton" style={{ width: '70%', height: 13, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '40%', height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
