import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  verifyWebhookSignature,
  processStripeWebhook,
} from "../src/lib/invoices/webhook";
test("webhook verifies exact raw bytes, timestamp and any valid rotating signature", () => {
  const secret = "whsec_unit_fixture",
    now = Date.now(),
    time = Math.floor(now / 1000);
  const raw = Buffer.from(
    JSON.stringify({
      id: "evt_UNIT",
      type: "checkout.session.completed",
      livemode: true,
      data: { object: { id: "cs_live_UNIT" } },
    }),
  );
  const signature = createHmac("sha256", secret)
    .update(time + ".")
    .update(raw)
    .digest("hex");
  const header = `t=${time},v1=${"0".repeat(64)},v1=${signature}`;
  assert.equal(verifyWebhookSignature(raw, header, secret, now).id, "evt_UNIT");
  assert.throws(
    () =>
      verifyWebhookSignature(
        Buffer.concat([raw, Buffer.from(" ")]),
        header,
        secret,
        now,
      ),
    /signature/,
  );
  assert.throws(
    () => verifyWebhookSignature(raw, header, "wrong", now),
    /signature/,
  );
  assert.throws(
    () => verifyWebhookSignature(raw, header, secret, now + 301000),
    /signature/,
  );
  assert.throws(
    () =>
      verifyWebhookSignature(
        raw,
        `t=${time},t=${time},v1=${signature}`,
        secret,
        now,
      ),
    /signature/,
  );
});
test("webhook rejects wrong mode/account and ignores unrelated events before touching storage", async () => {
  const base = {
    id: "evt_UNIT",
    type: "checkout.session.completed",
    livemode: true,
    data: { object: { id: "cs_live_UNIT", metadata: { app: "unrelated" } } },
  };
  await assert.rejects(
    processStripeWebhook({ ...base, livemode: false }),
    /account or mode/,
  );
  await assert.rejects(
    processStripeWebhook({ ...base, account: "acct_UNRELATED" }),
    /account or mode/,
  );
  assert.deepEqual(await processStripeWebhook(base), { ignored: true });
  assert.deepEqual(
    await processStripeWebhook({ ...base, type: "customer.created" }),
    { ignored: true },
  );
});
