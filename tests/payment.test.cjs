const { test } = require("node:test");
const assert = require("node:assert/strict");
const { load } = require("./load-ts.cjs");

process.env.VIETQR_BANK_ID = "970436";
process.env.VIETQR_BANK_NAME = "Vietcombank";
process.env.VIETQR_ACCOUNT_NO = "0123456789";
process.env.VIETQR_ACCOUNT_NAME = "Tên Chủ Tài Khoản";
process.env.PAYMENT_DEMO_ENABLED = "true";

function setup({ status = "PENDING", departed = false, payment = null } = {}) {
  const rows = [1, 2].map((id) => ({ id, status, totalPrice: 200000, trip: { time: new Date(Date.now() + (departed ? -1000 : 86400000)) } }));
  let creates = 0;
  const tx = {
    booking: { findMany: async () => rows, updateMany: async ({ data }) => { rows.forEach((row) => Object.assign(row, data)); return { count: rows.length }; } },
    payment: { findFirst: async () => payment, create: async ({ data }) => { creates++; payment = data; return data; } },
  };
  const mocks = { "@/lib/prisma": { prisma: tx }, "@/lib/transaction": { runTransaction: (work) => work(tx) } };
  return { rows, mocks, service: load("services/paymentService.ts", mocks), get creates() { return creates; }, get payment() { return payment; } };
}

test("QR preserves leading account zero and embeds database total and order code", async () => {
  const s = setup();
  const info = await s.service.getVietqrPaymentInfo("TEST-PNR");
  const url = new URL(info.qrUrl);
  assert.equal(url.hostname, "img.vietqr.io");
  assert.equal(url.pathname, "/image/970436-0123456789-compact2.png");
  assert.equal(url.searchParams.get("amount"), "400000");
  assert.equal(url.searchParams.get("addInfo"), "VE1");
  assert.equal(url.searchParams.get("accountName"), "TEN CHU TAI KHOAN");
  assert.equal(s.creates, 0); // Chưa bấm nút thì chưa tạo payment.
});

test("demo confirmation records payment, confirms all seats once and retains timestamp", async () => {
  const s = setup();
  assert.equal((await s.service.confirmDemoPayment("TEST-PNR")).bookingStatus, "CONFIRMED");
  assert.equal(s.payment.amount, 400000);
  assert.equal(s.payment.responseCode, "DEMO");
  assert.match(s.payment.providerTransactionId, /^DEMO-/);
  assert.ok(s.rows.every((r) => r.status === "CONFIRMED" && r.confirmedAt instanceof Date));
  await s.service.confirmDemoPayment("TEST-PNR");
  assert.equal(s.creates, 1);
});

test("cancelled, departed, counter-confirmed and review orders cannot create a demo payment", async () => {
  for (const options of [{ status: "CANCELLED" }, { departed: true }, { status: "CONFIRMED" }, { payment: { status: "REVIEW" } }]) {
    const s = setup(options);
    await assert.rejects(s.service.confirmDemoPayment("TEST-PNR"), (error) => error.status === 409);
    assert.equal(s.creates, 0);
  }
});

test("backend rejects confirmation when demo is off even if frontend button is bypassed", async () => {
  process.env.PAYMENT_DEMO_ENABLED = "false";
  try {
    const s = setup();
    await assert.rejects(s.service.confirmDemoPayment("TEST-PNR"), (error) => error.status === 403);
    assert.equal(s.creates, 0);
  } finally { process.env.PAYMENT_DEMO_ENABLED = "true"; }
});

test("API rejects injected amount, cross-site confirmation and malformed JSON", async () => {
  const s = setup();
  const route = load("app/api/payments/demo/confirm/route.ts", s.mocks);
  const post = (body, headers = {}) => route.POST(new Request("http://localhost:3000/api/payments/demo/confirm", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers }));
  assert.equal((await post({ pnr: "TEST-PNR", amount: 1 })).status, 400);
  assert.equal((await post({ pnr: "TEST-PNR" }, { origin: "https://other.example" })).status, 403);
  assert.equal((await post("{")).status, 400);
  assert.equal(s.creates, 0);
  assert.equal((await post({ pnr: "TEST-PNR" })).status, 200);
});
