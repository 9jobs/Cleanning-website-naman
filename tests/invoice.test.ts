import { test, mock } from "node:test";
import nodemailer, { type SendMailOptions } from "nodemailer";
import assert from "node:assert/strict";
import { invoiceSchema, type Invoice } from "../src/lib/invoices/model";
import {
  invoiceEmailHtml,
  sendInvoiceEmail,
  clientPaymentLink,
} from "../src/lib/invoices/email";
import {
  deleteInvoice,
  findInvoice,
  generatePreviewLink,
  saveInvoice,
} from "../src/lib/invoices/store";
import { localAdminAllowed } from "../src/lib/invoices/access";
import type { NextRequest } from "next/server";

const input = {
  number: "T4-TEST-001",
  invoiceDate: "2026-10-22",
  issuedDate: "2026-10-22",
  dueDate: "2026-10-29",
  validUntil: "2026-11-05",
  name: "Example Customer",
  email: "invoice-test@example.com",
  phone: "0412345678",
  address: "10 Example St",
  service: "house-cleaning",
  plan: "Weekly" as const,
  autopay: false,
  description: "Weekly house clean",
  hours: 2,
  hourlyRate: 60.25,
  amount: 120.5,
  notes: "Thanks for choosing Thrive4 Cleaning.",
};
test("invoices reject invalid dates, precision, unsupported services and inactive recurring plans", () => {
  assert.equal(invoiceSchema.safeParse(input).success, true);
  for (const change of [
    { dueDate: "2026-10-20" },
    { validUntil: "2026-02-30" },
    { amount: 0 },
    { hours: 0 },
    { hours: -1 },
    { hours: 1.001 },
    { hourlyRate: 0 },
    { hourlyRate: 10.001 },
    { amount: 50 },
    { amount: 1.001 },
    { amount: Infinity },
    { email: "invalid" },
    { service: "garden-cleaning" },
    { service: "carpet-cleaning" },
    { number: "invoice\nBcc:spam" },
    { plan: "One-off", autopay: true },
  ]) {
    assert.equal(
      invoiceSchema.safeParse({ ...input, ...change }).success,
      false,
      JSON.stringify(change),
    );
  }
});
test("invoice edits invalidate payment links; duplicate invoice numbers and stale edits are rejected", () => {
  const invoices: Invoice[] = [];
  const invoice = saveInvoice(invoices, input);
  generatePreviewLink(invoice);
  const firstLink = invoice.paymentToken;
  assert.match(firstLink!, /^[a-f0-9]{48}$/);
  generatePreviewLink(invoice);
  assert.equal(invoice.paymentToken, firstLink);
  assert.throws(() => saveInvoice(invoices, input), /already in use/);
  saveInvoice(
    invoices,
    { ...input, hours: 3, hourlyRate: 60, amount: 180 },
    invoice.id,
    1,
  );
  assert.equal(invoice.paymentToken, undefined);
  assert.equal(invoice.revision, 2);
  assert.throws(() => saveInvoice(invoices, input, invoice.id, 1), /changed/);
});
test("branded HTML escapes customer content and labels payment links as local previews", () => {
  const html = invoiceEmailHtml(
    {
      ...input,
      name: '<img src=x onerror="alert(1)">',
      notes: "<script>alert(1)</script>",
    },
    "http://localhost:4317/admin/pay/example",
  );
  assert(!html.includes("<img src=x"));
  assert(!html.includes("<script>"));
  assert(html.includes("&lt;img"));
  assert(html.includes("Pay Now"));
  assert(html.includes("Online payment is not enabled yet"));
  assert(html.includes("No card will be charged automatically"));
  assert(html.includes("$120.50"));
  assert(!invoiceEmailHtml(input).includes('href="http://localhost'));
});

test("admin access is restricted to local development and same-origin writes", () => {
  const previous = process.env.NODE_ENV;
  const request = (host: string, origin?: string) =>
    new Request(`http://${host}/api/admin/invoices`, {
      method: origin ? "POST" : "GET",
      headers: { host, ...(origin ? { origin } : {}) },
    }) as NextRequest;
  try {
    Reflect.set(process.env, "NODE_ENV", "development");
    assert.equal(localAdminAllowed(request("localhost:4317")), true);
    assert.equal(
      localAdminAllowed(request("127.0.0.1:4317", "http://127.0.0.1:4317")),
      true,
    );
    assert.equal(
      localAdminAllowed(request("localhost:4317", "https://example.com")),
      false,
    );
    assert.equal(
      localAdminAllowed(request("www.thrive4cleaning.com.au")),
      false,
    );
    Reflect.set(process.env, "NODE_ENV", "production");
    assert.equal(localAdminAllowed(request("localhost:4317")), false);
  } finally {
    if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Reflect.set(process.env, "NODE_ENV", previous);
  }
});

