export default async function handler(req, res) {
  const { path: pathSegments, ...queryParams } = req.query;
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : (pathSegments || '');

  const qs = new URLSearchParams(queryParams).toString();
  const url = `https://api.worldbank.org/v2/${path}${qs ? '?' + qs : ''}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; ca-analysis/1.0)',
    },
  });

  const text = await response.text();
  res
    .status(response.status)
    .setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    .setHeader('Access-Control-Allow-Origin', '*')
    .send(text);
}
