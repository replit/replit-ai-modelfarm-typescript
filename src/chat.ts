import all from 'it-all';
import { pipe } from 'it-pipe';
import * as result from './result';
import streamToIterator from 'browser-readablestream-to-it';

const endpoint = 'http://staging-modelfarm.ai.gcp.replit.com';
const nonStreamingUrl = `${endpoint}/chat`;
const streamingUrl = `${endpoint}/chat_streaming`;

interface Message {
  content: string;
  author: string;
}

// TODO: Add more?
type Model = 'chat-bison';

interface Input {
  model: Model;
  context?: string;
  examples?: Array<Message>;
  messages: Array<Message>;
  // temperature?: number;
  streaming?: boolean;
}

interface StreamingInput extends Input {
  streaming: true;
}

interface NonStreamingInput extends Input {
  streaming: false;
}

interface Message {
  content: string;
  author: string;
}

interface ChatError {
  message: string;
  statusCode: number;
}

type StreamingChatResponse = result.Result<AsyncGenerator<Message>, ChatError>;
type NonStreamingChatResponse = result.Result<Message, ChatError>;

interface RestBody {
  model: Model;
  parameters: {
    prompts: Array<{
      context?: string;
      examples?: Array<Message>;
      messages: Array<Message>;
    }>;
  };
}


export default async function chat(
  input: NonStreamingInput,
): Promise<NonStreamingChatResponse>;
export default async function chat(
  input: StreamingInput,
): Promise<StreamingChatResponse>;
export default async function chat(
  input: Input,
): Promise<StreamingChatResponse | NonStreamingChatResponse> {
  let response = await fetch(input.streaming ? streamingUrl : nonStreamingUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer $AUTH_TOKEN', // TODO auth
    },
    body: JSON.stringify({
      model: input.model,
      parameters: {
        prompts: [
          {
            context: input.context,
            examples: input.examples,
            messages: input.messages
          }
        ]
      }
    }),
  });

  if (response.status !== 200) {
    return result.Err({
      message: await response.text(),
      statusCode: response.status,
    });
  }

  if (!response.body) {
    return result.Err({
      message: 'No response body',
      statusCode: response.status,
    });
  }

  const iterator = pipe(
    streamToIterator(response.body),
    async function*(source) {
      const decoder = new TextDecoder('utf-8');

      for await (const v of source) {
        yield decoder.decode(v, { stream: true });
      }

      return;
    },
    async function*(source): AsyncGenerator<Message> {
      for await (const v of source) {
        const json = JSON.parse(v);

        yield {
          content: json.responses[0].candidates[0].message.content,
          author: json.responses[0].candidates[0].message.author,
        };
      }
    },
  );

  if (input.streaming) {
    return result.Ok(iterator);
  }

  const allMessages = await all(iterator);

  let author = allMessages[0]?.author;
  if (!author) {
    author = "assistant"
  }

  return result.Ok({
    content: allMessages.reduce((acc, { content }) => acc + content, ''),
    author,
  });
}
