import type { GoogleMetadata, Usage } from '../usageTypes';

export interface CompletionChoice {
  index: number;
  text: string;
  finish_reason: string;
  logprobs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CompletionResponse {
  id: string;
  choices: Array<CompletionChoice>;
  model: string;
  created?: number;
  object?: string;
  usage?: Usage;
  metadata?: GoogleMetadata;
}

/**
 * Options for completion request
 * @public
 */
export interface CompletionOptionsBase {
  /**
   * Specifies the model to use
   */
  model: string;
  /**
   * The string/text to complete
   */
  prompt: string | Array<string> | Array<number> | Array<Array<number>> | null;
  /**
   * Sampling temperature. The higher the value, the more
   * likely the model will produce a completion that is more creative and
   * imaginative.
   */
  temperature?: number;
  /**
   * The maximum number of tokens generated in the completion.
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

export interface CompletionOptionsStream extends CompletionOptionsBase {
  stream: true;
}

export interface CompletionOptionsNonStream extends CompletionOptionsBase {
  stream?: false;
}

export type CompletionOptions =
  | CompletionOptionsStream
  | CompletionOptionsNonStream;