test("fractional staff-hours produce the same rounded amount in saved invoices and email", () => {
  const data = invoiceSchema.parse({
    ...input,
    hours: 1.25,
    hourlyRate: 60,
    amount: 75,
  });
  assert.equal(data.amount, 75);
  const invoices: Invoice[] = [];
  const invoice = saveInvoice(invoices, data);
  const html = invoiceEmailHtml(invoice);
  assert(html.includes("1.25 hrs"));
  assert(html.includes("$60.00 / hr"));
  assert(html.includes("$75.00"));
  assert.equal(
    invoiceSchema.parse({
      ...input,
      hours: 2.35,
      hourlyRate: 60.25,
      amount: 141.59,
    }).amount,
    141.59,
  );
  assert.equal(
    invoiceSchema.safeParse({
      ...input,
      hours: 2.35,
      hourlyRate: 60.25,
      amount: 141.58,
    }).success,
    false,
  );
});

test("invoice sender addresses the client, sends branded HTML, returns a receipt and closes SMTP", async () => {
  const actualCreateTransport = nodemailer.createTransport;
  const previousUser = process.env.CONTACT_SMTP_USER;
  const previousPassword = process.env.CONTACT_SMTP_PASSWORD;
  let message: Record<string, unknown> | undefined;
  let closed = false;
  const transport = {
    async sendMail(data: Record<string, unknown>) {
      message = data;
      return {
        accepted: [input.email],
        rejected: [],
        messageId: "<receipt@example.test>",
      };
    },
    close() {
      closed = true;
    },
  };
  const stub = mock.method(
    nodemailer,
    "createTransport",
    (() => transport) as unknown as typeof nodemailer.createTransport,
  );
  try {
    process.env.CONTACT_SMTP_USER = " Sender@Example.Test ";
    process.env.CONTACT_SMTP_PASSWORD = "test-only";
    const invoice = saveInvoice([], { ...input, numberOfPeople: 3 });
    const receipt = await sendInvoiceEmail(
      invoice,
      "http://localhost:4317/admin/pay/test",
    );
    assert.equal(message?.to, input.email);
    assert.match(String(message?.html), /Number of people/);
    assert.match(String(message?.text), /Number of people: 3/);
    assert.deepEqual(message?.from, {
      name: "Thrive4 Cleaning",
      address: "sender@example.test",
    });
    assert.equal(message?.replyTo, undefined);
    assert(!String(message?.html).includes("display:none"));
    assert.equal(message?.subject, "Your cleaning invoice | Thrive4 Cleaning");
    assert.equal(
      message?.messageId,
      undefined,
      "Allow Nodemailer to generate a fresh real-domain message ID for each resend",
    );
    assert(String(message?.html).includes("Pay Now"));
    assert(String(message?.html).includes("$120.50"));
    assert.deepEqual(receipt, {
      messageId: "<receipt@example.test>",
      recipient: input.email,
    });
    assert.equal(message?.attachments, undefined);
    assert(
      String(message?.html).includes(
        'src="https://thrive4-invoice-assets.vercel.app/thrive4-logo.png"',
      ),
    );
    assert(!String(message?.html).includes("cid:"));
    assert(!String(message?.html).includes('href="http://localhost'));
    assert(!String(message?.text).includes("http://localhost"));
    const compiler = actualCreateTransport({
      streamTransport: true,
      buffer: true,
    });
    const compiled = await compiler.sendMail(message as SendMailOptions);
    const mime = compiled.message.toString();
    assert.match(mime, /Content-Type: multipart\/alternative/i);
    assert(!/Content-Disposition: (attachment|inline)/i.test(mime));
    assert(!/Content-ID:/i.test(mime));
    assert(closed);
  } finally {
    stub.mock.restore();
    if (previousUser === undefined) delete process.env.CONTACT_SMTP_USER;
    else process.env.CONTACT_SMTP_USER = previousUser;
    if (previousPassword === undefined)
      delete process.env.CONTACT_SMTP_PASSWORD;
    else process.env.CONTACT_SMTP_PASSWORD = previousPassword;
  }
});

test("reference invoice design uses the real logo, centered greeting and shadow without an invoice ID", () => {
  const html = invoiceEmailHtml(input, "http://localhost:4317/admin/pay/demo");
  assert(!html.includes(input.number));
  assert(html.includes("/brand/thrive4-logo.png"));
  assert(html.includes("box-shadow:"));
  assert(html.includes("text-align:center;margin:0 0 18px"));
  assert(html.includes("Thank you for choosing Thrive4 Cleaning."));
  assert(
    invoiceEmailHtml(input, undefined, "cid:thrive4-logo").includes(
      'src="cid:thrive4-logo"',
    ),
  );
});

