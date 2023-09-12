/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import { expect, test } from 'vitest';
import * as replitai from './index';

test('non streaming chat', async () => {
  const result = await replitai.chat({
    model: 'chat-bison',
    messages: [{ content: 'what is the meaning of life', author: 'user' }],
    temperature: 0.5,
    maxOutputTokens: 128,
  });

  expect(result.error).toBeFalsy();
  expect(result.value).toMatchObject({
    message: {
      content: expect.any(String),
      author: expect.any(String),
    },
  });
});

test('non streaming chat with extra parameters', async () => {
  const result = await replitai.chat({
    model: 'chat-bison',
    messages: [{ content: 'What is the meaning of life? ', author: 'user' }],
    temperature: 0.0,
    maxOutputTokens: 1024,
    extraParams: {
      stopSequences: ['life'],
    },
  });

  expect(result.error).toBeFalsy();
  expect(result.value).toMatchObject({
    message: {
      content: expect.any(String),
      author: expect.any(String),
    },
  });

  // Check if the message content "life"
  const messageContent = result.value.message.content;
  expect(messageContent.includes('life')).toBeFalsy();
});

test('streaming chat', async () => {
  const result = await replitai.chatStream({
    model: 'chat-bison',
    messages: [{ content: 'what is the meaning of life', author: 'user' }],
    temperature: 0.5,
    maxOutputTokens: 128,
  });

  expect(result.error).toBeFalsy();

  if (!result.ok) {
    throw new Error('wat');
  }

  for await (const { message } of result.value) {
    expect(message).toMatchObject({
      content: expect.any(String),
      author: expect.any(String),
    });
  }
});

test('chat with multiple choices', async () => {
  const result = await replitai.chatMultipleChoices({
    model: 'chat-bison',
    messages: [{ content: 'what is the meaning of life', author: 'user' }],
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
        message: expect.objectContaining({
          content: expect.any(String),
          author: expect.any(String),
        }),
      },
    ]),
  });
  expect(result.value.choices.length > 1).toBeTruthy();
});
