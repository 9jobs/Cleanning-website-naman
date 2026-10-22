import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import {
  localAdminAllowed,
  productionHostAllowed,
  requestOrigin,
} from "../src/lib/invoices/access";
test("production admin allows configured HTTPS hosts only and rejects cross-origin writes", () => {
  const keys = [
    "NODE_ENV",
    "THRIVE4_ADMIN_ONLINE",
    "THRIVE4_ADMIN_DATABASE_URL",
    "NEXT_PUBLIC_SITE_URL",
    "VERCEL_URL",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  const request = (host: string, origin: string, method = "POST") =>
    ({
      method,
      url: `https://${host}/api/admin/invoices`,
      headers: new Headers({ host, origin, "x-forwarded-for": "203.0.113.1" }),
    }) as NextRequest;
  try {
    Object.assign(process.env, {
      NODE_ENV: "production",
      THRIVE4_ADMIN_ONLINE: "true",
      THRIVE4_ADMIN_DATABASE_URL: "configured-test-value",
      NEXT_PUBLIC_SITE_URL: "https://example.com",
      VERCEL_URL: "example-deployment.vercel.app",
    });
    assert(productionHostAllowed("example.com"));
    assert(productionHostAllowed("example-deployment.vercel.app"));
    assert(!productionHostAllowed("evil.example"));
    assert(localAdminAllowed(request("example.com", "https://example.com")));
    assert(!localAdminAllowed(request("example.com", "https://evil.example")));
    assert(!localAdminAllowed(request("example.com", "http://example.com")));
    assert(
      !localAdminAllowed(request("localhost:4317", "http://localhost:4317")),
    );
    assert.equal(
      requestOrigin(request("example.com", "https://example.com")),
      "https://example.com",
    );
    delete process.env.THRIVE4_ADMIN_DATABASE_URL;
    assert(!productionHostAllowed("example.com"));
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
