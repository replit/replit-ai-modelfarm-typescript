import {
  chat,
  chatStream,
  chatMultipleChoices,
  ChatMultipleChoicesOptions,
  ChatOptions,
  ChatMessage,
  ChatModel,
} from './chat';
import {
  completion,
  completionMultipleChoices,
  completionStream,
  CompletionModel,
  CompletionOptions,
  CompletionMultipleChoicesOptions,
} from './completion';
import { Result, OkResult, ErrResult } from './result';
import { RequestError } from './request';
import {
  embedding,
  EmbeddingV,
  EmbeddingModel,
  EmbeddingOptions,
} from './embedding';

export {
  chat,
  chatStream,
  chatMultipleChoices,
  completion,
  completionStream,
  completionMultipleChoices,
  embedding,
};
export type {
  Result,
  OkResult,
  ErrResult,
  ChatOptions,
  ChatMultipleChoicesOptions,
  CompletionOptions,
  CompletionMultipleChoicesOptions,
  ChatMessage,
  CompletionModel,
  ChatModel,
  RequestError,
  EmbeddingV,
  EmbeddingModel,
  EmbeddingOptions,
};
