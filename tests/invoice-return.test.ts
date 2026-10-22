import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { randomUUID } from "node:crypto";
const source = readFile("public/admin/invoices.js", "utf8");
async function runReturn(
  state: "paid" | "unpaid" | "error",
  result = "success",
) {
  let shown = 0,
    requests = 0,
    cleaned = "";
  const nodes = new Map<string, Record<string, unknown>>();
  const get = (id: string) => {
    if (!nodes.has(id))
      nodes.set(id, {
        textContent: "",
        innerHTML: "",
        style: {},
        addEventListener() {},
        showModal() {
          shown++;
        },
      });
    return nodes.get(id)!;
  };
  get("admin-config").textContent = JSON.stringify({
    view: "review",
    stripeTestReady: true,
    services: [],
  });
  const invoice = {
    id: "dc0cb4b2-bbc0-466d-b89b-5d73f86d6538",
    number: "T4-RETURN-TEST",
    name: "Example Client",
    email: "test@example.com",
    amount: 60,
    revision: 1,
    createdAt: "2026-10-22T00:00:00Z",
    invoiceDate: "2026-10-22",
    issuedDate: "2026-10-22",
    dueDate: "2026-10-29",
    validUntil: "2026-11-05",
    plan: "One-off",
    description: "House Cleaning",
    hours: 1,
    hourlyRate: 60,
    checkout: {
      paymentStatus: state === "paid" ? "paid" : "unpaid",
      status: state === "paid" ? "complete" : "open",
    },
  };
  const url = new URL(
    `http://localhost:4317/admin/review?id=${invoice.id}&checkout=${result}`,
  );
  runInNewContext(await source, {
    document: { getElementById: get },
    location: { href: url.href, search: url.search },
    history: {
      replaceState(_s: unknown, _t: string, u: URL) {
        cleaned = String(u);
      },
    },
    window: {},
    Intl,
    URL,
    URLSearchParams,
    crypto: { randomUUID },
    addEventListener() {},
    setTimeout(callback: () => void) {
      queueMicrotask(callback);
      return 1;
    },
    clearTimeout() {},
    fetch: async () => {
      requests++;
      return {
        ok: state !== "error",
        json: async () =>
          state === "error"
            ? { error: "Stripe session unavailable" }
            : { invoice, html: "<p>Test</p>", mailReady: true },
      };
    },
  });
  for (let i = 0; i < 30; i++)
    await new Promise<void>((resolve) => setImmediate(resolve));
  return {
    shown,
    requests,
    cleaned,
    title: get("payment-result-title").textContent,
    message: get("payment-result-message").textContent,
    root: get("app-content").innerHTML,
  };
}
test("verified paid Stripe return opens success popup and removes the success marker", async () => {
  const r = await runReturn("paid");
  assert.equal(r.shown, 1);
  assert.equal(r.title, "Payment successful");
  assert.match(String(r.message), /60\.00/);
  assert(!r.cleaned.includes("checkout="));
  assert.match(String(r.root), /INVOICE OVERVIEW/);
});
test("a success URL without paid Stripe status shows pending rather than a false success", async () => {
  const r = await runReturn("unpaid");
  assert.equal(r.shown, 1);
  assert.equal(r.title, "Payment verification pending");
  assert.equal(r.requests, 4);
  assert.match(String(r.message), /do not pay again/);
});
test("missing Stripe session shows verification pending and never claims successful payment", async () => {
  const r = await runReturn("error");
  assert.equal(r.shown, 1);
  assert.equal(r.title, "Payment verification pending");
  assert.match(String(r.root), /Stripe session unavailable/);
});
test("cancelled Stripe returns do not show a success popup", async () => {
  const r = await runReturn("unpaid", "cancelled");
  assert.equal(r.shown, 0);
  assert.equal(r.requests, 1);
});
