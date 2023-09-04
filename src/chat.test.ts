import { expect, test } from 'vitest'
import * as replitai from './index';

test('non streaming chat', async () => {
  const chat = await replitai.chat({
    model: "chat-bison",
    context: "You are a meme bot",
    messages: [
      { content: "what is the meaning of life", author: "user" }
    ],
    streaming: false
  });

  expect(chat.error).toBeFalsy();
  expect(chat.value).toMatchObject({
    content: expect.any(String),
    author: expect.any(String)
  });
})


test('streaming chat', async () => {
  const chat = await replitai.chat({
    model: "chat-bison",
    context: "You are a meme bot",
    messages: [
      { content: "what is the meaning of life", author: "user" }
    ],
    streaming: true
  });

  expect(chat.error).toBeFalsy();

  if (!chat.ok) {
    throw new Error('wat')
  }
  
  for await (const message of chat.value) {
    expect(message).toMatchObject({
      content: expect.any(String),
      author: expect.any(String)
    });  
  }
})
