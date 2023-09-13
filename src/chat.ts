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
   * This can be instructions for the model on how it should respond
   * or information it uses to generate a response. This can also be
   * used to restrict the model to a specific topic.
   */
  context?: string;
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
  maxOutputTokens?: number;

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
   * The author of the message.
   * Typically the completion infers the author from examples and previous
   * messages provided in the options.
   */
  author: string;
}

export interface ChatMultipleChoicesOptions extends ChatOptions {
  /**
   * Number of chat completions to generate. Minimum 1, the maximum
   * depends on the model, the returned choices will be automatically
   * adjusted to fit the model. You should not treat this as a guarantee,
   * what you will get is a number of choices up to `choicesCount`.
   */
  choicesCount: number;
}

/**
 * Gets multiple chat completions for a conversation.
 * @public
 */
export async function chatMultipleChoices(
  options: ChatMultipleChoicesOptions,
): Promise<
  result.Result<{ choices: Array<{ message: ChatMessage }> }, RequestError>
> {
  return makeSimpleRequest(
    '/v1beta/chat',
    getRequestOptions(options),
    processJSON,
  );
}

// non exauhstive
interface RawAPIResponse {
  responses: Array<{
    candidates: Array<{
      message: ChatMessage;
    }>;
  }>;
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
  return makeStreamingRequest(
    '/v1beta/chat_streaming',
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
): Promise<result.Result<{ message: ChatMessage }, RequestError>> {
  const res = await makeSimpleRequest(
    '/v1beta/chat',
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
      prompts: [
        {
          context: options.context ?? '',
          messages: options.messages,
        },
      ],
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
      candidateCount:
        'choicesCount' in options ? options.choicesCount : undefined,
      ...options.extraParams,
    },
  };
}

function processJSON(json: RawAPIResponse): {
  choices: Array<{ message: ChatMessage }>;
} {
  if (!json.responses[0]?.candidates[0]?.message) {
    throw new Error('Expected at least one message');
  }

  return {
    choices: json.responses[0].candidates.map(({ message }) => ({
      message: {
        content: message.content,
        author: message.author,
      },
    })),
  };
}
