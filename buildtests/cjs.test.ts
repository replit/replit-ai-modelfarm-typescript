import { expect, test } from "vitest";
const replitai = require("../dist");

test("cjs import test", async () => {
  expect(replitai).toBeTruthy();
  expect(replitai.chat).toBeTruthy();
  expect(replitai.completions).toBeTruthy();
  expect(replitai.embeddings).toBeTruthy();
});
