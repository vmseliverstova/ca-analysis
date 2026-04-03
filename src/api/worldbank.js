const BASE = '/api/worldbank';

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

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (attempt < retries - 1) await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

async function fetchIndicator(iso2, indicator) {
  const key = `${iso2}:${indicator}`;
  if (cache[key]) return cache[key];

  const url = `${BASE}/country/${iso2}/indicator/${indicator}?date=2000:2023&format=json&per_page=100`;
  const res = await fetchWithRetry(url);
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
