#!/usr/bin/env node
/** Apply schema.sql and the generated seed transaction using DATABASE_URL. */
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { Pool } from "pg";

const root = resolve(import.meta.dirname, "..");
if (!process.env.DATABASE_URL) {
  try {
    const env = await readFile(resolve(root, ".env.local"), "utf8");
    const match = env.match(/^DATABASE_URL=(.*)$/m);
    if (match) process.env.DATABASE_URL = match[1].trim().replace(/^['"]|['"]$/g, "");
  } catch {
    /* .env.local is optional */
  }
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const seedSql = await new Promise((resolveSeed, reject) => {
  const child = spawn(process.execPath, ["db/seed.mjs"], { cwd: root });
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.on("error", reject);
  child.on("exit", (code) =>
    code === 0
      ? resolveSeed(output)
      : reject(new Error(`Seed generation failed with exit code ${code}`)),
  );
});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(await readFile(resolve(root, "db/schema.sql"), "utf8"));
  await pool.query(seedSql);
  console.log("Database schema and sample data applied successfully.");
} finally {
  await pool.end();
}
