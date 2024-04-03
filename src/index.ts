export * as chat from './chat';
export * from './chat/types';

export * as completions from './completions';
export * from './completions/types';

export * as embeddings from './embeddings';
export * from './embeddings/types';

export * from './usageTypes';

export type { Result, OkResult, ErrResult } from './result';
export type { RequestError } from './request';

// For api-extractor, exporting the root functions
export { create as completeChat } from './chat/completions';
export { create as complete } from './completions';
export { create as embed } from './embeddings';
