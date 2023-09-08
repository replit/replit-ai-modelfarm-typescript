import all from 'it-all';
import * as result from './result';
import makeRequest, { RequestError } from './request';

/**
 * Available models for chat completion
 * @public
 */
export type ChatModel = 'chat-bison';

/**
 * Options for chat request
 * @public
 */
export interface ChatOptions {
  /**
   * Specifies the model to use
   */
  model: ChatModel;
  /**
   * Previous messages in the conversation
   */
  messages: Array<ChatMessage>;
  /**
   * Sampling temperature between 0 and 1. The higher the value, the more
   * likely the model will produce a completion that is more creative and
   * imaginative.
   * Defaults to 0
   */
  temperature?: number;
  /**
   * The maximum number of tokens generated in the chat completion.
   * The absolute maximum value is limited by model's context size.
   * Defaults to 1024
   */
  maxOutputTokens?: number;
}

/**
 * A message in a chat conversation
 * @public
 */
export interface ChatMessage {
  /**
   * The content of the message
   */
  content: string;
  /**
   * The author of the message.
   * Typically the completion infers the author from examples and previous
   * messages provided in the options.
   */
  author: string;
}

/**
 * Gets a single chat message completion for a conversation.
 * The result contains an iterator of messages, please note that this would be
 * a *single message* that has the contents chunked up.
 * @public
 */
export async function chatStream(
  options: ChatOptions,
): Promise<
  result.Result<AsyncGenerator<{ message: ChatMessage }>, RequestError>
> {
  return chatImpl(options, '/chat_streaming');
}

/**
 * Gets a single chat message completion for a conversation.
 * @public
 */
export async function chat(
  options: ChatOptions,
): Promise<result.Result<{ message: ChatMessage }, RequestError>> {
  const res = await chatImpl(options, '/chat');

  if (!res.ok) {
    return res;
  }

  const allMessages = await all(res.value);

  let author = allMessages[0]?.message?.author;
  if (!author) {
    author = 'assistant';
  }

  return result.Ok({
    message: {
      content: allMessages.reduce(
        (acc, { message: { content } }) => acc + content,
        '',
      ),
      author,
    },
  });
}

// non exauhstive
interface Response {
  responses: Array<{
    candidates: Array<{
      message: ChatMessage;
    }>;
  }>;
}

async function chatImpl(
  options: ChatOptions,
  urlPath: string,
): Promise<
  result.Result<AsyncGenerator<{ message: ChatMessage }>, RequestError>
> {
  return makeRequest(
    urlPath,
    {
      model: options.model,
      parameters: {
        prompts: [
          {
            context: '',
            messages: options.messages,
          },
        ],
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens,
      },
    },
    (json: Response): { message: ChatMessage } => {
      const message = json.responses[0]?.candidates[0]?.message;

      if (!message) {
        throw new Error('Expected message');
      }

      return {
        message: {
          content: message.content,
          author: message.author,
        },
      };
    },
  );
}
