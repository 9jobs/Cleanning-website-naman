import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const project = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
if (
  project.projectId !== "prj_pbiGcg5mZgP61JN7iQ9KL0hBZeD8" ||
  project.projectName !== "thrive4-cleaning"
)
  throw new Error("Wrong deployment project.");
const values = {
  THRIVE4_ADMIN_ONLINE: "true",
  THRIVE4_ADMIN_DATABASE_URL: process.env.THRIVE4_ADMIN_DATABASE_URL,
  THRIVE4_ADMIN_EMAIL: process.env.THRIVE4_ADMIN_EMAIL,
  THRIVE4_ADMIN_PASSWORD_HASH: process.env.THRIVE4_ADMIN_PASSWORD_HASH,
  THRIVE4_STRIPE_SECRET_KEY: process.env.THRIVE4_STRIPE_SECRET_KEY,
};
const cli = path.join(
  process.env.APPDATA,
  "npm/node_modules/vercel/dist/vc.js",
);
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
      "--sensitive",
      "--scope",
      "vijay-shukla-dev",
    ],
    { input: value, encoding: "utf8", timeout: 60000 },
  );
  if (result.status !== 0)
    throw new Error(`Could not configure ${key}. Values withheld.`);
  console.log(`Configured ${key} as production secret (value hidden).`);
}
