import { spawn } from "node:child_process";

const commands = [
  {
    name: "server",
    command: "npm",
    args: ["run", "dev", "--prefix", "server"],
  },
  {
    name: "client",
    command: "npm",
    args: ["run", "dev", "--prefix", "client"],
  },
];

const childProcesses = commands.map(({ name, command, args }) => {
  const childProcess = spawn(command, args, {
    stdio: "inherit",
    shell: true,
  });

  childProcess.on("error", (error) => {
    console.error(`[${name}] failed to start:`, error);
    process.exitCode = 1;
  });

  childProcess.on("close", (code, signal) => {
    if (signal || code !== 0) {
      process.exit(code ?? 1);
    }
  });

  return childProcess;
});

const stopAll = (signal) => {
  for (const childProcess of childProcesses) {
    if (!childProcess.killed) {
      childProcess.kill(signal);
    }
  }
};

process.on("SIGINT", () => {
  stopAll("SIGINT");
});

process.on("SIGTERM", () => {
  stopAll("SIGTERM");
});
