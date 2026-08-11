// Minimal static server for the Gatsby production build.
// Binds 127.0.0.1 only, so it cannot collide with the user's own dev server
// which holds [::1]:8000.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT =
  '/Users/home/Desktop/freeCodeCamp/.claude/worktrees/paypal-react19-red-run/client/public';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8'
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  // Block traversal outside ROOT.
  const target = path.normalize(path.join(ROOT, clean));
  if (!target.startsWith(ROOT)) return null;
  try {
    const st = fs.statSync(target);
    if (st.isDirectory()) {
      const idx = path.join(target, 'index.html');
      return fs.existsSync(idx) ? idx : null;
    }
    return target;
  } catch {
    return null;
  }
}

http
  .createServer((req, res) => {
    let file = resolve(req.url);
    if (!file) {
      // Gatsby client-only routes fall back to the 404 page, as serve.json does.
      const fallback = path.join(ROOT, '404.html');
      if (fs.existsSync(fallback)) {
        res.writeHead(404, { 'content-type': TYPES['.html'] });
        return fs.createReadStream(fallback).pipe(res);
      }
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] || 'application/octet-stream'
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(8000, '127.0.0.1', () => {
    console.log('static server on http://127.0.0.1:8000 serving ' + ROOT);
  });
