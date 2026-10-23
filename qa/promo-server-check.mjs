// Isolated API/SMTP tests: all database and mail operations are in-memory doubles.
import assert from "node:assert/strict";
import Module from "node:module";
const receipts = new Set();
let pending = [];
let mailCount = 0;
let accepted = true;
let attempts = 1;
let lastMail;
globalThis.promoTest = {
  query: async (sql, values = []) => {
    if (sql === "begin") pending = [];
    if (sql === "rollback") pending = [];
    if (sql === "commit") {
      pending.forEach((key) => receipts.add(key));
      pending = [];
    }
    if (sql.startsWith("select 1"))
      return { rowCount: receipts.has(values[0]) ? 1 : 0, rows: [] };
    if (sql.includes("returning attempts")) return { rows: [{ attempts }] };
    if (sql.startsWith("insert into public.contact_request_limits"))
      pending.push(values[0]);
    return { rows: [], rowCount: 0 };
  },
  sendMail: async (mail) => {
    mailCount++;
    lastMail = mail;
    return {
      accepted: accepted ? ["inbox@example.invalid"] : [],
      rejected: accepted ? [] : ["inbox@example.invalid"],
    };
  },
};
const originalLoad = Module._load;
Module._load = function (specifier, ...args) {
  if (specifier === "server-only") return {};
  if (specifier === "pg")
    return {
      Pool: class {
        query(...params) {
          return globalThis.promoTest.query(...params);
        }
        async connect() {
          return {
            query: (...params) => globalThis.promoTest.query(...params),
            release() {},
          };
        }
        on() {}
      },
    };
  if (specifier === "nodemailer")
    return {
      createTransport() {
        return {
          sendMail: (...params) => globalThis.promoTest.sendMail(...params),
        };
      },
    };
  return originalLoad.call(this, specifier, ...args);
};
for (const key of [
  "CONTACT_DATABASE_URL",
  "CONTACT_RATE_LIMIT_SECRET",
  "CONTACT_SMTP_USER",
  "CONTACT_SMTP_PASSWORD",
  "CONTACT_TO_EMAIL",
])
  process.env[key] = "test-only";
const { POST } = await import("../src/app/api/promo/route.ts");
const request = (body, origin = "http://localhost:4317") =>
  new Request("http://localhost:4317/api/promo", {
    method: "POST",
    headers: {
      origin,
      host: "localhost:4317",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
assert.equal(
  (await POST(request({ action: "verify", code: "clean10" }))).status,
  200,
);
assert.equal(
  (await POST(request({ action: "verify", code: "WRONG" }))).status,
  400,
);
assert.equal(
  (
    await POST(
      request({ action: "verify", code: "CLEAN10" }, "https://other.invalid"),
    )
  ).status,
  403,
);
assert.equal((await POST(request({ name: "" }))).status, 400);
assert.equal(mailCount, 0);
const enquiry = {
  name: "Test Visitor",
  email: "visitor@example.com",
  phone: "0412345678",
  code: " clean10 ",
};
assert.equal((await POST(request(enquiry))).status, 200);
assert.equal(mailCount, 1);
assert.equal(lastMail.subject, "Thrive4 Cleaning — New 10% Promo Claim");
assert.match(lastMail.text, /Status: Pending Eligibility Verification/);
assert.match(lastMail.text, /Cleaning Service: Not Provided/);
assert.match(lastMail.text, /Promo Code: CLEAN10/);
assert.equal((await POST(request(enquiry))).status, 200);
assert.equal(
  mailCount,
  1,
  "identical retry must not send a second notification",
);
accepted = false;
const retry = { ...enquiry, email: "retry@example.com" };
assert.equal((await POST(request(retry))).status, 502);
accepted = true;
assert.equal((await POST(request(retry))).status, 200);
assert.equal(mailCount, 3, "failed notification can be retried");
attempts = 31;
assert.equal(
  (await POST(request({ action: "verify", code: "CLEAN10" }))).status,
  429,
);
assert.equal(
  (await POST(request({ ...enquiry, email: "limited@example.com" }))).status,
  429,
);
console.log(
  "Promo API checks passed: server code validation, origin, fields, email acceptance/failure, deduplication, retry and rate limits. No real email or database was used.",
);
