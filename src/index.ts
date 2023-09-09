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
  CompleteModel,
  CompleteOptions,
  CompleteMultipleChoicesOptions,
} from './complete';
import { Result, OkResult, ErrResult } from './result';
import { RequestError } from './request';
import { embed, Embedding, EmbedModel, EmbedOptions } from './embed';

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
  CompleteModel,
  ChatModel,
  RequestError,
  Embedding,
  EmbedModel,
  EmbedOptions,
};
