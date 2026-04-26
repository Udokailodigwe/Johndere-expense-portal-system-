/**
 * k6 load test: login as employee → POST /api/v1/expenses (create expense).
 *
 * Requires an active user with role employee (or any user allowed to create expenses).
 *
 * Run:
 *   k6 run -e BASE_URL=http://localhost -e TEST_EMAIL=employee@example.com -e TEST_PASSWORD=secret load-tests/testscript-expense-create.js
 *
 * Optional overrides (defaults to TEST_*):
 *   -e EMPLOYEE_EMAIL=... -e EMPLOYEE_PASSWORD=...
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    expense_create: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 10 },
        { duration: "40s", target: 10 },
        { duration: "20s", target: 0 },
      ],
      gracefulRampDown: "20s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(95)<2000"],
  },
};

function baseUrl() {
  return (__ENV.BASE_URL || "http://localhost").replace(/\/$/, "");
}

function employeeCreds() {
  const email = __ENV.EMPLOYEE_EMAIL || __ENV.TEST_EMAIL;
  const password = __ENV.EMPLOYEE_PASSWORD || __ENV.TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set TEST_EMAIL and TEST_PASSWORD (employee), or EMPLOYEE_EMAIL / EMPLOYEE_PASSWORD.",
    );
  }
  return { email, password };
}

function tokenFromLogin(loginRes) {
  const cookies = loginRes.cookies["token"];
  if (!cookies || cookies.length === 0) {
    return null;
  }
  return cookies[0].value;
}

let token;

export default function () {
  const base = baseUrl();
  const { email, password } = employeeCreds();

  if (!token) {
    const loginRes = http.post(
      `${base}/api/v1/auth/login`,
      JSON.stringify({ email, password }),
      {
        headers: { "Content-Type": "application/json" },
        tags: { name: "login" },
      },
    );
    const ok = check(loginRes, { "login 200": (r) => r.status === 200 });
    if (!ok) {
      return;
    }
    token = tokenFromLogin(loginRes);
    if (!token) {
      throw new Error("Token cookie not found after login");
    }
  }

  const body = JSON.stringify({
    amount: 10 + (__ITER % 50) + __VU * 0.01,
    description: `k6 load vu${__VU} iter${__ITER} ${Date.now()}`,
    category: "other",
  });

  const createRes = http.post(`${base}/api/v1/expenses`, body, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
    tags: { name: "POST /expenses" },
  });

  check(createRes, {
    "create expense 201": (r) => r.status === 201,
  });

  sleep(0.5);
}
