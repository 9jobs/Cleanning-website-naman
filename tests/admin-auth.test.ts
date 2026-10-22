import { test } from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  adminAuthenticated,
  createAdminSession,
  revokeAdminSession,
  safeAdminNext,
  verifyAdminCredentials,
  loginThrottled,
  recordLoginFailure,
} from "../src/lib/invoices/auth";

test("only configured administrator credentials work; sessions expire, revoke and reject tampering", async () => {
  const previousEmail = process.env.THRIVE4_ADMIN_EMAIL;
  const previousHash = process.env.THRIVE4_ADMIN_PASSWORD_HASH;
  const salt = "a".repeat(32);
  process.env.THRIVE4_ADMIN_EMAIL = "admin@example.com";
  process.env.THRIVE4_ADMIN_PASSWORD_HASH = `${salt}:${scryptSync("test-password", salt, 64).toString("hex")}`;
  const request = (token: string) =>
    ({
      cookies: {
        get: (name: string) =>
          name === ADMIN_COOKIE ? { value: token } : undefined,
      },
    }) as NextRequest;
  try {
    assert.equal(
      await verifyAdminCredentials("admin@example.com", "test-password"),
      true,
    );
    assert.equal(
      await verifyAdminCredentials("other@example.com", "test-password"),
      false,
    );
    assert.equal(
      await verifyAdminCredentials("admin@example.com", "wrong-password"),
      false,
    );
    assert.equal(await verifyAdminCredentials("", ""), false);
    assert.equal(adminAuthenticated(request("invented")), false);
    const now = Date.now();
    const token = createAdminSession(now);
    assert.equal(adminAuthenticated(request(token), now), true);
    assert.equal(adminAuthenticated(request(token.slice(0, -1)), now), false);
    assert.equal(
      adminAuthenticated(request(token), now + SESSION_SECONDS * 1000),
      false,
    );
    const revoked = createAdminSession();
    revokeAdminSession(request(revoked));
    assert.equal(adminAuthenticated(request(revoked)), false);
    const rotated = createAdminSession();
    process.env.THRIVE4_ADMIN_EMAIL = "changed@example.com";
    assert.equal(adminAuthenticated(request(rotated)), false);
    assert.equal(loginThrottled(now + 1000000), false);
    for (let i = 0; i < 5; i++) recordLoginFailure();
    assert.equal(loginThrottled(now + 1000001), true);
    assert.equal(loginThrottled(now + 2000000), false);
  } finally {
    if (previousEmail === undefined) delete process.env.THRIVE4_ADMIN_EMAIL;
    else process.env.THRIVE4_ADMIN_EMAIL = previousEmail;
    if (previousHash === undefined)
      delete process.env.THRIVE4_ADMIN_PASSWORD_HASH;
    else process.env.THRIVE4_ADMIN_PASSWORD_HASH = previousHash;
  }
});

test("login redirects stay on the admin workspace", () => {
  for (const value of [
    "https://example.com",
    "//example.com/admin",
    "/admin/login",
    "/admin/logout",
    "/pricing",
    "javascript:alert(1)",
  ])
    assert.equal(safeAdminNext(value), "/admin/review");
  assert.equal(
    safeAdminNext("/admin/review?id=abc&checkout=success"),
    "/admin/review?id=abc&checkout=success",
  );
});
