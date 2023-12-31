/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import * as replitai from './index';

test('non streaming completion', async () => {
  const result = await replitai.complete({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 0.5,
    maxOutputTokens: 128,
  });

  expect(result.error).toBeFalsy();
  expect(result.value?.completion).toEqual(expect.any(String));
});

test('non streaming completion with extra parameters', async () => {
  const result = await replitai.complete({
    model: 'text-bison',
    prompt: 'Complete this sequence up to 10: 1, 2, 3, 4, 5',
    temperature: 0.5,
    maxOutputTokens: 128,
    extraParams: {
      stopSequences: ['7', '7,'],
    },
  });

  expect(result.error).toBeFalsy();
  expect(result.value?.completion).toEqual(expect.any(String));

  expect(result.value?.completion.includes('6')).toBeTruthy();
  expect(result.value?.completion.includes('7')).toBeFalsy();
});

test('streaming completion', async () => {
  const result = await replitai.completeStream({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 0.5,
    maxOutputTokens: 128,
  });

  expect(result.error).toBeFalsy();

  if (!result.ok) {
    throw new Error('wat');
  }

  for await (const { completion } of result.value) {
    expect(completion).toEqual(expect.any(String));
  }
});

test('completion with multiple choices', async () => {
  const result = await replitai.completeMultipleChoices({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 1,
    maxOutputTokens: 128,
    choicesCount: 4,
  });

  expect(result.error).toBeFalsy();

  if (!result.ok) {
    throw new Error('wat');
  }

  expect(result.value).toMatchObject({
    choices: expect.arrayContaining([
      {
        completion: expect.any(String),
      },
    ]),
  });
  expect(result.value.choices.length > 1).toBeTruthy();
});
