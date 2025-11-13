import fs from "node:fs";
import path from "node:path";

const banned = /(divorc|spous|marriag|ClarityDivorce)/i;
const roots = ["app", "components", "lib", "public", "README.md", "package.json", "tsconfig.json", "next.config.ts"];
const ignoreDirs = new Set(["node_modules", ".next", ".git", "dist"]);
let violations = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (banned.test(content)) {
    violations.push(filePath);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      scanFile(fullPath);
    }
  }
}

for (const root of roots) {
  const resolved = path.resolve(process.cwd(), root);
  if (!fs.existsSync(resolved)) continue;
  const stats = fs.statSync(resolved);
  if (stats.isDirectory()) {
    walk(resolved);
  } else if (stats.isFile()) {
    scanFile(resolved);
  }
}

if (violations.length > 0) {
  console.error("Banned wording detected in the following files:\n");
  violations.forEach((file) => console.error(" -", path.relative(process.cwd(), file)));
  process.exit(1);
} else {
  console.log("Copy scan passed: no banned terms found.");
}
