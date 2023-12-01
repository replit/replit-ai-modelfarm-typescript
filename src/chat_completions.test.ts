/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import { Modelfarm } from './index';

async function fromAsync<T>(source: AsyncIterable<T>): Promise<Array<T>> {
  const items = Array<T>();
  for await (const item of source) {
    items.push(item);
  }
  return items;
}

test('non streaming chat', async () => {
  const client = new Modelfarm();
  const result = await client.chat.completions.create({
    model: 'chat-bison',
    messages: [
      {
        role: 'USER',
        content: 'What is the meaning of life?',
      },
    ],
    temperature: 0.5,
    max_tokens: 128,
  });

  expect(result.choices.length).toBe(1);

  const choice = result.choices[0];

  expect(choice?.message.content?.length).toBeGreaterThan(10);
});

test('non streaming chat with extra parameters', async () => {
  const client = new Modelfarm();
  const result = await client.chat.completions.create({
    model: 'chat-bison',
    messages: [
      {
        role: 'USER',
        content: 'What is the meaning of life?',
      },
    ],
    temperature: 0.0,
    max_tokens: 1024,
    stop: ['\n'],
    top_p: 0.1,
    provider_extra_parameters: {
      top_k: 20,
    },
  });

  expect(result.choices.length).toBe(1);

  const choice = result.choices[0];

  expect(choice?.message.content?.length).toBeGreaterThan(10);
});

test('streaming chat', async () => {
  const client = new Modelfarm();
  const results = await client.chat.completions.create({
    model: 'chat-bison',
    messages: [
      {
        role: 'USER',
        content: 'What is the meaning of life?',
      },
    ],
    temperature: 0.5,
    max_tokens: 128,
    stream: true,
  });

  const responses = await fromAsync(results);

  for await (const result of responses) {
    expect(result.choices.length).toBe(1);
    const choice = result.choices[0];
    expect(choice?.delta.content?.length).toBeGreaterThanOrEqual(1);
  }
});

test('chat with multiple choices', async () => {
  const client = new Modelfarm();
  const result = await client.chat.completions.create({
    model: 'chat-bison',
    messages: [
      {
        role: 'USER',
        content: 'What is the meaning of life?',
      },
    ],
    temperature: 1,
    max_tokens: 128,
    n: 4,
  });

  expect(result).toMatchObject(
    expect.objectContaining({
      choices: expect.arrayContaining([
        expect.objectContaining({
          message: expect.objectContaining({
            content: expect.any(String),
            role: expect.any(String),
          }),
        }),
      ]),
    }),
  );
  expect(result.choices.length).toBeGreaterThan(1);
});
