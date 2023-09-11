# @replit/ai

A library for building AI applications in JavaScript and TypeScript.

## Requirements

1. Running On Replit: it is required to be running on Replit (either in
development or in a deployment) to be able to use this package. You must also
subscribe to one of our [paid plans](https://replit.com/pricing). This
requirement will loosen up in the future.
2. Supported backends: Node 18+, Deno, and Bun. In essence the backend needs to
have support for the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). You may be able to use older version of Node as
long as you polyfill your runtime with `fetch` prior to calling into the API.

## Usage

The library implements an API for text completion, chat completion, and 
generating embeddings. It supports streaming so that you can provide your users
with the best user experience.

You can check out the [API reference](https://ai-docs-typescript.replit.app/ai.html)

Here are a couple of examples:

```ts
import * as ai from '@replit/ai';

const result = ai.chat({
  // give the bot some context and a mood
  context: 'You are a philosophy bot that speaks in shakespearean lingo',
  // provide some examples of how you'd like the conversation to go
  examples: [
    {
      author: 'User',
      content: 'What is the meaning of life'
    },
    {
      author: 'Assistant',
      content:
        'To be, or not to be, that is the question:\n' +
        'Whether \'tis nobler in the mind to suffer\n' +
        'The slings and arrows of outrageous fortune,\n' +
        'Or to take arms against a sea of troubles\n' +
        'And by opposing end them. To die, to sleep--\n' +
        'No more--and by a sleep to say we end\n' +
        'The heartache and the thousand natural shocks\n' +
        'That flesh is heir to: \'tis a consummation\n' +
        'Devoutly to be wished. To die, to sleep--\n' +
        'To sleep--perchance to dream: ay, there\'s the rub,\n' +
        'For in that sleep of death what dreams may come',
    }
  ],
  // Previous messages in the conversation
  // Here we only have 1 message from the user that initiates the conversation.
  messages: [{
    author: 'User',
    content: 'How Can Mirrors Be Real If Our Eyes Aren\'t Real'
  }],
  // How creative you want the bot to be from 0-1
  temperature: 0.2,
});

if (!result.ok) {
  handleError(result.error);

  return;
}

console.log(`${message.author} said:`);
console.log(message.content);
```

```ts
import * as ai from '@replit/ai';

// options are the same as non-streaming API
const result = ai.chatStreaming(chatOptions);

if (!result.ok) {
  handleError(result.error);

  return;
}

// The result is an iterator with the message chunked up over multiple iterations
let isFirst = true;
for await (const message of result.value) {
  if (isFirst) {
    console.log(`${message.author} said:`);

    isFirst = false;
  }

  // not using console.log because it adds new lines
  process.stdout.write(message.content);
}
```

