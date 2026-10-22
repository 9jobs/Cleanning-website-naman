import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextRequest } from "next/server";
import { invoiceDatabase, onlineAdmin } from "./database";

const derive = promisify(scrypt);
export const ADMIN_COOKIE = "thrive4_admin_session";
export const SESSION_SECONDS = 8 * 60 * 60;
const WINDOW = 15 * 60 * 1000;
type AuthState = {
  sessions: Map<string, { expires: number; configuration: string }>;
  failures: number;
  windowEnds: number;
};
const globalAuth = globalThis as typeof globalThis & {
  thrive4AdminAuth?: AuthState;
};
const state = (globalAuth.thrive4AdminAuth ??= {
  sessions: new Map(),
  failures: 0,
  windowEnds: 0,
});
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const configuration = () =>
  digest(
    `${process.env.THRIVE4_ADMIN_EMAIL}:${process.env.THRIVE4_ADMIN_PASSWORD_HASH}`,
  );
export function adminAuthReady() {
  return Boolean(
    process.env.THRIVE4_ADMIN_EMAIL &&
    /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(
      process.env.THRIVE4_ADMIN_PASSWORD_HASH || "",
    ),
  );
}
export async function verifyAdminCredentials(email: string, password: string) {
  if (!adminAuthReady() || email.length > 254 || password.length > 256)
    return false;
  const [salt, expected] = process.env.THRIVE4_ADMIN_PASSWORD_HASH!.split(":");
  const actual = (await derive(password, salt, 64)) as Buffer;
  const validPassword = timingSafeEqual(actual, Buffer.from(expected, "hex"));
  const validEmail = timingSafeEqual(
    Buffer.from(digest(email.trim().toLowerCase())),
    Buffer.from(digest(process.env.THRIVE4_ADMIN_EMAIL!.trim().toLowerCase())),
  );
  return validEmail && validPassword;
}
export function loginThrottled(now = Date.now()) {
  if (state.windowEnds <= now) {
    state.failures = 0;
    state.windowEnds = now + WINDOW;
  }
  return state.failures >= 5;
}
export function recordLoginFailure() {
  state.failures++;
}
export function createAdminSession(now = Date.now()) {
  for (const [key, value] of state.sessions)
    if (value.expires <= now) state.sessions.delete(key);
  if (state.sessions.size >= 100)
    state.sessions.delete(state.sessions.keys().next().value!);
  const token = randomBytes(32).toString("hex");
  state.sessions.set(digest(token), {
    expires: now + SESSION_SECONDS * 1000,
    configuration: configuration(),
  });
  state.failures = 0;
  return token;
}
export function adminAuthenticated(
  request: { cookies: { get(name: string): { value: string } | undefined } },
  now = Date.now(),
) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value || "";
  if (!adminAuthReady() || !/^[a-f0-9]{64}$/.test(token)) return false;
  const key = digest(token);
  const session = state.sessions.get(key);
  if (!session) return false;
  if (session.expires <= now || session.configuration !== configuration()) {
    state.sessions.delete(key);
    return false;
  }
  return true;
}
export function revokeAdminSession(request: NextRequest) {
  state.sessions.delete(digest(request.cookies.get(ADMIN_COOKIE)?.value || ""));
}
export function safeAdminNext(value: string | null) {
  if (!value || value.length > 2048) return "/admin/review";
  try {
    const url = new URL(value, "http://localhost");
    if (
      url.origin !== "http://localhost" ||
      !["/admin", "/admin/review"].includes(url.pathname)
    )
      return "/admin/review";
    return url.pathname + url.search;
  } catch {
    return "/admin/review";
  }
}
export function adminLoginLocation(request: NextRequest) {
  return `/admin/login?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
}
type CookieRequest = {
  cookies: { get(name: string): { value: string } | undefined };
};
export async function authenticatedAdmin(request: CookieRequest) {
  if (!onlineAdmin()) return adminAuthenticated(request);
  const token = request.cookies.get(ADMIN_COOKIE)?.value || "";
  if (!adminAuthReady() || !/^[a-f0-9]{64}$/.test(token)) return false;
  const result = await invoiceDatabase().query(
    "select 1 from thrive4_admin.sessions where token_hash=$1 and configuration=$2 and expires_at>now()",
    [digest(token), configuration()],
  );
  return Boolean(result.rowCount);
}
export async function adminLoginThrottled() {
  if (!onlineAdmin()) return loginThrottled();
  const result = await invoiceDatabase().query(
    "insert into thrive4_admin.login_limit(id,attempts,window_end) values(1,1,now()+interval '15 minutes') on conflict(id) do update set attempts=case when thrive4_admin.login_limit.window_end<now() then 1 else thrive4_admin.login_limit.attempts+1 end, window_end=case when thrive4_admin.login_limit.window_end<now() then now()+interval '15 minutes' else thrive4_admin.login_limit.window_end end returning attempts",
  );
  return result.rows[0].attempts > 5;
}
export async function issueAdminSession() {
  if (!onlineAdmin()) return createAdminSession();
  const token = randomBytes(32).toString("hex");
  await invoiceDatabase().query(
    "delete from thrive4_admin.sessions where expires_at<=now()",
  );
  await invoiceDatabase().query(
    "insert into thrive4_admin.sessions(token_hash,configuration,expires_at) values($1,$2,now()+interval '8 hours')",
    [digest(token), configuration()],
  );
  await invoiceDatabase().query(
    "delete from thrive4_admin.login_limit where id=1",
  );
  return token;
}
export async function endAdminSession(request: NextRequest) {
  if (!onlineAdmin()) return revokeAdminSession(request);
  await invoiceDatabase().query(
    "delete from thrive4_admin.sessions where token_hash=$1",
    [digest(request.cookies.get(ADMIN_COOKIE)?.value || "")],
  );
}
