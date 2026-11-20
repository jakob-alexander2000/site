import { execSync } from "node:child_process";

const patch = "node_modules/.bin/patch-package";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

try {
  run(patch);
} catch {
  // A cached install can already hold an older patch. Start from the published package.
  run("rm -rf node_modules/three");
  run("npm install three@0.170.0 --ignore-scripts --no-save --no-package-lock");
  run(patch);
}
