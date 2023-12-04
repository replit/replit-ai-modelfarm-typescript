import { Modelfarm } from './index';
import { makeStreamingRequest, makeSimpleRequest } from './request';
import { Usage, GoogleMetadata } from './structs';

export class Completions {
  _client: Modelfarm;

  constructor(client: Modelfarm) {
    this._client = client;
  }

  /**
   * Gets a single chat message completion for a conversation.
   * @public
   */
  async create(
    options: ChatOptionParamsNonStream,
  ): Promise<ChatCompletionResponse>;
  async create(
    options: ChatOptionParamsStream,
  ): Promise<AsyncGenerator<ChatCompletionStreamChunkResponse>>;
  async create(
    options: ChatOptionParams,
  ): Promise<
    ChatCompletionResponse | AsyncGenerator<ChatCompletionStreamChunkResponse>
  > {
    let res;
    if (options.stream) {
      res = await makeStreamingRequest<ChatCompletionStreamChunkResponse>(
        'v1beta2/chat/completions',
        { ...options },
      );
    } else {
      res = await makeSimpleRequest<ChatCompletionResponse>(
        'v1beta2/chat/completions',
        { ...options },
      );
    }
    if (res.ok) {
      return res.value;
    }
    throw new Error(res.error.message);
  }
}

export class Chat {
  completions: Completions;

  constructor(client: Modelfarm) {
    this.completions = new Completions(client);
  }
}

interface FunctionCall {
  name: string;
  arguments: string;
}

interface ToolCall {
  id: string;
  type: string;
  function: FunctionCall;
}

interface ChoiceMessage {
  content?: string;
  role?: string;
  tool_calls?: Array<ToolCall>;
}

interface BaseChoice {
  index: number;
  finish_reason?: string;
  metadata?: Record<string, unknown>;
}

interface Choice extends BaseChoice {
  message: ChoiceMessage;
}

interface ChoiceStream extends BaseChoice {
  delta: ChoiceMessage;
}

interface BaseChatCompletionResponse {
  id: string;
  choices: Array<BaseChoice>;
  model: string;
  created?: number;
  object?: string;
  usage?: Usage;
  metadata?: GoogleMetadata;
}

export interface ChatCompletionResponse extends BaseChatCompletionResponse {
  choices: Array<Choice>;
  object?: string;
}

export interface ChatCompletionStreamChunkResponse
  extends BaseChatCompletionResponse {
  choices: Array<ChoiceStream>;
  object?: string;
}

export interface ChatCompletionMessageRequestParam {
  /**
   * The author of the message.
   * Typically the completion infers the author from examples and previous
   * messages provided in the options.
   */
  role?: string;
  /**
   * The content of the message
   */
  content?: string;

  tool_calls?: Array<object>;
  tool_call_id?: string;
}

/**
 * Options for chat request
 * @public
 */
interface ChatOptionParamsBase {
  /**
   * Specifies the model to use
   */
  model: string;
  /**
   * Previous messages in the conversation
   */
  messages: Array<ChatCompletionMessageRequestParam>;
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
   * Wheter to stream the completions.
   */
  stream?: boolean;

  /**
   * Index signature allowing any other options
   */
  [key: string]: unknown;

  /**
   * Allows extra provider specific parameters. Consult with the documentation for which
   * parameters are available for each model.
   */
  provider_extra_parameters?: Record<string, unknown>;
}

interface ChatOptionParamsStream extends ChatOptionParamsBase {
  stream: true;
}

interface ChatOptionParamsNonStream extends ChatOptionParamsBase {
  stream?: false;
}

export type ChatOptionParams =
  | ChatOptionParamsStream
  | ChatOptionParamsNonStream;
