import assert from "node:assert/strict";
const base = "http://localhost:4317";
const origin = { Origin: base };
const post = (path, data, cookie) =>
  fetch(base + path, {
    method: "POST",
    redirect: "manual",
    headers: {
      ...origin,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: new URLSearchParams(data),
  });
for (const path of ["/admin", "/admin/review?id=invoice-1"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 303);
  assert.match(response.headers.get("location"), /^\/admin\/login\?next=/);
}
assert.equal((await fetch(base + "/api/admin/invoices")).status, 401);
assert.equal(
  (
    await fetch(base + "/api/admin/invoices", {
      method: "POST",
      headers: { ...origin, "Content-Type": "application/json" },
      body: "{}",
    })
  ).status,
  401,
);
assert.equal(
  (await fetch(base + "/api/payments/documents?invoice_id=abc&type=receipt"))
    .status,
  401,
);
const wrong = await post("/admin/login", {
  email: "other@example.com",
  password: process.env.THRIVE4_ADMIN_TEST_PASSWORD,
});
assert.equal(wrong.status, 401);
assert.equal(wrong.headers.get("set-cookie"), null);
const wrongPassword = await post("/admin/login", {
  email: process.env.THRIVE4_ADMIN_TEST_EMAIL,
  password: "wrong",
});
assert.equal(wrongPassword.status, 401);
const crossSite = await fetch(base + "/admin/login", {
  method: "POST",
  headers: {
    Origin: "https://example.com",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: "email=x&password=y",
});
assert.equal(crossSite.status, 404);
const success = await post("/admin/login", {
  email: process.env.THRIVE4_ADMIN_TEST_EMAIL,
  password: process.env.THRIVE4_ADMIN_TEST_PASSWORD,
  next: "/admin/review",
});
assert.equal(success.status, 303);
assert.equal(success.headers.get("location"), "/admin/review");
const header = success.headers.get("set-cookie");
assert.match(header, /HttpOnly/i);
assert.match(header, /SameSite=lax/i);
const cookie = header.split(";")[0];
const review = await fetch(base + "/admin/review", {
  headers: { Cookie: cookie },
});
assert.equal(review.status, 200);
assert.match(await review.text(), /Sign out/);
const authorized = await fetch(base + "/api/admin/invoices", {
  method: "POST",
  headers: { ...origin, Cookie: cookie, "Content-Type": "application/json" },
  body: "{}",
});
assert.equal(authorized.status, 400);
const logout = await post("/admin/logout", {}, cookie);
assert.equal(logout.status, 303);
assert.match(logout.headers.get("set-cookie"), /Max-Age=0/i);
assert.equal(
  (await fetch(base + "/api/admin/invoices", { headers: { Cookie: cookie } }))
    .status,
  401,
);
console.log(
  "PASS: login required; correct account accepted; wrong email/password and cross-site requests rejected; protected API enforced; logout revokes session. No invoices or payments changed.",
);
