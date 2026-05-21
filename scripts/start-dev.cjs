const { spawn } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

const processes = [
  {
    name: "backend",
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "dev"],
    cwd: path.join(repoRoot, "backend"),
  },
  {
    name: "frontend",
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["start"],
    cwd: path.join(repoRoot, "frontend"),
  },
];

const children = new Map();
let shuttingDown = false;

const stopAll = (exitCode) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children.values()) {
    child.kill();
  }

  process.exit(exitCode);
};

for (const proc of processes) {
  const child = spawn(proc.command, proc.args, {
    cwd: proc.cwd,
    stdio: "inherit",
    shell: false,
  });

  children.set(proc.name, child);

  child.on("exit", (code, signal) => {
    children.delete(proc.name);

    if (shuttingDown) return;

    if (signal) {
      stopAll(1);
      return;
    }

    if (code !== 0) {
      stopAll(code || 1);
      return;
    }

    if (children.size === 0) {
      process.exit(0);
    }
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
