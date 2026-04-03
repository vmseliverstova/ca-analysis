import { useState, useEffect } from 'react';
import { fetchCountries, fetchCA, fetchSavings, fetchInvestment, preloadCountries } from './api/worldbank';
import { COLORS } from './components/CAChart';
import { track } from './analytics';
import EducationPanel from './components/EducationPanel';
import CountrySearch from './components/CountrySearch';
import CAChart from './components/CAChart';
import SIChart from './components/SIChart';

const DEFAULT_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'RU', name: 'Russian Federation' },
  { code: 'SA', name: 'Saudi Arabia' },
];

function Spinner({ size = 28, color = '#6366f1' }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: `3px solid ${color}22`,
      borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function CountryTag({ name, color, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: color + '18',
      border: `1px solid ${color}55`,
      color: '#1e293b',
      borderRadius: 20,
      padding: '3px 10px 3px 8px',
      fontSize: 13,
      fontWeight: 500,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {name}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 15, lineHeight: 1, color: '#6b7280', display: 'flex', alignItems: 'center' }}
      >×</button>
    </span>
  );
}

export default function App() {
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  // CA chart state: { [code]: { name, color, data, loading, error } }
  const [caData, setCAData] = useState({});
  const [caOrder, setCAOrder] = useState([]);

  // S/I chart state: [{ code, name, savings, investment, loading, error }]
  const [siCards, setSiCards] = useState([]);

  // Preload data for common countries in the background
  useEffect(() => { preloadCountries(); }, []);

  // Load country list
  useEffect(() => {
    fetchCountries()
      .then(list => setCountries(list))
      .catch(() => setCountries([]))
      .finally(() => setCountriesLoading(false));
  }, []);

  // Load default countries on mount
  useEffect(() => {
    DEFAULT_COUNTRIES.forEach((c, i) => {
      loadCA(c.code, c.name, COLORS[i]);
    });
  }, []);

  async function loadCA(code, name, color) {
    setCAData(prev => ({
      ...prev,
      [code]: { name, color, data: [], loading: true, error: null },
    }));
    setCAOrder(prev => prev.includes(code) ? prev : [...prev, code]);
    try {
      const data = await fetchCA(code);
      setCAData(prev => ({
        ...prev,
        [code]: { ...prev[code], data, loading: false },
      }));
    } catch {
      setCAData(prev => ({
        ...prev,
        [code]: { ...prev[code], loading: false, error: `Failed to load data for ${name}` },
      }));
    }
  }

  function addCACountry(country) {
    if (caData[country.code] || Object.keys(caData).length >= 15) return;
    const colorIndex = caOrder.length % COLORS.length;
    track('ca_country_added', { country_code: country.code, country_name: country.name });
    loadCA(country.code, country.name, COLORS[colorIndex]);
  }

  function removeCACountry(code) {
    track('ca_country_removed', { country_code: code, country_name: caData[code]?.name });
    setCAData(prev => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
    setCAOrder(prev => prev.filter(c => c !== code));
  }

  async function addSICountry(country) {
    if (siCards.find(c => c.code === country.code)) return;
    track('si_country_added', { country_code: country.code, country_name: country.name });
    const card = { code: country.code, name: country.name, savings: [], investment: [], loading: true, error: null, retryCount: 0 };
    setSiCards(prev => [...prev, card]);
    try {
      const [savings, investment] = await Promise.all([
        fetchSavings(country.code),
        fetchInvestment(country.code),
      ]);
      setSiCards(prev => prev.map(c =>
        c.code === country.code ? { ...c, savings, investment, loading: false } : c
      ));
    } catch {
      setSiCards(prev => prev.map(c =>
        c.code === country.code
          ? { ...c, loading: false, error: `Failed to load data for ${country.name}` }
          : c
      ));
    }
  }

  function removeSICard(code) {
    const card = siCards.find(c => c.code === code);
    track('si_country_removed', { country_code: code, country_name: card?.name });
    setSiCards(prev => prev.filter(c => c.code !== code));
  }

  async function retrySICountry(code) {
    const card = siCards.find(c => c.code === code);
    if (!card) return;
    setSiCards(prev => prev.map(c =>
      c.code === code ? { ...c, loading: true, error: null, retryCount: c.retryCount + 1 } : c
    ));
    try {
      const [savings, investment] = await Promise.all([
        fetchSavings(code, 1),
        fetchInvestment(code, 1),
      ]);
      setSiCards(prev => prev.map(c =>
        c.code === code ? { ...c, savings, investment, loading: false } : c
      ));
    } catch {
      setSiCards(prev => prev.map(c =>
        c.code === code ? { ...c, loading: false, error: `Failed to load data for ${card.name}` } : c
      ));
    }
  }

  const caLoaded = Object.fromEntries(
    Object.entries(caData).filter(([, v]) => !v.loading && !v.error && v.data.length > 0)
  );

  const caSelectedCodes = Object.keys(caData);
  const siSelectedCodes = siCards.map(c => c.code);
  const loadingCACodes = Object.entries(caData).filter(([, v]) => v.loading).map(([k]) => k);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '32px 16px 64px',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
            Current Account Balance Explorer
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>
            World Bank Data · 2000–2023
          </p>
        </div>

        {/* Educational Panel */}
        <EducationPanel />

        {/* CA Chart Section */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
            Current Account Balance (% of GDP)
          </h2>

          {/* Country tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {Object.entries(caData).map(([code, { name, color }]) => (
              <CountryTag key={code} name={name} color={color} onRemove={() => removeCACountry(code)} />
            ))}
          </div>

          {/* Loading/error messages */}
          {loadingCACodes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 10px' }}>
              <Spinner size={20} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Fetching {loadingCACodes.map(code => caData[code]?.name).join(', ')}…
              </span>
            </div>
          )}
          {Object.entries(caData)
            .filter(([, v]) => v.error)
            .map(([code, { name, color, error }]) => (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px' }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                <button
                  onClick={() => loadCA(code, name, color)}
                  style={{ fontSize: 12, color: '#6366f1', background: 'none', border: '1px solid #6366f1', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            ))}

          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <CountrySearch
              countries={countriesLoading ? [] : countries}
              selectedCodes={caSelectedCodes}
              onSelect={addCACountry}
              disabled={Object.keys(caData).length >= 15 || countriesLoading}
              placeholder={
                countriesLoading
                  ? 'Loading countries…'
                  : Object.keys(caData).length >= 15
                    ? 'Maximum 15 countries reached'
                    : 'Add a country…'
              }
            />
          </div>

          {/* Chart */}
          {Object.keys(caLoaded).length > 0
            ? <CAChart caData={caLoaded} />
            : (
              <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                {Object.keys(caData).length === 0
                  ? 'Add countries to see the chart'
                  : <><Spinner size={36} /><span>Loading data…</span></>
                }
              </div>
            )
          }
        </div>

        {/* S/I Section */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
            Savings vs Investment Breakdown
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280' }}>
            Add countries to see their savings and investment dynamics
          </p>

          <div style={{ marginBottom: 20 }}>
            <CountrySearch
              countries={countriesLoading ? [] : countries}
              selectedCodes={siSelectedCodes}
              onSelect={addSICountry}
              disabled={countriesLoading}
              placeholder={countriesLoading ? 'Loading countries…' : 'Add a country…'}
            />
          </div>

          {siCards.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              Search and add a country above to see its savings vs investment chart
            </div>
          )}

          {siCards.map(card => (
            <SIChart
              key={card.code}
              countryName={card.name}
              savings={card.savings}
              investment={card.investment}
              loading={card.loading}
              error={card.error}
              onRemove={() => removeSICard(card.code)}
              onRetry={() => retrySICountry(card.code)}
              retryCount={card.retryCount}
            />
          ))}
        </div>

        {/* Footer */}
        <p style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
          Source: World Bank, World Development Indicators
        </p>
      </div>
    </div>
  );
}
