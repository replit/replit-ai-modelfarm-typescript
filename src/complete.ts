import all from 'it-all';
import * as result from './result';
import makeRequest, { RequestError } from './request';
import { pipe } from 'it-pipe';

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
   * Defaults to 0
   */
  temperature?: number;
  /**
   * The maximum number of tokens generated in the completion.
   * The absolute maximum value is limited by model's context size.
   * Defaults to 1024
   */
  maxOutputTokens?: number;
  /**
   * Allows extra model specific parameters. Consult with the documentation
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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

/**
 * Gets multiple completions for a piece of text.
 * @public
 */
export async function completeMultipleChoices(
  options: CompleteMultipleChoicesOptions,
): Promise<
  result.Result<{ choices: Array<{ completion: string }> }, RequestError>
> {
  const res = await completeImpl(options, '/completion');

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
export async function complete(
  options: CompleteOptions,
): Promise<result.Result<{ completion: string }, RequestError>> {
  const res = await completeImpl(options, '/completion');

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
export async function completeStream(
  options: CompleteOptions,
): Promise<
  result.Result<AsyncGenerator<{ completion: string }>, RequestError>
> {
  const res = await completeImpl(options, '/completion_streaming');

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

async function completeImpl(
  options: CompleteOptions | CompleteMultipleChoicesOptions,
  urlPath: string,
): Promise<
  result.Result<
    AsyncGenerator<{ choices: Array<{ completion: string }> }>,
    RequestError
  >
> {
  const {
    model,
    prompt,
    temperature,
    maxOutputTokens,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    choicesCount,
    ...otherOptions
  } = options;

  return makeRequest(
    urlPath,
    {
      model: model,
      parameters: {
        ...otherOptions,
        prompts: [prompt],
        temperature: temperature,
        maxOutputTokens: maxOutputTokens,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        candidateCount: 'choicesCount' in options ? choicesCount : undefined,
      },
    },
    (json: Response): { choices: Array<{ completion: string }> } => {
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
