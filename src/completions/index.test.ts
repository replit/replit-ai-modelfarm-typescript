/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import * as replitai from '../index';

async function fromAsync<T>(
  source: AsyncIterable<T> | undefined,
): Promise<Array<T>> {
  const items = Array<T>();
  if (source) {
    for await (const item of source) {
      items.push(item);
    }
  }
  return items;
}

test('non streaming completion', async () => {
  const { error, value: result } = await replitai.completions.create({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 0.5,
    max_tokens: 128,
  });

  expect(error).toBeFalsy();
  expect(result).not.toBeUndefined();

  expect(result?.choices[0]?.text).toEqual(expect.any(String));
});

test('non streaming completion with extra parameters', async () => {
  const { error, value: result } = await replitai.completions.create({
    model: 'text-bison',
    prompt: 'Complete this sequence up to 10: 1, 2, 3, 4, 5',
    temperature: 0.5,
    max_tokens: 128,
    stop: ['7', '7,'],
  });

  expect(error).toBeFalsy();
  expect(result).not.toBeUndefined();

  expect(result?.choices[0]?.text).toEqual(expect.any(String));

  expect(result?.choices[0]?.text.includes('6')).toBeTruthy();
  expect(result?.choices[0]?.text.includes('7')).toBeFalsy();
});

test('streaming completion', async () => {
  const { error, value: results } = await replitai.completions.create({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 0.5,
    max_tokens: 128,
    stream: true,
  });

  expect(error).toBeFalsy();
  expect(results).not.toBeUndefined();

  const responses = await fromAsync(results);

  for await (const completion of responses) {
    expect(completion.choices[0]?.text).toEqual(expect.any(String));
  }
});

test('completion with multiple choices', async () => {
  const { error, value: result } = await replitai.completions.create({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 1,
    max_tokens: 128,
    n: 4,
  });

  expect(error).toBeFalsy();
  expect(result).not.toBeUndefined();

  expect(result).toMatchObject({
    choices: expect.arrayContaining([
      expect.objectContaining({
        text: expect.any(String),
      }),
    ]),
  });
  expect(result?.choices.length).toBeGreaterThan(1);
});
