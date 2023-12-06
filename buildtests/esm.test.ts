import { expect, test } from "vitest";
import * as replitAiStarImport from "../dist";
import { Modelfarm as ModelfarmImport } from "../dist";

test("esm import test", async () => {
  expect(replitAiStarImport).toBeTruthy();
  expect(replitAiStarImport.Modelfarm).toBeTruthy();
  expect(ModelfarmImport).toBeTruthy();
});
