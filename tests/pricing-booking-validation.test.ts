import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pricingBookingSchema,
  pricingBookingDetailsSchema,
  pricingBookingCheckoutSchema,
} from "../src/lib/pricing-booking-validation";

const booking = {
  name: "Test Customer",
  email: "customer@example.invalid",
  phone: "0412 345 678",
  address: "1 Example Street, Melbourne VIC 3000",
  date: "2099-03-25",
  time: "09:30",
};
test("pricing bookings require every contact and appointment field", () => {
  assert.equal(pricingBookingSchema.safeParse(booking).success, true);
  for (const field of Object.keys(booking))
    assert.equal(
      pricingBookingSchema.safeParse({ ...booking, [field]: "" }).success,
      false,
      field,
    );
  for (const override of [
    { email: "bad" },
    { phone: "123" },
    { date: "2099-02-30" },
    { date: "2000-01-01" },
    { time: "25:00" },
  ])
    assert.equal(
      pricingBookingSchema.safeParse({ ...booking, ...override }).success,
      false,
    );
});
test("historical booking metadata stays readable while only the three public plans accept new checkout", () => {
  assert.equal(
    pricingBookingDetailsSchema.safeParse({ ...booking, date: "2000-01-01" })
      .success,
    true,
  );
  const requestId = "5a9fad44-29be-43bb-ad95-47e38f5766c6";
  for (const service of [
    "house-cleaning",
    "one-off-cleaning",
    "property-cleaning",
  ])
    assert.equal(
      pricingBookingCheckoutSchema.safeParse({ service, requestId, booking })
        .success,
      true,
    );
  for (const service of [
    "commercial-cleaning",
    "move-in-cleaning",
    "office-cleaning",
  ])
    assert.equal(
      pricingBookingCheckoutSchema.safeParse({ service, requestId, booking })
        .success,
      false,
    );
  assert.equal(
    pricingBookingCheckoutSchema.safeParse({
      service: "house-cleaning",
      requestId,
    }).success,
    false,
  );
});
