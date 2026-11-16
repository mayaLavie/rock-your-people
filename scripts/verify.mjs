// npm run verify = lint (reported, non-blocking) + build + test:e2e.
// Lint failures are printed in the summary but do NOT abort; build/e2e failures do.
import { spawnSync } from "node:child_process";

const run = (label, cmd) => {
  console.log(`\n=== ${label}: ${cmd} ===`);
  const r = spawnSync(cmd, { shell: true, stdio: "inherit" });
  return r.status === 0;
};

const lint = run("lint", "npm run lint");
const build = run("build", "npm run build");
// build already done above; webServer rebuilds only if it has to start the server itself.
const e2e = build && run("test:e2e", "npm run test:e2e");

console.log("\n=== verify summary ===");
console.log(`lint : ${lint ? "PASS" : "FAIL (non-blocking)"}`);
console.log(`build: ${build ? "PASS" : "FAIL"}`);
console.log(`e2e  : ${build ? (e2e ? "PASS" : "FAIL") : "SKIPPED"}`);
process.exit(build && e2e ? 0 : 1);
