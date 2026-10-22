import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

const { sessionId } = JSON.parse(
  await readFile(".local-admin/pdf-qa/reference.json", "utf8"),
);
const base = "http://localhost:4317";
for (const type of ["invoice", "receipt"]) {
  const response = await fetch(
    `${base}/api/payments/documents?session_id=${sessionId}&type=${type}`,
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/pdf/);
  assert.match(
    response.headers.get("content-disposition"),
    /attachment; filename="Thrive4-/,
  );
  assert.match(response.headers.get("cache-control"), /no-store/);
  const pdf = await PDFDocument.load(await response.arrayBuffer());
  assert.equal(pdf.getPageCount(), 1);
  console.log(`${type}: HTTP 200, valid one-page attachment`);
}
for (const page of [
  `/pricing/confirmation?session_id=${sessionId}`,
  `/payments/receipt?session_id=${sessionId}`,
]) {
  const response = await fetch(base + page);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<dialog/);
  assert.match(html, /Deep Cleaning/);
  assert.match(html, /60\.00/);
  console.log(`${page.split("?")[0]}: verified payment and modal markup`);
}
const invalid = await fetch(
  `${base}/api/payments/documents?session_id=invalid&type=receipt`,
);
assert(invalid.status >= 400);
const crossSite = await fetch(
  `${base}/api/payments/documents?session_id=${sessionId}&type=receipt`,
  { headers: { "Sec-Fetch-Site": "cross-site" } },
);
assert.equal(crossSite.status, 404);
console.log("Invalid payment and cross-site document access blocked.");
