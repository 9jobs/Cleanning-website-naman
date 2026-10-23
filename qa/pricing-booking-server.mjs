// Isolated Stripe, SMTP and database doubles. Never connects to an external service.
import assert from "node:assert/strict";
import Module from "node:module";
import { createHmac } from "node:crypto";
let pending = [],
  sent = new Set(),
  mailCount = 0,
  acceptMail = true,
  lastMail;
let attempts = 1,
  paid = false,
  intentStatus = "succeeded",
  amount = 7900;
let bookingVersion = true;
const query = async (sql, values = []) => {
  if (sql === "begin" || sql === "rollback") pending = [];
  if (sql === "commit") {
    pending.forEach((key) => sent.add(key));
    pending = [];
  }
  if (sql.startsWith("select 1"))
    return { rowCount: sent.has(values[0]) ? 1 : 0, rows: [] };
  if (sql.includes("returning attempts")) return { rows: [{ attempts }] };
  if (sql.startsWith("insert into public.contact_request_limits"))
    pending.push(values[0]);
  return { rows: [], rowCount: 0 };
};
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === "server-only") return {};
  if (name === "pg")
    return {
      Pool: class {
        query(...args) {
          return query(...args);
        }
        async connect() {
          return { query, release() {} };
        }
        on() {}
      },
    };
  if (name === "nodemailer")
    return {
      createTransport() {
        return {
          async sendMail(mail) {
            mailCount++;
            lastMail = mail;
            return {
              accepted: acceptMail ? ["inbox@example.invalid"] : [],
              rejected: acceptMail ? [] : ["inbox@example.invalid"],
            };
          },
        };
      },
    };
  return originalLoad.call(this, name, ...args);
};
for (const key of [
  "CONTACT_DATABASE_URL",
  "CONTACT_RATE_LIMIT_SECRET",
  "CONTACT_SMTP_USER",
  "CONTACT_SMTP_PASSWORD",
  "CONTACT_TO_EMAIL",
])
  process.env[key] = "fixture";
