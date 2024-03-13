import * as result from '../result';
import { makeSimpleRequest, RequestError } from '../request';
import type { EmbeddingOptions, EmbeddingModelResponse } from './types';

/**
 * Converts text into numerical vectors
 * @public
 */
export async function create(
  options: EmbeddingOptions,
): Promise<result.Result<EmbeddingModelResponse, RequestError>> {
  return await makeSimpleRequest<EmbeddingModelResponse>('v1beta2/embeddings', {
    ...options,
  });
}
