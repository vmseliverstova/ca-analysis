const BASE = 'https://api.worldbank.org/v2';

// In-memory cache: key = `${iso2}:${indicator}` => data array
const cache = {};

export async function fetchCountries() {
  const res = await fetch(`${BASE}/country?format=json&per_page=300&type=1`);
  if (!res.ok) throw new Error('Failed to fetch country list');
  const json = await res.json();
  // json[1] is the array of countries
  return (json[1] || [])
    .filter(c => c.iso2Code && c.name)
    .map(c => ({ code: c.iso2Code, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchIndicator(iso2, indicator) {
  const key = `${iso2}:${indicator}`;
  if (cache[key]) return cache[key];

  const url = `${BASE}/country/${iso2}/indicator/${indicator}?date=2000:2023&format=json&per_page=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${indicator} for ${iso2}`);
  const json = await res.json();

  const raw = json[1] || [];
  const data = raw
    .filter(d => d.value !== null)
    .map(d => ({ year: parseInt(d.date, 10), value: d.value }))
    .sort((a, b) => a.year - b.year);

  cache[key] = data;
  return data;
}

export async function fetchCA(iso2) {
  return fetchIndicator(iso2, 'BN.CAB.XOKA.GD.ZS');
}

export async function fetchSavings(iso2) {
  return fetchIndicator(iso2, 'NY.GNS.ICTR.ZS');
}

export async function fetchInvestment(iso2) {
  return fetchIndicator(iso2, 'NE.GDI.TOTL.ZS');
}
