/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import * as replitai from './index';

test('embed', async () => {
  const completion = await replitai.embed({
    model: 'textembedding-gecko',
    content: ['how to quit in vim', 'how to quit in emacs'],
  });

  expect(completion.error).toBeFalsy();
  expect(completion.value?.embeddings).toHaveLength(2);
  expect(completion.value?.embeddings[0]).toMatchObject({
    values: expect.arrayContaining([expect.any(Number)]),
    truncated: expect.any(Boolean),
  });
});
