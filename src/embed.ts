import * as result from './result';
import { RequestError, makeSimpleRequest } from './request';

/**
 * Available models for text embedding
 * @public
 */
export type EmbeddingModel = 'textembedding-gecko';

/**
 * Options for embedding request
 */
export interface EmbeddingOptions {
  /**
   * The model to embed with
   */
  model: EmbeddingModel;
  /**
   * The strings to embed, the returned embedding will correspond to the order
   * of the passed string
   */
  input: Array<string>;

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
   * The index of the input text
   */
  index: number;
  /**
   * The embedding vectors corresponding to the words in the input text
   */
  embedding: Array<number>;
}

// non exauhstive
interface Response {
  data: Array<Embedding>;
}

/**
 * Converts text into numerical vectors
 * @public
 */
export async function embed(
  options: EmbeddingOptions,
): Promise<result.Result<{ embeddings: Array<Embedding> }, RequestError>> {
  return makeSimpleRequest(
    '/v1beta2/embedding',
    {
      model: options.model,
      parameters: {
        input: options.input,
        ...options.extraParams,
      },
    },
    (json: Response): { embeddings: Array<Embedding> } => ({
      embeddings: json.data.map((embedding) => ({
        index: embedding.index,
        embedding: embedding.embedding,
      })),
    }),
  );
}
