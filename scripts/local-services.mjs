import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const redisDirectory = join(projectRoot, ".local", "redis");
const redisPort = "6380";
const composeArgs = ["compose", "--file", "compose.local.yml"];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    timeout: 90000,
    ...options,
  });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message || result.stderr?.trim() || `${command} failed`);
  }
  return result.stdout || "";
}

function redisCommand(...args) {
  return run("redis-cli", ["--raw", "-h", "127.0.0.1", "-p", redisPort, ...args]);
}

function isRedisRunning() {
  try {
    return redisCommand("PING").trim() === "PONG";
  } catch {
    return false;
  }
}

function assertProjectRedis() {
  const configuredDirectory = redisCommand("CONFIG", "GET", "dir").trim().split("\n")[1];
  if (configuredDirectory !== redisDirectory) {
    throw new Error(`Port ${redisPort} belongs to another Redis instance; it was left unchanged.`);
  }
}

try {
  const action = process.argv[2] || "up";
  if (!["up", "stop"].includes(action)) {
    throw new Error("Usage: node scripts/local-services.mjs up|stop");
  }
  run("docker", ["info", "--format", "{{.ServerVersion}}"]);
  run("redis-cli", ["--version"]);

  if (action === "stop") {
    if (isRedisRunning()) {
      assertProjectRedis();
      redisCommand("SHUTDOWN", "SAVE");
    }
    run("docker", [...composeArgs, "stop", "postgres"], { stdio: "inherit" });
    console.log("Local services stopped. Database and Redis data were preserved.");
  } else {
    run("redis-server", ["--version"]);
    if (isRedisRunning()) assertProjectRedis();
    run("docker", [...composeArgs, "up", "-d", "--pull", "missing", "--wait", "--wait-timeout", "60", "postgres"], { stdio: "inherit" });
    if (!isRedisRunning()) {
      mkdirSync(redisDirectory, { recursive: true });
      run("redis-server", [
        "--bind", "127.0.0.1", "--port", redisPort, "--protected-mode", "yes",
        "--dir", redisDirectory, "--appendonly", "yes", "--daemonize", "yes",
        "--pidfile", join(redisDirectory, "redis.pid"),
        "--logfile", join(redisDirectory, "redis.log"),
      ]);
      redisCommand("PING");
    }
    console.log("PostgreSQL: 127.0.0.1:5433 | project Redis: 127.0.0.1:6380");
    console.log("Existing images and tools were reused; only a missing PostgreSQL image is pulled.");
  }
} catch (error) {
  console.error(`Local setup failed: ${error.message}`);
  console.error("Ensure Docker Desktop is running and redis-server/redis-cli are installed.");
  process.exitCode = 1;
}
