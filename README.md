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

The library is available on NPM as `@replit/ai`.

You can check out the [API reference](https://ai-docs-typescript.replit.app/ai.html)

[Here is a simple command line chat demo using this library](https://replit.com/@masfrost/replitai-demo)
