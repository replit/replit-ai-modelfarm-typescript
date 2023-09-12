import * as result from './result';
import { RequestError, makeSimpleRequest } from './request';

/**
 * Available models for text embedding
 * @public
 */
export type EmbedModel = 'textembedding-gecko';

/**
 * Options for embedding request
 */
export interface EmbedOptions {
  /**
   * The model to embed with
   */
  model: EmbedModel;
  /**
   * The strings to embed, the returned embedding will correspond to the order
   * of the passed string
   */
  content: Array<string>;

  /**
   * Allows extra model specific parameters. Consult with the documentation
   */
  extraParams?: Record<string, unknown>;
}

/**
 * Embedding vector returned by an embedding request
 * @public
 */
export interface Embedding {
  /**
   * The embedding vectors corresponding to the words in the input text
   */
  values: Array<number>;
  /**
   * Indicates if the input text was longer than max allowed tokens and truncated
   */
  truncated: boolean;
}

// non exauhstive
interface Response {
  embeddings: Array<Embedding>;
}

/**
 * Converts text into numerical vectors
 * @public
 */
export async function embed(
  options: EmbedOptions,
): Promise<result.Result<{ embeddings: Array<Embedding> }, RequestError>> {
  return makeSimpleRequest(
    '/v1beta/embedding',
    {
      model: options.model,
      parameters: {
        content: options.content.map((content) => ({ content })),
        ...options.extraParams,
      },
    },
    (json: Response): { embeddings: Array<Embedding> } => ({
      embeddings: json.embeddings.map((embedding) => ({
        values: embedding.values,
        truncated: embedding.truncated,
      })),
    }),
  );
}
