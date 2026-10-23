import { test } from "node:test";
import assert from "node:assert/strict";
import {
  promoCodeSchema,
  promoFieldsSchema,
} from "../src/lib/promo-validation";

const enquiry = {
  name: "Test Visitor",
  email: "visitor@example.com",
  phone: "0412 345 678",
  code: " clean10 ",
};
test("promo normalises the code and accepts optional service/postcode", () => {
  const result = promoFieldsSchema.parse(enquiry);
  assert.equal(result.code, "CLEAN10");
  assert.equal(result.service, "");
  assert.equal(result.postcode, "");
  assert.equal(promoCodeSchema.parse(" ClEaN10 "), "CLEAN10");
});
test("promo supports Australian and international numbers without accepting malformed numbers", () => {
  for (const phone of [
    "0412 345 678",
    "+61 412 345 678",
    "(02) 9876 5432",
    "+44 7700 900123",
    "+1 (202) 555-0123",
  ])
    assert.equal(
      promoFieldsSchema.safeParse({ ...enquiry, phone }).success,
      true,
      phone,
    );
  for (const phone of [
    "123",
    "0000000000",
    "041234567890",
    "+610412345678",
    "++44123456789",
    "0412abc678",
  ])
    assert.equal(
      promoFieldsSchema.safeParse({ ...enquiry, phone }).success,
      false,
      phone,
    );
});
test("promo rejects invalid fields and automated submissions", () => {
  for (const invalid of [
    { name: "" },
    { name: "Test\r\nInjected" },
    { email: "invalid" },
    { code: "" },
    { service: "commercial-cleaning" },
    { service: "move-in-cleaning" },
    { service: "end-of-lease-cleaning" },
    { service: "bedroom-living-area-cleaning" },
    { service: "balcony-patio-cleaning" },
    { postcode: "123" },
    { website: "spam" },
  ])
    assert.equal(
      promoFieldsSchema.safeParse({ ...enquiry, ...invalid }).success,
      false,
    );
  assert.equal(
    promoFieldsSchema.safeParse({
      ...enquiry,
      service: "house-cleaning",
      postcode: "2000",
    }).success,
    true,
  );
});
