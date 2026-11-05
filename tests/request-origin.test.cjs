const { test } = require("node:test");
const assert = require("node:assert/strict");
const { load } = require("./load-ts.cjs");
const { isSameOriginRequest } = load("lib/request-origin.ts");

test("same-origin checks use the real HTTP host when Next builds an internal localhost URL", () => {
  for (const host of ["127.0.0.1:3210", "localhost:3210", "booking.example.test:3210", "[::1]:3210"]) {
    assert.equal(isSameOriginRequest(new Request("http://localhost:3210/api/bookings", {
      method: "POST", headers: { host, origin: `http://${host}`, "sec-fetch-site": "same-origin" },
    })), true);
  }
  assert.equal(isSameOriginRequest(new Request("https://localhost/api/bookings", {
    method: "POST", headers: { host: "booking.example.test", origin: "https://booking.example.test" },
  })), true);
});

test("origin checks reject other hosts, ports, protocols and forged forwarded hosts", () => {
  const request = (headers) => new Request("http://localhost:3210/api/bookings", { method: "POST", headers });
  for (const origin of ["http://elsewhere.test", "http://127.0.0.1:3211", "https://127.0.0.1:3210", "null"]) {
    assert.equal(isSameOriginRequest(request({ host: "127.0.0.1:3210", origin })), false);
  }
  assert.equal(isSameOriginRequest(request({ host: "127.0.0.1:3210", origin: "http://elsewhere.test", "x-forwarded-host": "elsewhere.test" })), false);
  assert.equal(isSameOriginRequest(request({ host: "127.0.0.1:3210", origin: "http://127.0.0.1:3210", "sec-fetch-site": "cross-site" })), false);
  for (const host of ["elsewhere.test@127.0.0.1:3210", "127.0.0.1:3210/path", "127.0.0.1:3210,elsewhere.test"]) {
    assert.equal(isSameOriginRequest(request({ host, origin: "http://127.0.0.1:3210" })), false);
  }
});

test("nonbrowser clients without origin retain access while ordinary request URLs remain checked", () => {
  assert.equal(isSameOriginRequest(new Request("http://localhost/api/bookings", { method: "POST" })), true);
  assert.equal(isSameOriginRequest(new Request("http://localhost/api/bookings", { method: "POST", headers: { origin: "http://localhost" } })), true);
  assert.equal(isSameOriginRequest(new Request("http://localhost/api/bookings", { method: "POST", headers: { origin: "http://elsewhere.test" } })), false);
});
