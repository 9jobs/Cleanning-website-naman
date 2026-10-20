import assert from "node:assert/strict";
const base = "http://127.0.0.1:4317";
const valid = {
  kind: "contact",
  name: "QA Example",
  email: "qa@example.com",
  phone: "0412345678",
  service: "regular-house-cleaning",
  postcode: "3000",
  message: "Local QA request to verify the disconnected integration state.",
  consent: true,
  website: "",
};
const post = async (body, origin = base) =>
  fetch(base + "/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
assert.equal((await post(valid, "https://unrelated.example")).status, 403);
assert.equal((await post({ ...valid, email: "invalid" })).status, 400);
assert.equal((await post({ ...valid, website: "spam" })).status, 400);
assert.equal((await post(valid)).status, 503);
const invalidPdf = new FormData();
invalidPdf.set("data", JSON.stringify({ ...valid, kind: "careers" }));
invalidPdf.set(
  "resume",
  new File(["not a PDF"], "resume.pdf", { type: "application/pdf" }),
);
const upload = await fetch(base + "/api/submissions", {
  method: "POST",
  headers: { Origin: base },
  body: invalidPdf,
});
assert.equal(upload.status, 400);
const malformed = await fetch(base + "/api/submissions", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: "{invalid",
});
assert.equal(malformed.status, 400);
console.log(
  "6 API rejection checks passed: foreign origin, invalid input, honeypot, disconnected storage, invalid PDF and malformed JSON. No live records created.",
);
