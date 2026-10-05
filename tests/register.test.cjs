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

const validation = load("lib/validations/register.ts");
const password = load("lib/password.ts");
const customerId = load("lib/customer-id.ts");
const valid = {
  fullName: " Nguyễn Văn A ", email: " Test@Example.com ", phone: "0901234567",
  address: " 123 đường A ", password: "secret123", confirmPassword: "secret123", agreeTerms: true,
};

function setup({ duplicate = false, duplicateCustomer = false, maxId = null, conflicts = 0, failure } = {}) {
  const writes = [];
  const prisma = {
    user: { findUnique: async () => duplicate ? { id: 1 } : null },
    customer: { findFirst: async () => duplicateCustomer ? { id: "customer-id" } : null },
    $transaction: async (callback, options) => {
      assert.equal(options.isolationLevel, "Serializable");
      if (conflicts-- > 0) throw new Prisma.PrismaClientKnownRequestError("conflict", { code: "P2034", clientVersion: "6.19.3" });
      return callback({
      $queryRaw: async () => [{ maxId }],
      user: { create: async ({ data }) => { writes.push(["user", data]); return { id: 1 }; } },
      customer: { create: async ({ data }) => {
        if (failure) throw failure;
        writes.push(["customer", data]); return { id: "customer-id" };
      } },
    });
    },
  };
  const { POST } = load("app/api/auth/register/route.ts", {
    "@/lib/prisma": { prisma }, "@/lib/password": password,
    "@/lib/validations/register": validation, "@/lib/customer-id": customerId,
  });
  return { writes, post: (data) => POST(new Request("http://localhost/api/auth/register", {
    method: "POST", body: typeof data === "string" ? data : JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })) };
}

test("validates required fields, lengths, confirmation and terms", () => {
  for (const patch of [{ fullName: " " }, { email: "bad" }, { phone: "123" },
    { address: "a".repeat(192) }, { password: "short" },
    { confirmPassword: "different" }, { agreeTerms: false }]) {
    assert.equal(validation.registerSchema.safeParse({ ...valid, ...patch }).success, false);
  }
});

test("creates both records with normalized fields and server-controlled role", async () => {
  const { post, writes } = setup();
  const response = await post({ ...valid, role: "ADMIN", status: "inactive", address: " " });
  assert.equal(response.status, 201);
  assert.deepEqual(writes.map(([table]) => table), ["user", "customer"]);
  assert.equal(writes[0][1].role, "CUSTOMER");
  assert.equal(writes[0][1].fullName, "Nguyễn Văn A");
  assert.equal(writes[1][1].id, "CUS-001");
  assert.equal(writes[1][1].email, "test@example.com");
  assert.equal(writes[1][1].address, null);
  assert.equal(writes[1][1].status, undefined);
  const [algorithm, salt, hash] = writes[0][1].password.split(":");
  assert.equal(algorithm, "scrypt");
  assert.equal(scryptSync(valid.password, salt, 64).toString("hex"), hash);
  assert.ok(writes[0][1].password.length <= 191);
  assert.equal(JSON.stringify(await response.json()).includes(hash), false);
});

test("rejects malformed JSON and invalid input before writing", async () => {
  const { post, writes } = setup();
  assert.equal((await post("{")).status, 400);
  assert.equal((await post({ ...valid, email: "" })).status, 400);
  assert.equal(writes.length, 0);
});

test("rejects an existing account before writing", async () => {
  const { post, writes } = setup({ duplicate: true });
  assert.equal((await post(valid)).status, 409);
  assert.equal(writes.length, 0);
});

test("rejects an existing customer email or phone before writing", async () => {
  const { post, writes } = setup({ duplicateCustomer: true });
  assert.equal((await post(valid)).status, 409);
  assert.equal(writes.length, 0);
});

test("accepts registration without an optional address", async () => {
  const { post, writes } = setup();
  const { address, ...withoutAddress } = valid;
  assert.equal((await post(withoutAddress)).status, 201);
  assert.equal(writes[1][1].address, null);
});

test("uses a fresh salt for every password hash", async () => {
  const first = await password.hashPassword(valid.password);
  const second = await password.hashPassword(valid.password);
  assert.notEqual(first, second);
});

test("handles database uniqueness races without reporting success", async () => {
  const failure = new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "6.19.3" });
  assert.equal((await setup({ failure }).post(valid)).status, 409);
});

test("does not expose database errors or report success when a write fails", async () => {
  const response = await setup({ failure: new Error("private database details") }).post(valid);
  assert.equal(response.status, 500);
  assert.equal((await response.text()).includes("private database details"), false);
});

for (const [maxId, expected] of [["3", "CUS-004"], ["9", "CUS-010"], ["999", "CUS-1000"]]) {
  test(`allocates ${expected} after numeric maximum ${maxId}`, async () => {
    const { post, writes } = setup({ maxId });
    assert.equal((await post({ ...valid, id: "CUS-9999" })).status, 201);
    assert.equal(writes[1][1].id, expected);
  });
}

test("retries serialization conflicts before creating customer", async () => {
  const { post, writes } = setup({ conflicts: 2, maxId: "3" });
  assert.equal((await post(valid)).status, 201);
  assert.equal(writes.length, 2);
  assert.equal(writes[1][1].id, "CUS-004");
});

test("stops after bounded serialization retries", async () => {
  const { post, writes } = setup({ conflicts: 5 });
  assert.equal((await post(valid)).status, 500);
  assert.equal(writes.length, 0);
});
