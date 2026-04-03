export default async function handler(req, res) {
  const { wbpath, path: _path, ...queryParams } = req.query;
  const path = Array.isArray(wbpath) ? wbpath.join('/') : (wbpath || '');

  const qs = new URLSearchParams(queryParams).toString();
  const url = `https://api.worldbank.org/v2/${path}${qs ? '?' + qs : ''}`;

  const t0 = Date.now();
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; ca-analysis/1.0)',
    },
  });
  const fetchMs = Date.now() - t0;

  const t1 = Date.now();
  const text = await response.text();
  const readMs = Date.now() - t1;

  res
    .status(response.status)
    .setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('X-Timing-Fetch-Ms', fetchMs)
    .setHeader('X-Timing-Read-Ms', readMs)
    .setHeader('X-Timing-Total-Ms', fetchMs + readMs)
    .setHeader('X-Upstream-Url', url)
    .send(text);
}
