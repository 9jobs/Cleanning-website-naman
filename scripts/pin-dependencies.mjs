import fs from "node:fs/promises";
const p = JSON.parse(await fs.readFile("package.json", "utf8"));
for (const key of ["dependencies", "devDependencies"])
  for (const name of Object.keys(p[key])) {
    const installed = JSON.parse(
      await fs.readFile(`node_modules/${name}/package.json`, "utf8"),
    );
    p[key][name] = installed.version;
  }
p.scripts.format =
  "prettier --write src scripts tests qa/*.mjs *.json *.ts *.mjs README.md design/FIGMA-SPEC.md";
await fs.writeFile("package.json", JSON.stringify(p, null, 2) + "\n");