process.env.NODE_ENV = "development";
process.env.THRIVE4_STRIPE_SECRET_KEY = "sk_test_fixture";
delete process.env.THRIVE4_STRIPE_MODE;
const booking = {
  name: "Test Customer",
  email: "customer@example.invalid",
  phone: "0412345678",
  address: "1 Example Street, Melbourne VIC 3000",
  date: "2099-03-25",
  time: "09:30",
};
let sessionMetadata = {
  app: "thrive4-pricing-checkout",
  service: "house-cleaning",
  booking_version: "1",
  ...Object.fromEntries(
    Object.entries(booking).map(([k, v]) => [`booking_${k}`, v]),
  ),
};
let capturedFields;
globalThis.fetch = async (url, options = {}) => {
  const path = String(url);
  if (path.endsWith("/account"))
    return Response.json({ id: "acct_1USt0pLVzsWcldA8" });
  if (path.endsWith("/line_items?limit=2"))
    return Response.json({
      has_more: false,
      data: [{ quantity: 1, price: { unit_amount: 7900, currency: "aud" } }],
    });
  if (path.includes("/payment_intents/"))
    return Response.json({
      id: "pi_TEST",
      status: intentStatus,
      livemode: false,
      currency: "aud",
      amount_received: 7900,
      metadata: { app: "thrive4-pricing-checkout", service: "house-cleaning" },
      latest_charge: {
        paid: true,
        created: 1792648800,
        payment_method_details: { card: { brand: "visa", last4: "4242" } },
      },
    });
  if (path.endsWith("/checkout/sessions") && options.method === "POST") {
    capturedFields = new URLSearchParams(String(options.body));
    sessionMetadata = Object.fromEntries(
      [...capturedFields.entries()]
        .filter(([k]) => /^metadata\[/.test(k))
        .map(([k, v]) => [k.slice(9, -1), v]),
    );
  }
  return Response.json({
    id: "cs_test_BOOKING",
    url: "https://checkout.stripe.com/c/pay/cs_test_BOOKING",
    livemode: false,
    currency: "aud",
    amount_total: amount,
    status: paid ? "complete" : "open",
    payment_status: paid ? "paid" : "unpaid",
    payment_intent: "pi_TEST",
    metadata: bookingVersion
      ? sessionMetadata
      : { app: "thrive4-pricing-checkout", service: "house-cleaning" },
  });
};
const { createPricingCheckout } = await import("../src/lib/invoices/stripe.ts");
const {
  notifyPaidPricingBooking,
  processPricingBookingEvent,
  limitPricingBookings,
} = await import("../src/lib/pricing-booking-server.ts");
const { POST } = await import("../src/app/api/pricing/checkout/route.ts");
const { NextRequest } = await import("next/server.js");
const checkout = (data) =>
  POST(
    new NextRequest("http://localhost:4317/api/pricing/checkout", {
      method: "POST",
      headers: {
        host: "localhost:4317",
        origin: "http://localhost:4317",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),
  );
const request = {
  service: "house-cleaning",
  requestId: "5a9fad44-29be-43bb-ad95-47e38f5766c6",
  booking,
};
assert.equal((await checkout({ ...request, booking: undefined })).status, 400);
assert.equal(
  (await checkout({ ...request, booking: { ...booking, time: "" } })).status,
  400,
);
for (const service of [
  "house-cleaning",
  "one-off-cleaning",
  "property-cleaning",
]) {
  const response = await checkout({ ...request, service });
  assert.equal(response.status, 200);
  assert.equal(capturedFields.get("metadata[service]"), service);
  assert.equal(
    capturedFields.get("metadata[booking_address]"),
    booking.address,
  );
  assert.equal(capturedFields.get("metadata[booking_time]"), booking.time);
  assert.equal(capturedFields.get("customer_email"), booking.email);
  assert.equal(
    capturedFields.get("line_items[0][price_data][unit_amount]"),
    "7900",
  );
}
await createPricingCheckout(
  "house-cleaning",
  request.requestId,
  "http://localhost:4317",
  booking,
);
assert.equal(await notifyPaidPricingBooking("cs_test_BOOKING"), "unpaid");
assert.equal(mailCount, 0);
paid = true;
intentStatus = "processing";
await assert.rejects(
  notifyPaidPricingBooking("cs_test_BOOKING"),
  /could not be verified/,
);
assert.equal(mailCount, 0);
intentStatus = "succeeded";
amount = 1;
await assert.rejects(
  notifyPaidPricingBooking("cs_test_BOOKING"),
  /hours and amount/,
);
assert.equal(mailCount, 0);
amount = 7900;
acceptMail = false;
await assert.rejects(
  notifyPaidPricingBooking("cs_test_BOOKING"),
  /not accepted/,
);
assert.equal(sent.size, 0);
acceptMail = true;
assert.equal(await notifyPaidPricingBooking("cs_test_BOOKING"), "sent");
assert.equal(lastMail.to, "fixture");
for (const value of Object.values(booking))
  assert.ok(lastMail.text.includes(value));
const calls = mailCount;
assert.equal(await notifyPaidPricingBooking("cs_test_BOOKING"), "duplicate");
assert.equal(mailCount, calls);
const event = {
  id: "evt_TEST",
  type: "checkout.session.completed",
  livemode: false,
  data: {
    object: {
      id: "cs_test_BOOKING",
      metadata: { app: "thrive4-pricing-checkout" },
    },
  },
};
assert.equal((await processPricingBookingEvent(event)).outcome, "duplicate");
await assert.rejects(
  processPricingBookingEvent({ ...event, account: "acct_WRONG" }),
  /account or mode/,
);
assert.deepEqual(
  await processPricingBookingEvent({
    ...event,
    type: "checkout.session.expired",
  }),
  { ignored: true },
);
// Exercise the signed HTTP webhook path, not just the notification helper.
process.env.THRIVE4_STRIPE_WEBHOOK_SECRET = "whsec_booking_fixture";
const { POST: webhook } =
  await import("../src/app/api/stripe/webhook/route.ts");
const raw = JSON.stringify({
  ...event,
  data: {
    object: {
      ...event.data.object,
      metadata: { app: "thrive4-pricing-checkout", booking_version: "1" },
    },
  },
});
const time = Math.floor(Date.now() / 1000);
const signature = createHmac(
  "sha256",
  process.env.THRIVE4_STRIPE_WEBHOOK_SECRET,
)
  .update(`${time}.${raw}`)
  .digest("hex");
const callWebhook = (sig) =>
  webhook(
    new NextRequest("http://localhost:4317/api/stripe/webhook", {
      method: "POST",
      headers: {
        host: "localhost:4317",
        "stripe-signature": `t=${time},v1=${sig}`,
      },
      body: raw,
    }),
  );
assert.equal((await callWebhook("0".repeat(64))).status, 400);
assert.equal((await callWebhook(signature)).status, 200);
assert.equal(mailCount, calls);
bookingVersion = false;
assert.equal(await notifyPaidPricingBooking("cs_test_BOOKING"), "legacy");
attempts = 11;
await assert.rejects(limitPricingBookings("local"), /wait a few minutes/);
console.log(
  "Booking server checks passed: required details, three plans, Stripe metadata/unchanged price, unpaid and forged amounts, failed/accepted email, retry, duplicate notifications, webhook guards and rate limiting. All services mocked; no real email/payment/database used.",
);
