/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import { Modelfarm } from './index';

test('embed', async () => {
  const client = new Modelfarm();
  const embedding = await client.embeddings.create({
    model: 'textembedding-gecko',
    input: ['how to quit in vim', 'how to quit in emacs'],
  });

  expect(embedding.data.length).toBe(2);
  for (const idx of [0, 1]) {
    expect(embedding.data[idx]).toMatchObject(
      expect.objectContaining({
        index: idx,
        embedding: expect.arrayContaining([expect.any(Number)]),
      }),
    );
  }
});
