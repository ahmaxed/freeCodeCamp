// Bridges [::1]:3000 -> 127.0.0.1:3000 so `localhost:3000` resolves for
// Playwright's Node request context, which prefers IPv6. The API binds
// 0.0.0.0 (IPv4 only), while Gatsby dev binds ::1 (IPv6 only).
const net = require('net');

const server = net.createServer(client => {
  const upstream = net.connect(3000, '127.0.0.1');
  client.pipe(upstream);
  upstream.pipe(client);
  client.on('error', () => upstream.destroy());
  upstream.on('error', () => client.destroy());
});

server.listen(3000, '::1', () => {
  console.log('ipv6 proxy listening on [::1]:3000 -> 127.0.0.1:3000');
});
