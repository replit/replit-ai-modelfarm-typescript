import {
  ChatCompletionResponse,
  ChatCompletionStreamChunkResponse,
} from './chat_completions';
import {
  CompletionModel,
  CompletionOptions,
  CompletionMultipleChoicesOptions,
} from './complete';
import { Result, OkResult, ErrResult } from './result';
import { RequestError } from './request';
import { embed, Embedding, EmbeddingModel, EmbeddingOptions } from './embed';
import { Modelfarm } from './client';

export { Modelfarm, embed };
export type {
  Result,
  OkResult,
  ErrResult,
  ChatCompletionResponse,
  ChatCompletionStreamChunkResponse,
  CompletionOptions,
  CompletionMultipleChoicesOptions,
  CompletionModel,
  RequestError,
  Embedding,
  EmbeddingModel,
  EmbeddingOptions,
};