test("customer invoice emails never expose private localhost payment links", () => {
  for (const link of [
    "http://localhost:4317/admin/pay/test",
    "https://127.0.0.1/pay",
    "https://192.168.1.2/pay",
    "https://10.0.0.2/pay",
    "https://example.local/pay",
  ])
    assert.equal(clientPaymentLink(link), undefined);
  assert.equal(
    clientPaymentLink("https://checkout.stripe.com/pay/example"),
    "https://checkout.stripe.com/pay/example",
  );
  const html = invoiceEmailHtml(input, "http://localhost:4317/admin/pay/test");
  assert(!html.includes('href="http://localhost'));
  assert(html.includes("Pay Now · setup pending"));
  assert(!html.includes("&#9742;"));
  assert(!html.includes("&#8982;"));
});

test("delete rejects stale revisions and removes only the requested invoice and its link", () => {
  const invoices: Invoice[] = [];
  const first = saveInvoice(invoices, input);
  const second = saveInvoice(invoices, { ...input, number: "T4-TEST-002" });
  generatePreviewLink(first);
  assert.throws(() => deleteInvoice(invoices, first.id, 2), /changed/);
  assert.equal(invoices.length, 2);
  assert.equal(deleteInvoice(invoices, first.id, 1), first.id);
  assert.deepEqual(
    invoices.map((item) => item.id),
    [second.id],
  );
  assert.throws(() => findInvoice(invoices, first.id), /not found/);
  assert.throws(() => deleteInvoice(invoices, first.id, 1), /not found/);
});

test("Stripe top-level returns open only the local review shell; cross-site API, iframe and writes stay blocked", () => {
  const previous = process.env.NODE_ENV;
  Reflect.set(process.env, "NODE_ENV", "development");
  const id = "dc0cb4b2-bbc0-466d-b89b-5d73f86d6538";
  const req = (
    path: string,
    method = "GET",
    extra: Record<string, string> = {},
  ) =>
    new Request("http://localhost:4317" + path, {
      method,
      headers: {
        host: "localhost:4317",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        ...extra,
      },
    }) as NextRequest;
  try {
    assert.equal(
      localAdminAllowed(req(`/admin/review?id=${id}&checkout=success`), true),
      true,
    );
    assert.equal(
      localAdminAllowed(req(`/admin/review?id=${id}&checkout=cancelled`), true),
      true,
    );
    assert.equal(
      localAdminAllowed(req(`/admin/review?id=${id}&checkout=success`)),
      false,
    );
    assert.equal(
      localAdminAllowed(
        req(`/admin/review?id=${id}&checkout=success`, "POST", {
          origin: "http://localhost:4317",
        }),
        true,
      ),
      false,
    );
    assert.equal(
      localAdminAllowed(
        req(`/api/admin/invoices?id=${id}&checkout=success`),
        true,
      ),
      false,
    );
    assert.equal(
      localAdminAllowed(
        req(`/admin/review?id=${id}&checkout=success`, "GET", {
          "sec-fetch-dest": "iframe",
        }),
        true,
      ),
      false,
    );
    assert.equal(
      localAdminAllowed(req("/admin/review?checkout=success&id=invalid"), true),
      false,
    );
    Reflect.set(process.env, "NODE_ENV", "production");
    assert.equal(
      localAdminAllowed(req(`/admin/review?id=${id}&checkout=success`), true),
      false,
    );
  } finally {
    if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Reflect.set(process.env, "NODE_ENV", previous);
  }
});

test("people count persists through invoice edits and preview without changing billing", () => {
  const items: Invoice[] = [];
  const parsed = invoiceSchema.parse({ ...input, numberOfPeople: 3 });
  const invoice = saveInvoice(items, parsed);
  assert.equal(invoice.numberOfPeople, 3);
  assert.equal(invoice.amount, input.amount);
  assert.match(invoiceEmailHtml(invoice), /Number of people/);
  const edited = invoiceSchema.parse({ ...input, numberOfPeople: 2 });
  saveInvoice(items, edited, invoice.id, invoice.revision);
  assert.equal(items[0].numberOfPeople, 2);
  assert.equal(items[0].amount, input.amount);
  for (const numberOfPeople of [0, -1, 1.5, 1001]) {
    assert.equal(
      invoiceSchema.safeParse({ ...input, numberOfPeople }).success,
      false,
    );
  }
  assert.equal(invoiceSchema.safeParse(input).success, true);
  assert.doesNotMatch(invoiceEmailHtml(input), /Number of people/);
});
