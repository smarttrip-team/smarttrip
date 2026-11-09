import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Custom metrics to track success vs rejected booking requests
export const successBookings = new Counter('successful_bookings');
export const rejectedBookings = new Counter('rejected_bookings');
export const successRate = new Rate('success_rate');

export const options = {
  scenarios: {
    concurrency_battle: {
      executor: 'per-vu-iterations',
      vus: 20,           // 20 concurrent users
      iterations: 1,     // 1 request per user simultaneously
      maxDuration: '30s',
    },
  },
  thresholds: {
    // Exactly 1 booking must succeed
    successful_bookings: ['count == 1'],
    // Exactly 19 bookings must be rejected
    rejected_bookings: ['count == 19'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const DEPARTURE_ID = __ENV.DEPARTURE_ID || 201;

export default function () {
  const vuId = __VU;
  const idempotencyKey = `concurrency-vu-${vuId}-${Date.now()}`;

  const payload = JSON.stringify({
    customerId: 10 + vuId,
    tourDepartureId: Number(DEPARTURE_ID),
    quantity: 1,
    unitPrice: 3500000,
    contactName: `Contender #${vuId}`,
    contactPhone: `09090000${vuId.toString().padStart(2, '0')}`,
    contactEmail: `contender${vuId}@smarttrip.com`,
    idempotencyKey: idempotencyKey,
    passengers: [
      {
        fullName: `Contender Passenger ${vuId}`,
        phone: `09090000${vuId.toString().padStart(2, '0')}`,
        dateOfBirth: '1995-05-15',
        passengerType: 'ADULT',
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': String(10 + vuId),
    },
    timeout: '10s',
  };

  const res = http.post(`${BASE_URL}/api/v1/bookings`, payload, params);

  const isAccepted = res.status === 200 || res.status === 202;
  const isRejected = res.status === 400 || res.status === 409 || res.status === 422 || (res.status >= 400 && res.status < 500);

  if (isAccepted) {
    successBookings.add(1);
    successRate.add(1);
  } else if (isRejected) {
    rejectedBookings.add(1);
    successRate.add(0);
  } else {
    // If backend returns other code or fails
    rejectedBookings.add(1);
    successRate.add(0);
  }

  check(res, {
    'request executed': (r) => r.status > 0,
  });
}
