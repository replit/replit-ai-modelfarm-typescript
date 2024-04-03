import * as result from '../result';
import {
  makeStreamingRequest,
  makeSimpleRequest,
  RequestError,
} from '../request';
import type {
  ChatOptionParamsNonStream,
  ChatCompletionResponse,
  ChatOptionParamsStream,
  ChatCompletionStreamChunkResponse,
  ChatOptionParams,
} from './types';

/**
 * Gets a single chat message completion for a conversation.
 * @public
 */
export async function create(
  options: ChatOptionParamsNonStream,
): Promise<result.Result<ChatCompletionResponse, RequestError>>;
/**
 * Gets a single chat message completion for a conversation.
 * The result contains an iterator of messages, please note that this would be
 * a *single message* that has the contents chunked up.
 * @public
 */
export async function create(
  options: ChatOptionParamsStream,
): Promise<
  result.Result<AsyncGenerator<ChatCompletionStreamChunkResponse>, RequestError>
>;
export async function create(
  options: ChatOptionParams,
): Promise<
  result.Result<
    ChatCompletionResponse | AsyncGenerator<ChatCompletionStreamChunkResponse>,
    RequestError
  >
> {
  if (options.stream) {
    return await makeStreamingRequest<ChatCompletionStreamChunkResponse>(
      'v1beta2/chat/completions',
      { ...options },
    );
  } else {
    return await makeSimpleRequest<ChatCompletionResponse>(
      'v1beta2/chat/completions',
      { ...options },
    );
  }
}
