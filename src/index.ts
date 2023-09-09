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
  completionStream,
  CompletionModel,
  CompletionOptions,
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
  embedding,
};
export type {
  Result,
  OkResult,
  ErrResult,
  ChatOptions,
  ChatMultipleChoicesOptions,
  CompletionOptions,
  ChatMessage,
  CompletionModel,
  ChatModel,
  RequestError,
  EmbeddingV,
  EmbeddingModel,
  EmbeddingOptions,
};
