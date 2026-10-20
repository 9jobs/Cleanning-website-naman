// Copies only this site's server configuration to the explicitly linked NEW project.
// Reads values from ignored .env.local; sends secrets to the CLI through stdin.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const linked = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
if (
  linked.projectId !== "prj_pbiGcg5mZgP61JN7iQ9KL0hBZeD8" ||
  linked.projectName !== "thrive4-cleaning"
)
  throw new Error(
    "Refusing to configure any project other than the new Thrive4 Cleaning project.",
  );
const cli = path.join(
  process.env.APPDATA,
  "npm/node_modules/vercel/dist/vc.js",
);
const values = {
  CONTACT_DATABASE_URL: process.env.CONTACT_DATABASE_URL,
  CONTACT_RATE_LIMIT_SECRET: process.env.CONTACT_RATE_LIMIT_SECRET,
  CONTACT_SMTP_USER: process.env.CONTACT_SMTP_USER,
  CONTACT_SMTP_PASSWORD: process.env.CONTACT_SMTP_PASSWORD,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  NEXT_PUBLIC_SITE_URL: process.env.DEPLOY_SITE_URL,
};
for (const [key, value] of Object.entries(values)) {
  if (!value) throw new Error(`Missing ${key}`);
  const result = spawnSync(
    process.execPath,
    [
      cli,
      "env",
      "add",
      key,
      "production",
      "--yes",
      "--scope",
      "vijay-shukla-dev",
    ],
    { input: value, encoding: "utf8", timeout: 60000 },
  );
  // CLI output is deliberately not echoed: secret values must never reach logs.
  if (result.status !== 0)
    throw new Error(
      `Could not add ${key}; check the new project's environment configuration.`,
    );
  console.log(`Configured ${key} on ${linked.projectName} (value hidden)`);
}
