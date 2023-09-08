/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import * as replitai from './index';

test('embedding', async () => {
  const completion = await replitai.embedding({
    model: 'textembedding-gecko',
    content: 'how to quit in vim',
  });

  expect(completion.error).toBeFalsy();
  expect(completion.value?.embeddings).toMatchObject({
    values: expect.arrayContaining([expect.any(Number)]),
    truncated: expect.any(Boolean),
  });
});
