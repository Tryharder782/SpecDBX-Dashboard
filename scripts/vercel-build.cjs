const fs = require("fs");
const path = require("path");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeRemove(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function exists(target) {
  return fs.existsSync(target);
}

const nextOut = path.join(".next");
const publicNextOut = path.join("public", ".next");
const publicNodeModules = path.join("public", "node_modules");
const styledJsxSrc = path.join("node_modules", "styled-jsx");
const styledJsxDst = path.join("public", "node_modules", "styled-jsx");

safeRemove(publicNextOut);
copyDir(nextOut, publicNextOut);

safeRemove(publicNodeModules);

try {
  // Vercel runs on Linux, symlink keeps artifact small and satisfies traced paths.
  fs.symlinkSync("../node_modules", publicNodeModules, "dir");
} catch (err) {
  // Fallback for environments where symlink creation is restricted.
  ensureDir(publicNodeModules);
  if (exists(styledJsxSrc)) {
    copyDir(styledJsxSrc, styledJsxDst);
  }
}

if (!exists(styledJsxDst) && exists(styledJsxSrc)) {
  ensureDir(publicNodeModules);
  copyDir(styledJsxSrc, styledJsxDst);
}

