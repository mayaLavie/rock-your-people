import { test, expect } from "@playwright/test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// Every /images, /og, /videos path referenced from source must exist in public/.
const ROOT = path.resolve(__dirname, "..");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mjs)$/.test(n) ? [p] : [];
  });

test("every public asset referenced from app/components/lib exists", () => {
  const missing: string[] = [];
  const re = /["'`](\/(?:images|og|videos)\/[^"'`]+)["'`]/g;
  for (const dir of ["app", "components", "lib"]) {
    for (const file of walk(path.join(ROOT, dir))) {
      for (const m of readFileSync(file, "utf8").matchAll(re)) {
        const rel = decodeURIComponent(m[1]);
        if (rel.includes("${")) continue;
        if (!existsSync(path.join(ROOT, "public", rel))) missing.push(`${rel} (${path.relative(ROOT, file)})`);
      }
    }
  }
  expect(missing).toEqual([]);
});
