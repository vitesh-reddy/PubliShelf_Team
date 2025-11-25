import http from "k6/http";
import { sleep, check } from "k6";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// --------------------------------------------------------
// 🔧 Global Config Variables (Modify these as needed)
// --------------------------------------------------------
export const TEST_BASE_URL = "http://localhost:3000";
export const AUCTION_ID = "691479d8407e1fae9a8a35b6";
export const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTc4M2JmYWEyMzJlODdhNjlhNWUwZSIsInJvbGUiOiJidXllciIsImZpcnN0bmFtZSI6IlZpdGVzaCIsImxhc3RuYW1lIjoiUmVkZHkiLCJlbWFpbCI6ImJ1eTFAZ21haWwuY29tIiwiaWF0IjoxNzY0MDk1NTk2LCJleHAiOjE3NjQxODE5OTZ9.X3wQqzKO_-2Vo_MMsB-fsF_WJGgnBpBvn4kTlgNYIJA";     // <-- change this

export const NUMBER_OF_USERS = 200;       // VUs
export const TEST_DURATION = "10s";      // Duration

// --------------------------------------------------------
// 🧪 K6 Options
// --------------------------------------------------------
export const options = {
  vus: NUMBER_OF_USERS,
  duration: TEST_DURATION,
};

// --------------------------------------------------------
// 🧬 Test Execution
// --------------------------------------------------------
export default function () {
  const url = `${TEST_BASE_URL}/api/buyer/auction-item-detail/${AUCTION_ID}`;

  // Required cookie format for protected route
  const cookies = {
    token: AUTH_TOKEN,
  };

  const headers = {
    "Content-Type": "application/json",
  };

  const res = http.get(url, {
    headers,
    cookies,
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is JSON": (r) => r.headers["Content-Type"]?.includes("application/json"),
  });

  sleep(1);
}

// --------------------------------------------------------
// 📄 Write Results to File (Append Mode)
// --------------------------------------------------------
export function handleSummary(data) {
  const timestamp = new Date().toISOString();

  const metrics = data.metrics;

  const get = (key, path, fallback = 0) => {
    try {
      const segments = path.split(".");
      let value = metrics[key];

      for (let s of segments) {
        value = value[s];
      }
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };

  const fmt = (n) => Number(n).toFixed(2);
  const pct = (p) => fmt(get("http_req_duration", `values.p(${p})`, 0));

  const summary = `
============================================================
               📌 K6 Auction Endpoint Test
============================================================
🕒 Timestamp: ${timestamp}

🔧 Test Configuration
------------------------------------------------------------
Virtual Users (VUs):        ${NUMBER_OF_USERS}
Test Duration:              ${TEST_DURATION}
Endpoint Tested:            GET /auction-item-detail/${AUCTION_ID}

📊 Request Summary
------------------------------------------------------------
Total Requests:             ${get("http_reqs", "values.count")}
Requests Per Second (avg):  ${fmt(get("http_reqs", "values.rate"))}

❗ Errors
------------------------------------------------------------
Failed Requests:            ${fmt(get("http_req_failed", "values.rate") * 100)}%
HTTP Errors (non-200):      ${get("http_req_failed", "values.count")}

⏱️ Response Time (ms)
------------------------------------------------------------
Average:                    ${fmt(get("http_req_duration", "values.avg"))}
Minimum:                    ${fmt(get("http_req_duration", "values.min"))}
Maximum:                    ${fmt(get("http_req_duration", "values.max"))}

Percentiles:
  - p(50):                  ${pct("50")}  
  - p(75):                  ${pct("75")}
  - p(90):                  ${pct("90")}
  - p(95):                  ${pct("95")}  
  - p(99):                  ${pct("99")}

📦 Data Transfer
------------------------------------------------------------
Sent (bytes):               ${get("data_sent", "values.count")}
Received (bytes):           ${get("data_received", "values.count")}

============================================================
                     🔁 End of Report
============================================================
`;

  return { "auction_test_results.txt": summary };
}
