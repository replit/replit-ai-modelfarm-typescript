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
  complete,
  completeMultipleChoices,
  completeStream,
  CompletionModel,
  CompleteOptions,
  CompleteMultipleChoicesOptions,
} from './complete';
import { Result, OkResult, ErrResult } from './result';
import { RequestError } from './request';
import { embed, Embedding, EmbeddingModel, EmbedOptions } from './embed';

export {
  chat,
  chatStream,
  chatMultipleChoices,
  complete,
  completeStream,
  completeMultipleChoices,
  embed,
};
export type {
  Result,
  OkResult,
  ErrResult,
  ChatOptions,
  ChatMultipleChoicesOptions,
  CompleteOptions,
  CompleteMultipleChoicesOptions,
  ChatMessage,
  CompletionModel,
  ChatModel,
  RequestError,
  Embedding,
  EmbeddingModel,
  EmbedOptions,
};
