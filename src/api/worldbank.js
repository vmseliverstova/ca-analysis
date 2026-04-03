const BASE = '/api/worldbank';

// In-memory cache: key = `${iso2}:${indicator}` => data array
const cache = {};
// In-flight requests: key => Promise (cleared on failure so retries are possible)
const inFlight = {};

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

function fetchIndicator(iso2, indicator) {
  const key = `${iso2}:${indicator}`;
  if (cache[key]) return Promise.resolve(cache[key]);
  if (inFlight[key]) return inFlight[key];

  const url = `${BASE}/country/${iso2}/indicator/${indicator}?date=2000:2023&format=json&per_page=100`;
  const promise = fetchWithRetry(url)
    .then(res => res.json())
    .then(json => {
      const data = (json[1] || [])
        .filter(d => d.value !== null)
        .map(d => ({ year: parseInt(d.date, 10), value: d.value }))
        .sort((a, b) => a.year - b.year);
      cache[key] = data;
      delete inFlight[key];
      return data;
    })
    .catch(err => {
      delete inFlight[key]; // clear so user-triggered retries can proceed
      throw err;
    });

  inFlight[key] = promise;
  return promise;
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

const PRELOAD_CODES = ['FR', 'DE', 'US', 'BR', 'CN', 'IN', 'SA', 'JP'];
const PRELOAD_INDICATORS = [
  'BN.CAB.XOKA.GD.ZS',
  'NY.GNS.ICTR.ZS',
  'NE.GDI.TOTL.ZS',
];

async function preloadOne(iso2, indicator) {
  const key = `${iso2}:${indicator}`;
  if (cache[key] || inFlight[key]) return;
  const url = `${BASE}/country/${iso2}/indicator/${indicator}?date=2000:2023&format=json&per_page=100`;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const json = await res.json();
    cache[key] = (json[1] || [])
      .filter(d => d.value !== null)
      .map(d => ({ year: parseInt(d.date, 10), value: d.value }))
      .sort((a, b) => a.year - b.year);
  } catch {}
}

export async function preloadCountries() {
  // Wait for default countries to load first
  await new Promise(r => setTimeout(r, 2000));
  for (const iso2 of PRELOAD_CODES) {
    for (const indicator of PRELOAD_INDICATORS) {
      await preloadOne(iso2, indicator);
      await new Promise(r => setTimeout(r, 150));
    }
  }
}
