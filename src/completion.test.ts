import { expect, test } from 'vitest';
import * as replitai from './index';

test('non streaming completion', async () => {
  const result = await replitai.completion({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
  });

  expect(result.error).toBeFalsy();
  expect(result.value?.completion).toEqual(expect.any(String));
});

test('streaming completion', async () => {
  const result = await replitai.completionStream({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
  });

  expect(result.error).toBeFalsy();

  if (!result.ok) {
    throw new Error('wat');
  }

  for await (const { completion } of result.value) {
    expect(completion).toEqual(expect.any(String));
  }
});
