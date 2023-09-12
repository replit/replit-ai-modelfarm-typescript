import * as result from './result';
import {
  RequestError,
  makeSimpleRequest,
  makeStreamingRequest,
} from './request';

/**
 * Available models for text completion
 * @public
 */
export type CompleteModel = 'text-bison';

/**
 * Options for completion request
 * @public
 */
export interface CompleteOptions {
  /**
   * Specifies the model to use
   */
  model: CompleteModel;
  /**
   * The string/text to complete
   */
  prompt: string;
  /**
   * Sampling temperature between 0 and 1. The higher the value, the more
   * likely the model will produce a completion that is more creative and
   * imaginative.
   */
  temperature?: number;
  /**
   * The maximum number of tokens generated in the completion.
   * The absolute maximum value is limited by model's context size.
   */
  maxOutputTokens?: number;

  /**
   * Allows extra model specific parameters. Consult with the documentation for which
   * parameters are available for each model.
   */
  extraParams?: Record<string, unknown>;
}

export interface CompleteMultipleChoicesOptions extends CompleteOptions {
  /**
   * Number of completions to generate. Minimum 1, the maximum
   * depends on the model, the returned choices will be automatically
   * adjusted to fit the model. You should not treat this as a guarantee,
   * what you will get is a number of choices upto `choicesCount`.
   */
  choicesCount: number;
}

// non exauhstive
interface RawAPIResponse {
  responses: Array<{
    choices: Array<{
      content: string;
    }>;
  }>;
}

/**
 * Gets multiple completions for a piece of text.
 * @public
 */
export async function completeMultipleChoices(
  options: CompleteMultipleChoicesOptions,
): Promise<
  result.Result<{ choices: Array<{ completion: string }> }, RequestError>
> {
  return makeSimpleRequest(
    '/v1beta/completion',
    getRequestOptions(options),
    processJSON,
  );
}

/**
 * Gets the completion for a piece of text.
 * @public
 */
export async function complete(
  options: CompleteOptions,
): Promise<result.Result<{ completion: string }, RequestError>> {
  const res = await makeSimpleRequest(
    '/v1beta/completion',
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

/**
 * Gets a stream of completions for a piece of text.
 * @public
 */
export async function completeStream(
  options: CompleteOptions,
): Promise<
  result.Result<AsyncGenerator<{ completion: string }>, RequestError>
> {
  return makeStreamingRequest(
    '/v1beta/completion_streaming',
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

function getRequestOptions(
  options: CompleteOptions | CompleteMultipleChoicesOptions,
): Record<string, unknown> {
  return {
    model: options.model,
    parameters: {
      prompts: [options.prompt],
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
      candidateCount:
        'choicesCount' in options ? options.choicesCount : undefined,
      ...options.extraParams,
    },
  };
}

function processJSON(json: RawAPIResponse): {
  choices: Array<{ completion: string }>;
} {
  if (!json.responses[0]?.choices[0]?.content) {
    throw new Error('Expected at least one message');
  }

  return {
    choices: json.responses[0].choices.map(({ content }) => ({
      completion: content,
    })),
  };
}
