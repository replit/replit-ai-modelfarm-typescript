import all from 'it-all';
import * as result from './result';
import makeRequest, { RequestError } from './request';

/**
 * Available models for text completion
 * @public
 */
export type CompletionModel = 'text-bison';

/**
 * Options for completion request
 * @public
 */
export interface CompletionOptions {
  /**
   * Specifies the model to use
   */
  model: CompletionModel;
  /**
   * The string/text to complete
   */
  prompt: string;
  /**
   * Sampling temperature between 0 and 1. The higher the value, the more
   * likely the model will produce a completion that is more creative and
   * imaginative.
   * Defaults to 0
   */
  temperature?: number;
  /**
   * The maximum number of tokens generated in the completion.
   * The absolute maximum value is limited by model's context size.
   * Defaults to 1024
   */
  maxOutputTokens?: number;
}

/**
 * Gets the completion for a piece of text.
 * @public
 */
export async function completion(
  options: CompletionOptions,
): Promise<result.Result<{ completion: string }, RequestError>> {
  const res = await completionImpl(options, '/completion');

  if (!res.ok) {
    return res;
  }

  const allText = await all(res.value);

  return result.Ok({
    completion: allText.map(({ completion }) => completion).join(''),
  });
}

/**
 * Gets a stream of completions for a piece of text.
 * @public
 */
export async function completionStream(
  options: CompletionOptions,
): Promise<
  result.Result<AsyncGenerator<{ completion: string }>, RequestError>
> {
  return completionImpl(options, '/completion_streaming');
}

// non exauhstive
interface Response {
  responses: Array<{
    choices: Array<{
      content: string;
    }>;
  }>;
}

async function completionImpl(
  options: CompletionOptions,
  urlPath: string,
): Promise<
  result.Result<AsyncGenerator<{ completion: string }>, RequestError>
> {
  return makeRequest(
    urlPath,
    {
      model: options.model,
      parameters: {
        prompts: [options.prompt],
      },
    },
    (json: Response): { completion: string } => {
      const content = json.responses[0]?.choices[0]?.content;

      if (typeof content == 'undefined') {
        throw new Error('Expected content');
      }

      return { completion: content };
    },
  );
}
