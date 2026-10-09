const { test } = require("node:test");
const assert = require("node:assert/strict");
const { load } = require("./load-ts.cjs");

test("management guard allows visitors in review mode", async () => {
  const databaseAdmin = { id: 7, fullName: "Admin", phone: "0900000000", role: "ADMIN", isActive: true };
  const helpers = load("lib/admin-api.ts", {
    "@/lib/session": { getCurrentAdmin: async () => null },
    "@/lib/prisma": { prisma: { user: { findFirst: async () => databaseAdmin } } },
  });
  const reviewer = await helpers.requireAdmin(new Request("http://localhost/api/admin/stats"));
  const mutationActor = await helpers.requireAdmin(new Request("http://localhost/api/users", { method: "POST" }));
  assert.equal(reviewer.id, 0);
  assert.equal(mutationActor.id, databaseAdmin.id);
});

test("management guard rejects mutations from another origin and malformed JSON", async () => {
  const helpers = load("lib/admin-api.ts", { "@/lib/session": { getCurrentAdmin: async () => ({ id: 1 }) } });
  await assert.rejects(helpers.requireAdmin(new Request("http://localhost/api/users", { method: "POST", headers: { origin: "https://elsewhere.test" } })), { status: 403 });
  await assert.rejects(helpers.readJson(new Request("http://localhost", { method: "POST", body: "{" })), { status: 400 });
  const response = helpers.apiError({ code: "P2002" }, "Error");
  assert.equal(response.status, 409);
});

test("validates integer capacity, distinct locations, real dates and employee identity", () => {
  const { tripSchema } = load("lib/validations/trip.ts");
  const trip = { from: "Sài Gòn", to: "Đà Lạt", time: "2026-12-02T08:00", price: 300000, capacity: 22 };
  assert.equal(tripSchema.safeParse(trip).success, true);
  for (const data of [{ capacity: 22.5 }, { to: " SÀI GÒN " }, { time: "bad" }, { time: "2026-02-30T08:00" }, { capacity: 0 }]) assert.equal(tripSchema.safeParse({ ...trip, ...data }).success, false);
  const { employeeSchema } = load("lib/validations/employee.ts");
  const employee = { name: "Nhân viên", email: "staff@example.test", phone: "0901234567", role: "Tài xế", department: "Đội xe", status: "Đang làm việc", startDate: "2026-10-01" };
  assert.equal(employeeSchema.safeParse(employee).success, true);
  for (const data of [{ startDate: "2026-02-30" }, { identityCard: "1234567890" }]) assert.equal(employeeSchema.safeParse({ ...employee, ...data }).success, false);
  const { busSchema } = load("lib/validations/bus.ts");
  const bus = { plate: "51B-123.45", type: "Giường nằm", seats: 22, status: "Đang hoạt động", year: "" };
  assert.equal(busSchema.parse(bus).year, null);
  assert.equal(busSchema.safeParse({ ...bus, seats: 22.5 }).success, false);
});

test("seat map has exactly database capacity and treats legacy aliases as one seat", () => {
  const { normalizeSeat, getSeatCodes } = load("lib/seats.ts");
  const { default: generateSeats } = load("components/trips/seatUtils.ts");
  for (const value of ["a1", " A01 ", "1A1", "2A01"]) assert.equal(normalizeSeat(value), "A01");
  assert.equal(getSeatCodes(22).length, 22);
  assert.ok(!getSeatCodes(22).includes("C08"));
  const seats = generateSeats(["a1"], 22);
  assert.equal(seats.length, 22);
  assert.equal(seats.filter((seat) => seat.isBooked).length, 1);
});

test("serializable transactions retry conflicts only and stop after three attempts", async () => {
  let attempts = 0;
  const prisma = { $transaction: async (work, options) => {
    assert.equal(options.isolationLevel, "Serializable");
    attempts++;
    if (attempts < 3) throw { code: "P2034" };
    return work({ value: 7 });
  } };
  const { runTransaction } = load("lib/transaction.ts", { "@/lib/prisma": { prisma } });
  assert.equal(await runTransaction(async (tx) => tx.value), 7);
  assert.equal(attempts, 3);
  attempts = 0;
  prisma.$transaction = async () => { attempts++; throw { code: "P2034" }; };
  await assert.rejects(runTransaction(async () => 0), { code: "P2034" });
  assert.equal(attempts, 3);
  attempts = 0;
  prisma.$transaction = async () => { attempts++; throw new Error("Disconnected"); };
  await assert.rejects(runTransaction(async () => 0), /Disconnected/);
  assert.equal(attempts, 1);
});

test("locked accounts cannot use an existing signed session", async () => {
  process.env.SESSION_SECRET = "test-secret-".repeat(4);
  const { createSessionToken } = load("lib/session.ts", { "@/lib/prisma": { prisma: {} } });
  const session = load("lib/session.ts", {
    "next/headers": { cookies: async () => ({ get: () => ({ value: createSessionToken(7) }) }) },
    "@/lib/prisma": { prisma: { user: { findUnique: async () => ({ id: 7, role: "ADMIN", isActive: false }) } } },
  });
  assert.equal(await session.getCurrentAdmin(), null);
});

test("Vietnam date-time input round trips without a seven-hour shift", () => {
  const { formatVietnamDateTime, parseVietnamDateTime, getVietnamMonthStart } = load("lib/trip-search.ts");
  const instant = new Date("2026-10-02T01:30:00Z");
  assert.equal(formatVietnamDateTime(instant), "2026-10-02T08:30");
  assert.equal(parseVietnamDateTime(formatVietnamDateTime(instant)).toISOString(), instant.toISOString());
  assert.equal(getVietnamMonthStart(instant).toISOString(), "2026-09-30T17:00:00.000Z");
});
