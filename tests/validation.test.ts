import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingSchema, enquirySchema } from "../src/lib/validation";
import { estimate, rates } from "../src/lib/config";
const booking = {
  service: "house-cleaning",
  property: "House",
  bedrooms: 2,
  bathrooms: 1,
  frequency: "Fortnightly",
  size: 100,
  extras: [],
  date: "2099-12-10",
  time: "Flexible",
  firstName: "Jamie",
  lastName: "Taylor",
  email: "jamie@example.com",
  phone: "0412345678",
  address: "10 Example Street",
  suburb: "Melbourne",
  postcode: "3000",
  instructions: "",
  consent: true,
  website: "",
};
test("valid Australian booking request passes", () =>
  assert.equal(bookingSchema.safeParse(booking).success, true));
test("unknown service, extras and frequency cannot be submitted", () => {
  for (const change of [
    { service: "fake" },
    { extras: ["fake"] },
    { frequency: "Every minute" },
  ])
    assert.equal(
      bookingSchema.safeParse({ ...booking, ...change }).success,
      false,
    );
});
test("past and nonexistent dates are rejected", () => {
  for (const date of ["2020-01-01", "2099-02-31"])
    assert.equal(bookingSchema.safeParse({ ...booking, date }).success, false);
});
test("postcode and consent are validated server-side", () => {
  assert.equal(
    bookingSchema.safeParse({ ...booking, postcode: "123" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...booking, consent: false }).success,
    false,
  );
});
test("spam honeypot rejects populated values", () =>
  assert.equal(
    bookingSchema.safeParse({ ...booking, website: "spam" }).success,
    false,
  ));
test("enquiries require meaningful content", () =>
  assert.equal(
    enquirySchema.safeParse({
      kind: "contact",
      name: "Jamie",
      email: "jamie@example.com",
      phone: "0412345678",
      service: "deep-cleaning",
      postcode: "3000",
      message: "hi",
      consent: true,
    }).success,
    false,
  ));
test("unapproved rates never produce a fabricated estimate", () =>
  assert.equal(estimate("Residential", 2, 1, "Weekly", 0), null));
test("configured estimate responds to rooms, extras and frequency", () => {
  const original = structuredClone(rates);
  try {
    rates.approved = true;
    rates.base.Residential = 100;
    rates.bedroom = 20;
    rates.bathroom = 15;
    rates.extra = 30;
    rates.discount.Weekly = 0.1;
    assert.equal(estimate("Residential", 3, 2, "Weekly", 1), 167);
  } finally {
    Object.assign(rates, original);
  }
});

test("current residential and commercial services are bookable, retired services are rejected", () => {
  for (const service of [
    "house-cleaning",
    "deep-cleaning",
    "one-off-cleaning",
    "property-cleaning",
    "commercial-cleaning",
    "office-cleaning",
    "construction-cleaning",
    "airbnb-cleaning",
  ]) {
    assert.equal(
      bookingSchema.safeParse({ ...booking, service }).success,
      true,
      service,
    );
  }
  for (const service of ["garden-cleaning", "carpet-cleaning"]) {
    assert.equal(
      bookingSchema.safeParse({ ...booking, service }).success,
      false,
      service,
    );
  }
  assert.equal(
    bookingSchema.safeParse({ ...booking, extras: ["Carpet cleaning"] })
      .success,
    false,
  );
});
