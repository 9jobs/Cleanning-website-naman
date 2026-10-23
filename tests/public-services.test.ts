import { test } from "node:test";
import assert from "node:assert/strict";
import { publicServices, services, articles } from "../src/lib/data";

test("public services exclude retired offerings while historical catalogue stays intact", () => {
  assert.deepEqual(
    publicServices.map((service) => service.slug),
    [
      "house-cleaning",
      "one-off-cleaning",
      "apartment-cleaning",
      "property-cleaning",
      "airbnb-cleaning",
    ],
  );
  assert.equal(services.length, 9);
  assert.equal(
    articles.some((article) =>
      [
        "moving-out-cleaning-checklist",
        "prepare-home-move-in-clean",
        "balcony-patio-cleaning-checklist",
      ].includes(article.slug),
    ),
    false,
  );
});
