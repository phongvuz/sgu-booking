const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { Prisma } = require("@prisma/client");

function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, "..", relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = (id) => Object.hasOwn(mocks, id) ? mocks[id] : original(id);
  mod._compile(compiled, filename);
  return mod.exports;
}

const registration = load("lib/validations/register.ts");
const validation = load("lib/validations/profile.ts", { "./register": registration });
const passwords = load("lib/password.ts");
const profile = { action: "profile", fullName: " Nguyễn Văn A ", email: " TEST@example.com ", phone: "0901234567", address: "" };

async function setup({ authenticated = true, failure } = {}) {
  const writes = [];
  const hash = await passwords.hashPassword("old123");
  const prisma = {
    user: {
      findUnique: async () => ({ password: hash }),
      updateMany: async (args) => { writes.push(args); return { count: 1 }; },
    },
    $transaction: async (callback) => {
      if (failure) throw failure;
      return callback({
        user: { update: async (args) => writes.push({ user: args }) },
        customer: { update: async (args) => writes.push({ customer: args }) },
      });
    },
  };
  const { PATCH } = load("app/api/customer/profile/route.ts", {
    "@/lib/prisma": { prisma }, "@/lib/password": passwords,
    "@/lib/validations/profile": validation,
    "@/lib/session": { getCurrentCustomer: async () => authenticated ? { userId: 7, customerId: "CUS-007" } : null },
  });
  return { writes, patch: (body, origin = "http://localhost") => PATCH(new Request("http://localhost/api/customer/profile", {
    method: "PATCH", headers: { origin }, body: typeof body === "string" ? body : JSON.stringify(body),
  })) };
}

test("profile updates only the signed-in customer's records and normalizes fields", async () => {
  const { patch, writes } = await setup();
  assert.equal((await patch({ ...profile, userId: 99, customerId: "CUS-999", role: "ADMIN" })).status, 200);
  assert.deepEqual(writes, [
    { user: { where: { id: 7 }, data: { fullName: "Nguyễn Văn A", phone: profile.phone } } },
    { customer: { where: { id: "CUS-007" }, data: { name: "Nguyễn Văn A", email: "test@example.com", phone: profile.phone, address: null } } },
  ]);
});

test("rejects unauthenticated, cross-origin and invalid updates without writes", async () => {
  const guest = await setup({ authenticated: false });
  assert.equal((await guest.patch(profile)).status, 401);
  assert.equal(guest.writes.length, 0);
  const { patch, writes } = await setup();
  assert.equal((await patch(profile, "https://other.example")).status, 403);
  for (const body of ["{", null, {}, { ...profile, phone: "abc" }, { ...profile, email: "bad" }]) {
    assert.equal((await patch(body)).status, 400);
  }
  assert.equal(writes.length, 0);
});

test("duplicate contact information returns a useful conflict response", async () => {
  const { patch } = await setup({ failure: new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "6.19.3" }) });
  assert.equal((await patch(profile)).status, 409);
});

test("password change requires current password and matching valid new password", async () => {
  const { patch, writes } = await setup();
  const body = { action: "password", currentPassword: "old123", password: "new123", confirmPassword: "new123" };
  for (const invalid of [{ ...body, currentPassword: "wrong" }, { ...body, confirmPassword: "different" }, { ...body, password: "123", confirmPassword: "123" }, { ...body, password: "old123", confirmPassword: "old123" }]) {
    assert.equal((await patch(invalid)).status, 400);
  }
  assert.equal(writes.length, 0);
  const response = await patch(body);
  assert.equal(response.status, 200);
  assert.equal(writes[0].where.id, 7);
  assert.equal(await passwords.verifyPassword("new123", writes[0].data.password), true);
  assert.equal(await passwords.verifyPassword("old123", writes[0].data.password), false);
  assert.equal((await response.text()).includes("scrypt"), false);
});

const password = load("lib/password.ts");
