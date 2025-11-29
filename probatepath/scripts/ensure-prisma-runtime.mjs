import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const runtimeFiles = [
  { name: "library.js", content: "module.exports = require('./client.js');\n" },
  { name: "library.mjs", content: "export * from './client.mjs';\nexport { default } from './client.mjs';\n" },
  { name: "library.d.ts", content: "export * from './client';\n" },
  { name: "library.d.mts", content: "export * from './client.d.mts';\n" },
];

export function ensurePrismaRuntime() {
  const runtimeDir = path.resolve(process.cwd(), "node_modules/@prisma/client/runtime");
  if (!fs.existsSync(runtimeDir)) {
    return false;
  }
  let modified = false;
  for (const file of runtimeFiles) {
    const targetPath = path.join(runtimeDir, file.name);
    if (!fs.existsSync(targetPath) || fs.readFileSync(targetPath, "utf8") !== file.content) {
      fs.writeFileSync(targetPath, file.content, "utf8");
      modified = true;
    }
  }
  return modified;
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  ensurePrismaRuntime();
}
