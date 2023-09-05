import { expect, test } from "vitest";
import replitAiDefaultImport from "../dist";
import * as replitAiStarImport from "../dist";
import { chat as replitChatImport } from "../dist";

test("esm import test", async () => {
  expect(replitAiDefaultImport).toBeTruthy();
  expect(replitAiDefaultImport.chat).toBeTruthy();
  expect(replitAiStarImport).toBeTruthy();
  expect(replitAiStarImport.chat).toBeTruthy();
  expect(replitChatImport).toBeTruthy();
});
