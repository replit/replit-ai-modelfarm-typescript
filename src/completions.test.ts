/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import { Modelfarm } from './index';

test('non streaming completion', async () => {
  const client = new Modelfarm();
  const result = await client.completions.create({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 0.5,
    max_tokens: 128,
  });

  expect(result.choices[0]?.text).toEqual(expect.any(String));
});

test('non streaming completion with extra parameters', async () => {
  const client = new Modelfarm();
  const result = await client.completions.create({
    model: 'text-bison',
    prompt: 'Complete this sequence up to 10: 1, 2, 3, 4, 5',
    temperature: 0.5,
    max_tokens: 128,
    stop: ['7', '7,'],
  });

  expect(result.choices[0]?.text).toEqual(expect.any(String));

  expect(result.choices[0]?.text.includes('6')).toBeTruthy();
  expect(result.choices[0]?.text.includes('7')).toBeFalsy();
});

test('streaming completion', async () => {
  const client = new Modelfarm();
  const result = await client.completions.create({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 0.5,
    max_tokens: 128,
    stream: true,
  });

  for await (const completion of result) {
    expect(completion.choices[0]?.text).toEqual(expect.any(String));
  }
});

test('completion with multiple choices', async () => {
  const client = new Modelfarm();
  const result = await client.completions.create({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
    temperature: 1,
    max_tokens: 128,
    n: 4,
  });

  expect(result).toMatchObject({
    choices: expect.arrayContaining([
      expect.objectContaining({
        text: expect.any(String),
      }),
    ]),
  });
  expect(result.choices.length).toBeGreaterThan(1);
});
