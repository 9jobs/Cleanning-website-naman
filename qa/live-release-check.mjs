import assert from "node:assert/strict";
import fs from "node:fs";
const base = "https://www.thrive4cleaning.com.au";
const headers = { Origin: base };
const response = await fetch(base + "/admin", { redirect: "manual" });
assert.equal(response.status, 303);
assert.match(response.headers.get("location"), /\/admin\/login/);
assert.equal((await fetch(base + "/api/admin/invoices")).status, 401);
const loginPage = await (await fetch(base + "/admin/login")).text();
assert(!loginPage.includes(process.env.THRIVE4_ADMIN_PASSWORD_HASH));
assert(!loginPage.includes(process.env.THRIVE4_ADMIN_TEST_PASSWORD));
const login = await fetch(base + "/admin/login", {
  method: "POST",
  redirect: "manual",
  headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    email: process.env.THRIVE4_ADMIN_EMAIL,
    password: process.env.THRIVE4_ADMIN_TEST_PASSWORD,
  }),
});
assert.equal(login.status, 303);
const setCookie = login.headers.get("set-cookie");
assert.match(setCookie, /HttpOnly/i);
assert.match(setCookie, /Secure/i);
const cookie = setCookie.split(";")[0];
try {
  const list = await fetch(base + "/api/admin/invoices", {
    headers: { Cookie: cookie },
  });
  const data = await list.json();
  assert.equal(list.status, 200);
  assert(Array.isArray(data.invoices));
  console.log(
    `Production admin login and persistent invoice read: PASS (${data.invoices.length} saved records).`,
  );
  const action = async (body) => {
    const result = await fetch(base + "/api/admin/invoices", {
      method: "POST",
      headers: {
        ...headers,
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return { status: result.status, ...(await result.json()) };
  };
  const input = {
    number: `T4-RELEASE-${crypto.randomUUID().slice(0, 8)}`,
    name: "Release Verification",
    email: "qa@example.com",
    phone: "",
    address: "",
    service: "house-cleaning",
    description: "Release verification invoice",
    plan: "One-off",
    autopay: false,
    hours: 1,
    hourlyRate: 70,
    amount: 70,
    notes: "",
    invoiceDate: "2026-10-22",
    issuedDate: "2026-10-22",
    dueDate: "2026-10-29",
    validUntil: "2026-11-05",
  };
  const created = await action({ action: "save", data: input });
  assert.equal(created.status, 200);
  const id = created.invoice.id;
  try {
    const edited = await action({
      action: "save",
      id,
      revision: 1,
      data: { ...input, hours: 2, amount: 140 },
    });
    assert.equal(edited.status, 200);
    assert.equal(edited.invoice.amount, 140);
    const persisted = await fetch(base + "/api/admin/invoices?id=" + id, {
      headers: { Cookie: cookie },
    });
    assert.equal((await persisted.json()).invoice.amount, 140);
    assert.equal(
      (await action({ action: "delete", id, revision: 1, confirm: true }))
        .status,
      409,
    );
    assert.equal(
      (await action({ action: "delete", id, revision: 2, confirm: true }))
        .status,
      200,
    );
    console.log(
      "Production create/edit/delete and stale-revision protection: PASS (temporary QA invoice only).",
    );
  } finally {
    const lookup = await fetch(base + "/api/admin/invoices?id=" + id, {
      headers: { Cookie: cookie },
    });
    if (lookup.status === 200) {
      const item = (await lookup.json()).invoice;
      await action({
        action: "delete",
        id,
        revision: item.revision,
        confirm: true,
      });
    }
  }
  const cross = await fetch(base + "/api/admin/invoices", {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: "https://example.com",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(cross.status, 404);
  for (const service of ["house-cleaning", "commercial-cleaning"]) {
    const r = await fetch(base + "/pricing?service=" + service);
    const html = await r.text();
    assert.equal(r.status, 200);
    assert.equal((html.match(/class="pricing-plan-card\b/g) || []).length, 3);
    assert(!/Deep Cleaning|deep-cleaning/i.test(html));
    assert(html.includes("/ person / hour"));
  }
  const invalid = await fetch(base + "/api/pricing/checkout", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      service: "deep-cleaning",
      requestId: crypto.randomUUID(),
    }),
  });
  assert.equal(invalid.status, 400);
  const reference = JSON.parse(
    fs.readFileSync(".local-admin/pdf-qa/reference.json", "utf8"),
  );
  const paid = await fetch(
    base + "/pricing/confirmation?session_id=" + reference.sessionId,
  );
  const paidHtml = await paid.text();
  assert.equal(paid.status, 200);
  const verified = paidHtml.includes("Payment successful!");
  if (!verified) assert(paidHtml.includes("Payment has not been confirmed."));
  for (const type of ["invoice", "receipt"]) {
    const pdf = await fetch(
      base +
        `/api/payments/documents?session_id=${reference.sessionId}&type=${type}`,
    );
    if (!verified) {
      assert(pdf.status >= 400);
      continue;
    }
    assert.equal(pdf.status, 200);
    assert.match(pdf.headers.get("content-type"), /application\/pdf/);
    assert.equal(
      Buffer.from(await pdf.arrayBuffer())
        .subarray(0, 4)
        .toString(),
      "%PDF",
    );
  }
  console.log(
    verified
      ? "Production pricing, verified paid confirmation and PDFs: PASS."
      : "Production pricing and service rejection: PASS. Removed historical Checkout cannot claim success or issue PDFs. No fresh card payment attempted.",
  );
} finally {
  await fetch(base + "/admin/logout", {
    method: "POST",
    redirect: "manual",
    headers: { ...headers, Cookie: cookie },
  });
  assert.equal(
    (await fetch(base + "/api/admin/invoices", { headers: { Cookie: cookie } }))
      .status,
    401,
  );
  console.log("Production logout revokes session: PASS.");
}
