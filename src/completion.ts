import all from 'it-all';
import * as result from './result';
import makeRequest, { RequestError } from './request';
import { pipe } from 'it-pipe';

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

export interface CompletionMultipleChoicesOptions extends CompletionOptions {
  /**
   * Number of completions to generate. Minimum 1, the maximum
   * depends on the model, the returned choices will be automatically
   * adjusted to fit the model. You should not treat this as a guarantee,
   * what you will get is a number of choices upto `choicesCount`.
   */
  choicesCount: number;
}

/**
 * Gets multiple completions for a piece of text.
 * @public
 */
export async function completionMultipleChoices(
  options: CompletionMultipleChoicesOptions,
): Promise<
  result.Result<{ choices: Array<{ completion: string }> }, RequestError>
> {
  const res = await completionImpl(options, '/completion');

  if (!res.ok) {
    return res;
  }

  const responses = await all(res.value);

  if (responses.length > 1) {
    throw new Error('Got multiple responses from non-streaming endpoint');
  }

  const response = responses[0];

  if (!response) {
    throw new Error('Expected at least one response');
  }

  return result.Ok(response);
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

  const responses = await all(res.value);

  if (responses.length > 1) {
    throw new Error('Got multiple responses from non-streaming endpoint');
  }

  const response = responses[0];

  if (!response) {
    throw new Error('Expected at least one response');
  }

  if (response.choices.length > 1) {
    throw new Error('Got multiple choices without choicesCount');
  }

  const choice = response.choices[0];

  if (!choice) {
    throw new Error('Expected at least one choice');
  }

  return result.Ok(choice);
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
  const res = await completionImpl(options, '/completion_streaming');

  if (!res.ok) {
    return res;
  }

  return result.Ok(
    pipe(res.value, async function* (source) {
      for await (const v of source) {
        const choice = v.choices[0];
        if (!choice) {
          throw new Error('Expected at least one choice');
        }

        yield choice;
      }

      return;
    }),
  );
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
  options: CompletionOptions | CompletionMultipleChoicesOptions,
  urlPath: string,
): Promise<
  result.Result<
    AsyncGenerator<{ choices: Array<{ completion: string }> }>,
    RequestError
  >
> {
  return makeRequest(
    urlPath,
    {
      model: options.model,
      parameters: {
        prompts: [options.prompt],
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens,
        candidateCount:
          'choicesCount' in options ? options.choicesCount : undefined,
      },
    },
    (json: Response): { choices: Array<{ completion: string }> } => {
      console.log(json.responses[0]?.choices[0]?.content)

      if (!json.responses[0]?.choices[0]?.content) {
        throw new Error('Expected at least one message');
      }

      return {
        choices: json.responses[0].choices.map(({ content }) => ({
          completion: content,
        })),
      };
    },
  );
}
