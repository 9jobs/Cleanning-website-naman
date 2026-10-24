import { test, mock } from "node:test";
import assert from "node:assert/strict";
import type { Pool } from "pg";
import {
  createUniquePricingCheckout,
  pricingBookingIdentity,
} from "../src/lib/pricing-booking-checkout";
import { pricingHourlyRate } from "../src/lib/pricing";
import {
  THRIVE4_TEST_ACCOUNT,
  verifyPricingPayment,
} from "../src/lib/invoices/stripe";

const booking = {
  name: "Test Customer",
  email: "customer@example.invalid",
  phone: "0412 345 678",
  address: "1 Example Street, Melbourne VIC 3000",
  date: "2099-03-25",
  time: "09:30",
};

test("pricing charges 79/89/99 and one email cannot book multiple plans, including concurrent requests", async () => {
  const keys = [
    "THRIVE4_STRIPE_MODE",
    "THRIVE4_STRIPE_SECRET_KEY",
    "CONTACT_RATE_LIMIT_SECRET",
  ];
  const previous = keys.map((key) => process.env[key]);
  Object.assign(process.env, {
    THRIVE4_STRIPE_MODE: "test",
    THRIVE4_STRIPE_SECRET_KEY: "sk_test_fixture",
    CONTACT_RATE_LIMIT_SECRET: "booking-test",
  });
  const records = new Set<string>();
  const sessions = new Map<
    string,
    {
      id: string;
      status: string;
      payment_status: string;
      unit: number;
      metadata: Record<string, string>;
      url: string;
    }
  >();
  let queue = Promise.resolve();
  const pool = {
    async connect() {
      let unlock: (() => void) | undefined;
      return {
        async query(sql: string, params: string[] = []) {
          if (sql.includes("pg_advisory")) {
            const pending = queue;
            queue = new Promise<void>((resolve) => {
              unlock = resolve;
            });
            await pending;
          }
          if (sql.startsWith("select client_hash"))
            return {
              rows: [...records]
                .filter(
                  (key) => key === params[0] || key.startsWith(`${params[0]}:`),
                )
                .map((client_hash) => ({ client_hash })),
            };
          if (sql.startsWith("insert")) records.add(params[0]);
          if (sql.startsWith("delete")) records.delete(params[0]);
          if (sql === "commit" || sql === "rollback") {
            unlock?.();
            unlock = undefined;
          }
          return { rows: [] };
        },
        release() {
          unlock?.();
        },
      };
    },
  } as unknown as Pool;
  const stub = mock.method(
    globalThis,
    "fetch",
    async (url: string, options: RequestInit) => {
      if (url.endsWith("/account"))
        return Response.json({ id: THRIVE4_TEST_ACCOUNT });
      if (options.method === "POST") {
        const fields = new URLSearchParams(String(options.body));
        const metadata = Object.fromEntries(
          [...fields]
            .filter(([key]) => key.startsWith("metadata["))
            .map(([key, value]) => [key.slice(9, -1), value]),
        );
        const id = `cs_test_BOOKING${sessions.size + 1}`;
        sessions.set(id, {
          id,
          status: "open",
          payment_status: "unpaid",
          unit: Number(fields.get("line_items[0][price_data][unit_amount]")),
          metadata,
          url: `https://checkout.stripe.com/c/pay/${id}`,
        });
      }
      const id =
        options.method === "POST"
          ? [...sessions.keys()].at(-1)!
          : url.split("/checkout/sessions/")[1].split("/")[0];
      const session = sessions.get(id)!;
      if (url.includes("/line_items?"))
        return Response.json({
          data: [
            {
              quantity: 1,
              price: { unit_amount: session.unit, currency: "aud" },
            },
          ],
          has_more: false,
        });
      return Response.json({
        ...session,
        livemode: false,
        currency: "aud",
        amount_total: session.unit,
        payment_intent: session.payment_status === "paid" ? "pi_FIXTURE" : null,
      });
    },
  );
  const create = (service: string, details = booking) =>
    createUniquePricingCheckout(
      pool,
      service,
      crypto.randomUUID(),
      "https://example.com",
      details,
    );
  try {
    assert.equal(
      pricingBookingIdentity(" CUSTOMER@example.invalid ", false),
      pricingBookingIdentity(booking.email, false),
    );
    assert.notEqual(
      pricingBookingIdentity(booking.email, false),
      pricingBookingIdentity(booking.email, true),
    );
    const first = await create("house-cleaning");
    assert.equal(sessions.get(first.sessionId)!.unit, 7900);
    assert.deepEqual(
      await create("house-cleaning"),
      first,
      "retry resumes the existing checkout",
    );
    await assert.rejects(create("one-off-cleaning"), /already in progress/);
    sessions.get(first.sessionId)!.status = "complete";
    sessions.get(first.sessionId)!.payment_status = "paid";
    for (const service of [
      "house-cleaning",
      "one-off-cleaning",
      "property-cleaning",
    ])
      await assert.rejects(
        create(service, { ...booking, email: "CUSTOMER@example.invalid" }),
        /booking already exists/,
      );
    assert.equal(
      sessions.size,
      1,
      "duplicate attempts never create another Stripe checkout",
    );

    for (const service of ["one-off-cleaning", "property-cleaning"]) {
      const result = await create(service, {
        ...booking,
        email: `${service}@example.invalid`,
      });
      assert.equal(
        sessions.get(result.sessionId)!.unit,
        pricingHourlyRate(service) * 100,
      );
      assert.equal(
        (await verifyPricingPayment(result.sessionId)).hourlyRate,
        pricingHourlyRate(service),
      );
    }
    const expired = await create("house-cleaning", {
      ...booking,
      email: "expired@example.invalid",
    });
    sessions.get(expired.sessionId)!.status = "expired";
    const replacement = await create("property-cleaning", {
      ...booking,
      email: "expired@example.invalid",
    });
    assert.notEqual(replacement.sessionId, expired.sessionId);

    const concurrent = await Promise.allSettled([
      create("house-cleaning", {
        ...booking,
        email: "parallel@example.invalid",
      }),
      create("property-cleaning", {
        ...booking,
        email: "parallel@example.invalid",
      }),
    ]);
    assert.equal(
      concurrent.filter((result) => result.status === "fulfilled").length,
      1,
    );
    assert.equal(
      concurrent.filter((result) => result.status === "rejected").length,
      1,
    );
    records.add(pricingBookingIdentity("paid@example.invalid", false));
    await assert.rejects(
      create("one-off-cleaning", { ...booking, email: "paid@example.invalid" }),
      /booking already exists/,
    );
  } finally {
    stub.mock.restore();
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});
