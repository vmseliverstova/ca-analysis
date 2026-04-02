import { useState, useRef, useEffect } from 'react';

export default function CountrySearch({ countries, selectedCodes, onSelect, disabled, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = query.length < 1
    ? []
    : countries
        .filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) &&
          !selectedCodes.includes(c.code)
        )
        .slice(0, 20);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(country) {
    onSelect(country);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 360 }}>
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder={placeholder || 'Search for a country…'}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.length > 0 && setOpen(true)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          background: disabled ? '#f3f4f6' : '#fff',
          color: disabled ? '#9ca3af' : '#111',
        }}
      />
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          margin: '4px 0 0',
          padding: 0,
          listStyle: 'none',
          background: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          maxHeight: 240,
          overflowY: 'auto',
          zIndex: 100,
        }}>
          {filtered.map(c => (
            <li
              key={c.code}
              onMouseDown={() => handleSelect(c)}
              style={{
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 14,
                color: '#111827',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
