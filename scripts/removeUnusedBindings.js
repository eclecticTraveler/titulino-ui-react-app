#!/usr/bin/env node

/**
 * Non-destructive helper:
 * - Runs ESLint JSON output for source JS files
 * - Reports all no-unused-vars findings grouped by file
 *
 * This script intentionally does not auto-edit files.
 */
const { execSync } = require("child_process");

const TARGET_RULE = "no-unused-vars";

function run() {
  let raw = "[]";
  try {
    raw = execSync("npx eslint src --ext .js -f json", { encoding: "utf8" });
  } catch (error) {
    raw = error.stdout || "[]";
  }

  let results = [];
  try {
    results = JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse ESLint JSON output.");
    process.exit(1);
  }

  const grouped = new Map();
  let total = 0;

  for (const fileResult of results) {
    const filePath = fileResult.filePath || "";
    const hits = (fileResult.messages || []).filter((m) => m.ruleId === TARGET_RULE);
    if (hits.length === 0) continue;
    grouped.set(filePath, hits);
    total += hits.length;
  }

  if (total === 0) {
    console.log("No no-unused-vars warnings found.");
    return;
  }

  console.log(`Found ${total} no-unused-vars warnings across ${grouped.size} files.\n`);
  for (const [filePath, messages] of grouped.entries()) {
    console.log(filePath);
    for (const m of messages) {
      console.log(`  L${m.line}:C${m.column}  ${m.message}`);
    }
    console.log("");
  }
}

run();
