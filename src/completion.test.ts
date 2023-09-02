import { expect, test } from 'vitest';
import * as replitai from './index';

test('non streaming completion', async () => {
  const completion = await replitai.completion({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
  });

  expect(completion.error).toBeFalsy();
  expect(completion.value).toEqual(expect.any(String));
});

test('streaming completion', async () => {
  const completion = await replitai.completionStream({
    model: 'text-bison',
    prompt:
      "Here's an essay about why the chicken crossed the road\n # The Chicken and The Road\n",
  });

  expect(completion.error).toBeFalsy();

  if (!completion.ok) {
    throw new Error('wat');
  }

  for await (const message of completion.value) {
    expect(message).toEqual(expect.any(String));
  }
});
