import { useState } from 'react';

export default function EducationPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: '#eef4fb',
      border: '1px solid #c8ddf0',
      borderRadius: 10,
      marginBottom: 24,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: 600,
          color: '#1e3a5f',
          textAlign: 'left',
        }}
      >
        <span>What is the Current Account?</span>
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          fontSize: 18,
          lineHeight: 1,
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          padding: '4px 18px 18px',
          fontSize: 14,
          lineHeight: 1.65,
          color: '#2c3e50',
          borderTop: '1px solid #c8ddf0',
        }}>
          <p style={{ marginTop: 12 }}>
            The current account balance measures the difference between what a country earns from and
            spends on international transactions — primarily trade in goods and services, investment
            income, and transfers.
          </p>
          <ul style={{ paddingLeft: 20, margin: '10px 0' }}>
            <li style={{ marginBottom: 6 }}>
              <strong>Surplus (above zero):</strong> The country earns more from the rest of the world
              than it spends. It is a net lender/saver globally.
            </li>
            <li>
              <strong>Deficit (below zero):</strong> The country spends more internationally than it
              earns. It must attract foreign capital to finance the gap.
            </li>
          </ul>
          <p style={{ marginTop: 12, marginBottom: 6 }}>
            <strong>The CA = S − I Identity</strong>
          </p>
          <p style={{ margin: 0 }}>
            The current account balance equals national savings minus domestic investment (CA = S − I).
            A surplus means a country saves more than it invests at home — excess savings flow abroad.
            A deficit means it invests more than it saves — it borrows from the rest of the world.
          </p>
          <p style={{ marginTop: 10, marginBottom: 0 }}>
            This identity helps explain <em>why</em> countries run surpluses or deficits: high household
            savings (Netherlands, Germany), low savings and fiscal deficits (United States), or
            commodity-driven savings swings (Saudi Arabia, Russia).
          </p>
        </div>
      )}
    </div>
  );
}
