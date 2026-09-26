#!/usr/bin/env node
import { pbkdf2Sync, randomBytes } from "node:crypto";

const ITERATIONS = readIterations(process.argv.slice(2));
const password = process.env.RLIST_PASSWORD ?? (await promptHidden("password: "));

if (!password) {
  console.error("no password provided");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");

console.log(`ADMIN_PASSWORD_HASH=pbkdf2:sha256:${ITERATIONS}:${salt.toString("base64url")}:${hash.toString("base64url")}`);

function readIterations(args) {
  const index = args.indexOf("--iterations");
  if (index === -1) return 100000;
  const value = Number(args[index + 1]);
  if (!Number.isInteger(value) || value <= 0) {
    console.error("--iterations must be a positive integer");
    process.exit(1);
  }
  return value;
}

function promptHidden(question) {
  if (!process.stdin.isTTY) {
    return new Promise((resolve) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        data += chunk;
      });
      process.stdin.on("end", () => resolve(data.trim()));
    });
  }

  return new Promise((resolve) => {
    const input = process.stdin;
    const output = process.stdout;
    output.write(question);
    const wasRaw = input.isRaw;
    input.setRawMode(true);
    input.resume();

    let value = "";
    const onData = (chunk) => {
      const text = chunk.toString("utf8");
      if (text.includes("\u0003")) process.exit(1);
      if (text.includes("\r") || text.includes("\n")) {
        input.setRawMode(wasRaw ?? false);
        input.removeListener("data", onData);
        input.pause();
        output.write("\n");
        resolve(value);
        return;
      }
      if (text === "\u007f" || text === "\b") {
        value = value.slice(0, -1);
        return;
      }
      value += text;
    };

    input.on("data", onData);
  });
}
