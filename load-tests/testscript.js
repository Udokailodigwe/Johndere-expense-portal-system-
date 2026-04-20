/**
 * Load test: authenticated user flow (login → current user).
 *
 * Requires k6: https://k6.io/docs/getting-started/installation/
 *
 * Hit the nginx URL (same origin as the browser), not the backend container port.
 * With docker-compose.prod.yml, nginx maps 80:80 — Docker may open the app at http://localhost
 * (e.g. login UI at /activate-account?form=login). That path is the SPA; this script loads the
 * API only: /api/v1/auth/login and /api/v1/auth/me — still under the same http://localhost origin.
 *
 * Run (PowerShell example):
 *   k6 run --env BASE_URL=http://localhost --env TEST_EMAIL=you@example.com --env TEST_PASSWORD=yourpassword load-tests/testscript.js
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    users: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 20 },
        { duration: "1m", target: 20 },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<800"],
  },
};

export function setup() {
  const baseUrl = (__ENV.BASE_URL || "http://localhost").replace(/\/$/, "");
  const email = __ENV.TEST_EMAIL;
  const password = __ENV.TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set TEST_EMAIL and TEST_PASSWORD (active user). Example: k6 run -e BASE_URL=http://localhost -e TEST_EMAIL=a@b.com -e TEST_PASSWORD=secret load-tests/testscript.js",
    );
  }
  return { baseUrl, email, password };
}

export default function (data) {
  const loginRes = http.post(
    `${data.baseUrl}/api/v1/auth/login`,
    JSON.stringify({ email: data.email, password: data.password }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "POST /auth/login" },
    },
  );

  const loggedIn = check(loginRes, {
    "login status 201": (r) => r.status === 201,
  });

  if (!loggedIn) {
    return;
  }

  // Cookie jar (per VU) sends httpOnly `token` from login
  const meRes = http.get(`${data.baseUrl}/api/v1/auth/me`, {
    headers: { Accept: "application/json" },
    tags: { name: "GET /auth/me" },
  });

  check(meRes, {
    "current user status 200": (r) => r.status === 200,
  });

  sleep(1);
}
