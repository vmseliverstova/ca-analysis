import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { CRISIS_EVENTS } from '../data/crisisEvents';
import { track } from '../analytics';

export const COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5',
  '#059669', '#b45309', '#9333ea', '#0284c7', '#be123c',
];

const ALL_YEARS = Array.from({ length: 24 }, (_, i) => 2000 + i);

function buildChartData(caData) {
  // caData: { [code]: { name, color, data: [{year, value}] } }
  return ALL_YEARS.map(year => {
    const point = { year };
    Object.entries(caData).forEach(([code, { data }]) => {
      const found = data.find(d => d.year === year);
      point[code] = found ? parseFloat(found.value.toFixed(2)) : null;
    });
    return point;
  });
}

function CrisisTooltip({ event, onClose }) {
  if (!event) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#fff',
      border: `2px solid ${event.stroke}`,
      borderRadius: 10,
      padding: '12px 16px',
      maxWidth: 300,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 200,
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <strong style={{ color: '#1e293b', fontSize: 14 }}>{event.title}</strong>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', lineHeight: 1 }}>×</button>
      </div>
      <p style={{ margin: 0, color: '#374151', lineHeight: 1.5 }}>{event.description}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label, caData }) {
  if (!active || !payload || !payload.length) return null;
  const sorted = [...payload]
    .filter(p => p.value !== null && p.value !== undefined)
    .sort((a, b) => b.value - a.value);
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#111' }}>{label}</div>
      {sorted.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 12, height: 3, background: p.color, display: 'inline-block', borderRadius: 2 }} />
          <span style={{ color: '#374151' }}>{caData[p.dataKey]?.name}:</span>
          <span style={{ fontWeight: 600, color: p.value >= 0 ? '#16a34a' : '#dc2626' }}>
            {p.value > 0 ? '+' : ''}{p.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CAChart({ caData }) {
  const [showCrisis, setShowCrisis] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);

  const chartData = buildChartData(caData);
  const countries = Object.entries(caData);

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 16px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b5563', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showCrisis}
            onChange={e => {
              setShowCrisis(e.target.checked);
              track('crisis_toggled', { enabled: e.target.checked });
            }}
            style={{ accentColor: '#2563eb' }}
          />
          Show crisis periods
        </label>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={v => `${v}%`}
            width={50}
          />
          <Tooltip content={<CustomTooltip caData={caData} />} />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
            formatter={(value) => caData[value]?.name || value}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />

          {showCrisis && CRISIS_EVENTS.map(ev => (
            <ReferenceArea
              key={ev.id}
              x1={ev.x1}
              x2={ev.x2}
              fill={ev.fill}
              stroke="none"
              onClick={() => {
                setActiveEvent(ev);
                track('crisis_clicked', { crisis_id: ev.id, crisis_title: ev.title });
              }}
              style={{ cursor: 'pointer' }}
              label={{ value: ev.label, position: 'insideTopLeft', fontSize: 10, fill: '#6b7280', dy: 2 }}
            />
          ))}

          {countries.map(([code, { color }]) => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {activeEvent && (
        <CrisisTooltip event={activeEvent} onClose={() => setActiveEvent(null)} />
      )}
    </div>
  );
}
