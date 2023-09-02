import { expect, test } from "vitest";
import * as replitAiStarImport from "../dist";
import { chat as replitChatImport } from "../dist";

test("esm import test", async () => {
  expect(replitAiStarImport).toBeTruthy();
  expect(replitAiStarImport.chat).toBeTruthy();
  expect(replitChatImport).toBeTruthy();
});
