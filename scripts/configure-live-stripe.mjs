// Run only after the owner enables the restricted key's required permissions.
// No key or signing secret is printed or included in process arguments.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const project = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
if (project.projectId !== "prj_pbiGcg5mZgP61JN7iQ9KL0hBZeD8")
  throw new Error("Wrong Vercel project.");
const key = process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY;
if (!/^(rk|sk)_live_/.test(key || ""))
  throw new Error("Missing dedicated live key.");
async function api(resource, fields) {
  const response = await fetch("https://api.stripe.com/v1/" + resource, {
    method: fields ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + key,
      ...(fields
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
    },
    ...(fields ? { body: fields.toString() } : {}),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      `Stripe preflight failed (${resource}): ${result.error?.code || response.status}`,
    );
  return result;
}
const account = await api("account");
if (
  account.id !== "acct_1USt0hPqa21oiEVr" ||
  !/thrive\s*4/i.test(
    account.business_profile?.name ||
      account.settings?.dashboard?.display_name ||
      "",
  )
)
  throw new Error(
    "The live account must be verified as Thrive4 Cleaning before configuration.",
  );
if (!account.charges_enabled)
  throw new Error("Thrive4 live charges are not enabled by Stripe.");
await api("charges?limit=1");
await api("payment_intents?limit=1");
const url = "https://www.thrive4cleaning.com.au/api/stripe/webhook";
const events = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
];
const list = await api("webhook_endpoints?limit=100");
let endpoint = list.data.find((item) => item.url === url && item.livemode);
let webhookSecret = process.env.THRIVE4_STRIPE_WEBHOOK_SECRET;
if (!endpoint) {
  const fields = new URLSearchParams({
    url,
    description: "Thrive4 Cleaning live website payments",
    "metadata[app]": "thrive4-cleaning-live",
  });
  for (const event of events) fields.append("enabled_events[]", event);
  endpoint = await api("webhook_endpoints", fields);
  webhookSecret = endpoint.secret;
  let content = fs
    .readFileSync(".env.local", "utf8")
    .replace(/^THRIVE4_STRIPE_WEBHOOK_SECRET=.*\r?\n?/gm, "");
  fs.writeFileSync(
    ".env.local",
    content + "\nTHRIVE4_STRIPE_WEBHOOK_SECRET=" + webhookSecret + "\n",
  );
} else if (
  endpoint.status !== "enabled" ||
  (!endpoint.enabled_events.includes("*") &&
    !events.every((event) => endpoint.enabled_events.includes(event)))
) {
  const fields = new URLSearchParams({ disabled: "false" });
  for (const event of new Set([...endpoint.enabled_events, ...events]))
    fields.append("enabled_events[]", event);
  endpoint = await api("webhook_endpoints/" + endpoint.id, fields);
}
if (!webhookSecret?.startsWith("whsec_"))
  throw new Error("Missing signing secret for this endpoint.");
const values = {
  THRIVE4_STRIPE_MODE: "live",
  THRIVE4_STRIPE_LIVE_SECRET_KEY: key,
  THRIVE4_STRIPE_LIVE_PUBLISHABLE_KEY:
    process.env.THRIVE4_STRIPE_LIVE_PUBLISHABLE_KEY,
  THRIVE4_STRIPE_WEBHOOK_SECRET: webhookSecret,
};
const cli = path.join(
  process.env.APPDATA,
  "npm/node_modules/vercel/dist/vc.js",
);
// Configure activation last so an interrupted setup cannot partially activate live mode.
for (const name of [
  "THRIVE4_STRIPE_LIVE_SECRET_KEY",
  "THRIVE4_STRIPE_LIVE_PUBLISHABLE_KEY",
  "THRIVE4_STRIPE_WEBHOOK_SECRET",
  "THRIVE4_STRIPE_MODE",
]) {
  if (!values[name]) throw new Error(`Missing ${name}`);
  const result = spawnSync(
    process.execPath,
    [
      cli,
      "env",
      "add",
      name,
      "production",
      "--force",
      "--yes",
      "--sensitive",
      "--scope",
      "vijay-shukla-dev",
    ],
    { input: values[name], encoding: "utf8", timeout: 60000 },
  );
  if (result.status !== 0)
    throw new Error(`Failed to configure ${name}; values withheld.`);
  console.log(`Configured ${name} as production secret (hidden).`);
}
console.log(
  JSON.stringify({
    accountVerified: "Thrive4 Cleaning",
    chargesEnabled: true,
    webhookUrl: url,
    webhookEnabled: endpoint.status === "enabled",
  }),
);
