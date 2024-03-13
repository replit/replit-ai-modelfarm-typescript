import * as result from '../result';
import {
  makeStreamingRequest,
  makeSimpleRequest,
  RequestError,
} from '../request';
import type {
  CompletionOptionsStream,
  CompletionResponse,
  CompletionOptionsNonStream,
  CompletionOptions,
} from './types';

/**
 * Gets the completion for a piece of text.
 * @public
 */
export async function create(
  options: CompletionOptionsStream,
): Promise<result.Result<AsyncGenerator<CompletionResponse>, RequestError>>;
export async function create(
  options: CompletionOptionsNonStream,
): Promise<result.Result<CompletionResponse, RequestError>>;
export async function create(
  options: CompletionOptions,
): Promise<
  result.Result<
    CompletionResponse | AsyncGenerator<CompletionResponse>,
    RequestError
  >
> {
  if (options.stream) {
    return await makeStreamingRequest<CompletionResponse>(
      'v1beta2/completions',
      { ...options },
    );
  } else {
    return await makeSimpleRequest<CompletionResponse>('v1beta2/completions', {
      ...options,
    });
  }
}
