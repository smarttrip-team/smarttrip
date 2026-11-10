import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Custom metrics to track success vs rejected booking requests
export const successBookings = new Counter('successful_bookings');
export const rejectedBookings = new Counter('rejected_bookings');
export const successRate = new Rate('success_rate');

export const options = {
  scenarios: {
    concurrency_battle: {
      executor: 'per-vu-iterations',
      vus: 50,           // 50 concurrent users fighting for seats
      iterations: 1,     // 1 booking request per user at the exact same millisecond
      maxDuration: '30s',
    },
  },
  thresholds: {
    // Exactly 5 bookings must succeed (since only 5 seats exist)
    successful_bookings: ['count == 5'],
    // Exactly 45 bookings must be rejected safely
    rejected_bookings: ['count == 45'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8089';
const TOUR_ID = __ENV.TOUR_ID || 1;
const DEPARTURE_ID = __ENV.DEPARTURE_ID || 201;

export default function () {
  const vuId = __VU;
  const idempotencyKey = `concurrency-vu-${vuId}-${Date.now()}`;

  const payload = JSON.stringify({
    customerId: 9,
    tourId: Number(TOUR_ID),
    departureId: Number(DEPARTURE_ID),
    tourName: 'Khám Phá Di Sản Đà Nẵng - Bà Nà Hills - Phố Cổ Hội An',
    departureDate: '2026-12-25',
    unitPrice: 3500000,
    quantity: 1,
    idempotencyKey: idempotencyKey,
    passengers: [
      {
        fullName: `Khách hàng Contender #${vuId}`,
        phone: `09090000${vuId.toString().padStart(2, '0')}`,
        dateOfBirth: '1995-05-15',
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': '9',
    },
    timeout: '15s',
  };

  const res = http.post(`${BASE_URL}/api/v1/bookings`, payload, params);

  const isAccepted = res.status === 200 || res.status === 201 || res.status === 202;

  if (isAccepted) {
    successBookings.add(1);
    successRate.add(1);
  } else {
    rejectedBookings.add(1);
    successRate.add(0);
  }

  check(res, {
    'request executed': (r) => r.status > 0,
    'handled gracefully without 500 error': (r) => r.status !== 500,
  });
}
