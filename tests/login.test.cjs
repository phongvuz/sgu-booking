const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { scryptSync } = require("node:crypto");
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


process.env.SESSION_SECRET = "test-secret-".repeat(4);
const password = load("lib/password.ts");
const session = load("lib/session.ts", { "@/lib/prisma": { prisma: {} } });

test("password verification rejects incorrect passwords and malformed/legacy hashes", async () => {
  const hash = await password.hashPassword("secret123");
  assert.equal(await password.verifyPassword("secret123", hash), true);
  assert.equal(await password.verifyPassword("incorrect", hash), false);
  for (const value of ["secret123", "scrypt:bad:bad", ""]) assert.equal(await password.verifyPassword("secret123", value), false);
});

test("session signatures reject tampering, expiry and invalid identifiers", () => {
  const token = session.createSessionToken(7, 1000);
  assert.equal(session.verifySessionToken(token, 1001), 7);
  assert.equal(session.verifySessionToken(token.replace(/^7/, "8"), 1001), null);
  assert.equal(session.verifySessionToken(token, 1000 + session.SESSION_AGE * 1000), null);
  assert.equal(session.verifySessionToken("bad"), null);
});

async function setup({ role = "CUSTOMER", status = "Đang hoạt động", missingCustomer = false, missingUser = false, fail = false } = {}) {
  const hash = await password.hashPassword("secret123");
  const lookups = [];
  const prisma = {
    customer: { findUnique: async ({where}) => { lookups.push(where); if (fail) throw new Error("private database error"); return missingCustomer ? null : { phone: "0901234567", status }; } },
    user: { findUnique: async ({where}) => { assert.deepEqual(where, { phone: "0901234567" }); return missingUser ? null : { id: 7, role, password: hash }; } },
  };
  const { POST } = load("app/api/auth/login/route.ts", { "@/lib/prisma": { prisma }, "@/lib/password": password, "@/lib/session": session });
  return { lookups, post: (body = { identifier: "0901234567", password: "secret123" }) => POST(new Request("http://localhost/api/auth/login", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })) };
}

test("login by phone and normalized email creates an HttpOnly session without exposing credentials", async () => {
  const { post, lookups } = await setup();
  for (const identifier of ["0901234567", " TEST@Example.com "]) {
    const response = await post({ identifier, password: "secret123", role: "ADMIN" });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
    assert.match(response.headers.get("set-cookie"), /SameSite=lax/i);
    assert.deepEqual(await response.json(), { success: true });
  }
  assert.deepEqual(lookups, [{ phone: "0901234567" }, { email: "test@example.com" }]);
});

test("rejects wrong role, inactive or missing customer/user and wrong password without setting a cookie", async () => {
  for (const options of [{role: "ADMIN"}, {role: "USER"}, {status: "Ngừng hoạt động"}, {status: ""}, {missingCustomer: true}, {missingUser: true}, {}]) {
    const { post } = await setup(options);
    const response = await post({ identifier: "0901234567", password: Object.keys(options).length ? "secret123" : "wrong" });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("rejects malformed input and hides database failures", async () => {
  const { post } = await setup();
  for (const body of ["{", {}, {identifier: 123, password: "abc"}, {identifier: "a", password: "x".repeat(129)}]) assert.equal((await post(body)).status, 400);
  const response = await (await setup({fail: true})).post();
  assert.equal(response.status, 500);
  assert.equal((await response.text()).includes("private"), false);
});

test("logout expires the session cookie", async () => {
  const { POST } = load("app/api/auth/logout/route.ts", { "@/lib/session": session });
  const response = await POST();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
});

test("session use rechecks current role and customer status", async () => {
  for (const [role, status, allowed] of [["CUSTOMER", "Đang hoạt động", true], ["ADMIN", "Đang hoạt động", false], ["CUSTOMER", "Ngừng hoạt động", false]]) {
    const current = load("lib/session.ts", {
      "next/headers": { cookies: async () => ({ get: () => ({ value: session.createSessionToken(7) }) }) },
      "@/lib/prisma": { prisma: {
        user: { findUnique: async () => ({id: 7, phone: "0901234567", role}) },
        customer: { findUnique: async () => ({id: "CUS-001", name: "Test", status}) },
      } },
    });
    assert.equal(Boolean(await current.getCurrentCustomer()), allowed);
  }
});
