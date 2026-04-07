import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const ALL_YEARS = Array.from({ length: 24 }, (_, i) => 2000 + i);

function buildSIData(savings, investment, ca, showCA) {
  return ALL_YEARS.map(year => {
    const s = savings.find(d => d.year === year);
    const i = investment.find(d => d.year === year);
    const c = ca.find(d => d.year === year);
    const row = {
      year,
      Savings: s ? parseFloat(s.value.toFixed(2)) : null,
      Investment: i ? parseFloat(i.value.toFixed(2)) : null,
    };
    if (showCA) row['Current account'] = c ? parseFloat(c.value.toFixed(2)) : null;
    return row;
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 12, height: 3, background: p.color, display: 'inline-block', borderRadius: 2 }} />
          <span style={{ color: '#374151' }}>{p.dataKey}:</span>
          <span style={{ fontWeight: 600 }}>{p.value !== null && p.value !== undefined ? `${p.value}%` : 'N/A'}</span>
        </div>
      ))}
    </div>
  );
}

export default function SIChart({ countryName, savings, investment, ca = [], caLoading, loading, error, onRemove, onRetry, retryCount = 0 }) {
  const [showCA, setShowCA] = useState(false);
  const hasData = savings.length > 0 || investment.length > 0;
  const chartData = buildSIData(savings, investment, ca, showCA);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 16px 12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{countryName}</h3>
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 13,
            color: '#6b7280',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '40px 0', color: '#6b7280', fontSize: 14 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '3px solid #6366f122',
            borderTopColor: '#6366f1',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span>Fetching data…</span>
        </div>
      )}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#dc2626', fontSize: 14 }}>{error}</span>
          {retryCount < 3 ? (
            <button
              onClick={onRetry}
              style={{ fontSize: 13, color: '#6366f1', background: 'none', border: '1px solid #6366f1', borderRadius: 6, padding: '4px 14px', cursor: 'pointer' }}
            >
              Retry
            </button>
          ) : (
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Remove and re-add the country to try again</span>
          )}
        </div>
      )}
      {!loading && !error && !hasData && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280', fontSize: 14 }}>
          No data available for {countryName}
        </div>
      )}
      {!loading && !error && hasData && (
        <>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer', marginBottom: 10, userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showCA}
              onChange={e => setShowCA(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show current account balance
            {showCA && caLoading && <span style={{ color: '#9ca3af', fontSize: 12 }}>(loading…)</span>}
          </label>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 6, right: 20, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${v}%`} width={46} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} />
              <Line type="monotone" dataKey="Savings" stroke="#1abc9c" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={false} />
              <Line type="monotone" dataKey="Investment" stroke="#e74c3c" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={false} />
              {showCA && (
                <Line type="monotone" dataKey="Current account" stroke="#374151" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} connectNulls={false} />
              )}
            </LineChart>
          </ResponsiveContainer>

          {showCA ? (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
              The current account balance roughly equals the gap between savings and investment (CA ≈ S − I). Differences arise because this chart uses domestic savings rather than national savings.
            </p>
          ) : (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
              The gap between savings and investment approximates the current account balance
            </p>
          )}
        </>
      )}
    </div>
  );
}
