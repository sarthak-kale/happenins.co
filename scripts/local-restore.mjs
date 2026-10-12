// Loads the bundled demo data (prisma/seed/local-demo.sql) into the LOCAL development database.
//   npm run local:up        # start Postgres + Redis first
//   npm run local:restore   # schema (migrate deploy) + demo users/events; use -- --force to replace existing data
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");
const container = "happenins-local-postgres-1";

function fail(message) { console.error(`local:restore: ${message}`); process.exit(1); }
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts });
  if (r.status !== 0) fail(`${cmd} ${args.slice(0, 3).join(" ")} failed: ${(r.stderr || r.stdout || "").trim().split("\n").slice(-3).join(" | ")}`);
  return r.stdout;
}

const url = new URL(process.env.DATABASE_URL || "postgresql://invalid/invalid");
// RESTORE_DB_NAME lets you load the demo data into another local database (must be named happenins_*).
const dbName = process.env.RESTORE_DB_NAME || "happenins_local";
if (!/^happenins_[a-z0-9_]+$/.test(dbName)) fail("RESTORE_DB_NAME must look like happenins_<name>.");
if (url.hostname !== "127.0.0.1" || url.port !== "5433") {
  fail("refusing to run: DATABASE_URL must point at the isolated local Postgres on 127.0.0.1:5433.");
}
url.pathname = `/${dbName}`;
const user = decodeURIComponent(url.username);
const psql = (sql, input) => run("docker", ["exec", ...(input ? ["-i"] : []), container, "psql", "-U", user, "-d", dbName, "-v", "ON_ERROR_STOP=1", "-At", ...(input ? [] : ["-c", sql])], input ? { input } : {});

try { run("docker", ["exec", container, "pg_isready", "-U", user]); } catch { fail("local Postgres is not running. Start it with: npm run local:up"); }

console.log("Applying migrations...");
run("npx", ["prisma", "migrate", "deploy"], { stdio: "pipe", env: { ...process.env, DATABASE_URL: url.toString() } });

const dump = readFileSync(resolve(root, "prisma/seed/local-demo.sql"), "utf8");
const anchor = dump.match(/^-- anchor: (.+)$/m)?.[1];
if (!anchor) fail("prisma/seed/local-demo.sql has no anchor line; regenerate it with npm run demo:build-dump.");

const foreign = Number(psql(`SELECT count(*) FROM "User" WHERE id NOT LIKE 'local\\_%' AND id NOT LIKE 'demo\\_%'`).trim());
const existing = Number(psql(`SELECT count(*) FROM "User"`).trim());
if (existing > 0 && foreign > 0 && !force) {
  fail(`the database already holds ${foreign} non-demo user(s). Re-run with --force to REPLACE all local data: npm run local:restore -- --force`);
}

console.log("Replacing local data with the demo dataset...");
const tables = psql(`SELECT string_agg(quote_ident(tablename), ', ') FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'`).trim();
psql(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
psql("", dump);

// Move every date so the events are upcoming again, however old the dump is.
const deltaMs = Date.now() - new Date(anchor).getTime();
const iv = `interval '${Math.round(deltaMs / 1000)} seconds'`;
psql(`BEGIN;
UPDATE "Event" SET "startsAt" = "startsAt" + ${iv}, "endsAt" = "endsAt" + ${iv};
UPDATE "Booking" SET "reservedUntil" = "reservedUntil" + ${iv};
UPDATE "PromoCode" SET "expiresAt" = "expiresAt" + ${iv} WHERE "expiresAt" IS NOT NULL;
UPDATE "StaffScanner" SET "expiresAt" = "expiresAt" + ${iv} WHERE "expiresAt" IS NOT NULL;
UPDATE "TicketTransfer" SET "expiresAt" = "expiresAt" + ${iv};
UPDATE "Ticket" SET "scannedAt" = "scannedAt" + ${iv} WHERE "scannedAt" IS NOT NULL;
COMMIT;`.replace(/\n/g, " "));

// Drop stale Redis stock/lock/cache entries from earlier runs (best effort; Redis may be off).
const redis = (...a) => spawnSync("redis-cli", ["--raw", "-h", "127.0.0.1", "-p", "6380", ...a], { encoding: "utf8" });
if (redis("PING").stdout?.trim() === "PONG") {
  for (const pattern of ["*inventory:tier:*", "*lock:seat:*", "*events:list:*", "*events:slug:*"]) {
    const keys = (redis("--scan", "--pattern", pattern).stdout || "").split("\n").filter(Boolean);
    if (keys.length) redis("DEL", ...keys);
  }
  console.log("Cleared stale Redis inventory/cache keys.");
}

const counts = psql(`SELECT (SELECT count(*) FROM "User") || ' users, ' || (SELECT count(*) FROM "Event") || ' events, ' || (SELECT count(*) FROM "Ticket") || ' tickets'`).trim();
console.log(`Done: ${counts}.\nLogin with password local-demo-2026 as attendee@happenins.test, organizer@happenins.test or admin@happenins.test.`);
