/**
 * k6 load test: login as manager → GET pending expenses → PUT approve one expense.
 *
 * The approval route uses the expense id: PUT /api/v1/approvals/:expenseId
 * Body: { "status": "approved" } (or "rejected" with rejectReason).
 *
 * Seed pending expenses first (e.g. run testscript-expense-create.js or the app UI).
 *
 * Run:
 *   k6 run -e BASE_URL=http://localhost -e MANAGER_EMAIL=manager@example.com -e MANAGER_PASSWORD=secret load-tests/testscript-expense-approve.js
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    expense_approve: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 5 },
        { duration: "40s", target: 5 },
        { duration: "20s", target: 0 },
      ],
      gracefulRampDown: "20s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.15"],
    http_req_duration: ["p(95)<2000"],
  },
};

function baseUrl() {
  return (__ENV.BASE_URL || "http://localhost").replace(/\/$/, "");
}

function managerCreds() {
  const email = __ENV.MANAGER_EMAIL || __ENV.TEST_EMAIL;
  const password = __ENV.MANAGER_PASSWORD || __ENV.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error("Provide manager credentials.");
  }

  return { email, password };
}

function tokenFromLogin(loginRes) {
  const cookies = loginRes.cookies["token"];
  if (!cookies || cookies.length === 0) return null;
  return cookies[0].value;
}

let token;

export default function () {
  const base = baseUrl();
  const { email, password } = managerCreds();

  // 🔐 Login once per VU
  if (!token) {
    const loginRes = http.post(
      `${base}/api/v1/auth/login`,
      JSON.stringify({ email, password }),
      {
        headers: { "Content-Type": "application/json" },
        tags: { name: "login" },
      },
    );

    const ok = check(loginRes, {
      "login 200": (r) => r.status === 200,
    });

    if (!ok) return;

    token = tokenFromLogin(loginRes);
    if (!token) {
      throw new Error("Token cookie not found after login");
    }
  }

  const cookie = { Cookie: `token=${token}` };

  // 📥 Fetch pending expenses
  const listRes = http.get(
    `${base}/api/v1/expenses/all?status=pending&limit=50`,
    {
      headers: { Accept: "application/json", ...cookie },
      tags: { name: "GET /expenses/all" },
    },
  );

  const listOk = check(listRes, {
    "list pending 200": (r) => r.status === 200,
  });

  if (!listOk) return;

  let expenses = [];
  try {
    expenses = JSON.parse(listRes.body).expenses || [];
  } catch {
    return;
  }

  //  No data → skip iteration
  if (expenses.length === 0) {
    check(null, { "has pending expense": () => false });
    sleep(1);
    return;
  }

  //  Spread load across different expenses (KEY FIX)
  const index = (__VU + __ITER) % expenses.length;
  const expense = expenses[index];

  const expenseId = expense._id || expense.id;
  if (!expenseId) return;

  // Approve
  const approveRes = http.put(
    `${base}/api/v1/approvals/${expenseId}`,
    JSON.stringify({ status: "approved" }),
    {
      headers: {
        "Content-Type": "application/json",
        ...cookie,
      },
      tags: { name: "PUT /approvals/:id" },
    },
  );

  const approved =
    approveRes.status === 200 ||
    (approveRes.status === 400 &&
      String(approveRes.body).includes("Cannot change status"));

  check(approveRes, {
    "approve success or race": () => approved,
  });

  sleep(0.5);
}
