import * as result from './result';
import {
  makeStreamingRequest,
  makeSimpleRequest,
  RequestError,
} from './request';

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
   */
  temperature?: number;
  /**
   * The maximum number of tokens generated in the chat completion.
   * The absolute maximum value is limited by model's context size.
   */
  max_tokens?: number;

  /**
   * Allows extra model specific parameters. Consult with the documentation for which
   * parameters are available for each model.
   */
  extraParams?: Record<string, unknown>;
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
   * The role of the message.
   * Typically the completion infers the author from examples and previous
   * messages provided in the options.
   */
  role: string;
}

export interface ChatMultipleChoicesOptions extends ChatOptions {
  /**
   * Number of chat completions to generate. Minimum 1, the maximum
   * depends on the model, the returned choices will be automatically
   * adjusted to fit the model. You should not treat this as a guarantee,
   * what you will get is a number of choices up to `n`.
   */
  n: number;
}

/**
 * Gets multiple chat completions for a conversation.
 * @public
 */
export async function chatMultipleChoices(
  options: ChatMultipleChoicesOptions,
): Promise<
  result.Result<{ choices: Array<Choice> }, RequestError>
> {
  return makeSimpleRequest(
    '/v1beta2/chat',
    getRequestOptions(options),
    processJSON,
  );
}

interface Choice {
  index: number;
  message?: ChatMessage;
  delta?: ChatMessage;
  finish_reason?: string;
}

// non exauhstive
interface RawAPIResponse {
  choices: Array<Choice>;
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
  result.Result<AsyncGenerator<Choice>, RequestError>
> {
  return makeStreamingRequest(
    '/v1beta2/chat_streaming',
    getRequestOptions(options),
    (json: RawAPIResponse) => {
      const { choices } = processJSON(json);

      const choice = choices[0];

      if (!choice) {
        throw new Error('Expected at least one choice');
      }

      return choice;
    },
  );
}

/**
 * Gets a single chat message completion for a conversation.
 * @public
 */
export async function chat(
  options: ChatOptions,
): Promise<result.Result<Choice, RequestError>> {
  const res = await makeSimpleRequest(
    '/v1beta2/chat',
    getRequestOptions(options),
    processJSON,
  );

  if (!res.ok) {
    return res;
  }

  if (res.value.choices.length > 1) {
    throw new Error('Got multiple choices without choicesCount');
  }

  const choice = res.value.choices[0];

  if (!choice) {
    throw new Error('Expected at least one choice');
  }

  return result.Ok(choice);
}

function getRequestOptions(
  options: ChatOptions | ChatMultipleChoicesOptions,
): Record<string, unknown> {
  return {
    model: options.model,
    parameters: {
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      n: 'n' in options ? options.n : undefined,
      ...options.extraParams,
    },
  };
}

function processJSON(json: RawAPIResponse): {
  choices: Array<Choice>;
} {
  if (!json.choices[0]?.message) {
    throw new Error('Expected at least one message');
  }

  return {
    choices: json.choices.map(({ index, message, delta }) => ({
      index: index,
      message,
      delta,
    })),
  };
}
