const http = require('http');

let availableSeats = 5;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/v1/bookings') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      // Pessimistic Lock simulation at DB level:
      if (availableSeats >= 1) {
        availableSeats -= 1;
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'CONFIRMED', bookingCode: `BK-${Date.now()}`, seatsLeft: availableSeats }));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'REJECTED', error: 'Not enough available seats', seatsLeft: 0 }));
      }
    });
  } else if (req.url === '/reset') {
    availableSeats = 5;
    res.writeHead(200);
    res.end('Reset to 5 seats');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 8089;
server.listen(PORT, () => {
  console.log(`SmartTrip Concurrency Benchmark Server running on http://localhost:${PORT}`);
});
