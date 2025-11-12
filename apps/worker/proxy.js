const http = require('http');

const proxy = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: 8787,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    res.writeHead(500);
    res.end();
  });
});

proxy.listen(8788, '0.0.0.0', () => {
  console.log('Proxy running on http://0.0.0.0:8788 -> http://localhost:8787');
});
