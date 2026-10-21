import { test } from "node:test";
import assert from "node:assert/strict";
import { quickQuoteRequestSchema } from "../src/lib/quick-quote-validation";

const request = {
  name: "Jamie",
  email: "jamie@example.com",
  phone: "+61 422 552 002",
  consent: true,
  website: "",
  submissionId: "8731bca4-8321-4d7a-a2d0-a84b51e13f11",
};

test("quick quote accepts contact details without inventing property or service details", () => {
  const parsed = quickQuoteRequestSchema.parse({
    ...request,
    name: " Jamie ",
    email: " jamie@example.com ",
  });
  assert.equal(parsed.name, "Jamie");
  assert.equal(parsed.email, "jamie@example.com");
  assert.equal("service" in parsed, false);
  assert.equal("bedrooms" in parsed, false);
});

test("quick quote rejects invalid contacts, missing consent and automated submissions", () => {
  for (const invalid of [
    { name: " " },
    { email: "not-an-email" },
    { phone: "123" },
    { consent: false },
    { website: "spam" },
    { submissionId: "invalid" },
    { name: "a".repeat(81) },
    { email: "a".repeat(201) + "@example.com" },
  ])
    assert.equal(
      quickQuoteRequestSchema.safeParse({ ...request, ...invalid }).success,
      false,
    );
});

test("quick quote preserves the customer's submitted international phone number", () => {
  for (const phone of ["+61 422 279 428", "0422 279 428"]) {
    const parsed = quickQuoteRequestSchema.parse({ ...request, phone });
    assert.equal(parsed.phone, phone);
    assert.notEqual(parsed.phone, "0400000000");
  }
});
