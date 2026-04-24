import Sidebar from '@/components/Sidebar';

const COLS = 6;
const CARDS_PER_COL = 3;

export default function JobsLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '28px 36px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton" style={{ width: 200, height: 14, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: 260, height: 38 }} />
        </div>
        <div style={{ flex: 1, overflowX: 'auto', padding: '24px 36px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {[...Array(COLS)].map((_, col) => (
            <div key={col} style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton" style={{ height: 28, marginBottom: 4 }} />
              {[...Array(CARDS_PER_COL)].map((_, card) => (
                <div key={card} className="skeleton" style={{ height: 72, borderRadius: 8 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
