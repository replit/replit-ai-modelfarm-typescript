import all from 'it-all';
import * as result from './result';
import makeRequest, { RequestError } from './request';

/**
 * Available models for text embedding
 * @public
 */
export type EmbeddingModel = 'textembedding-gecko';

// Ideally this relationship is inverted, but it makes documentation nicer this way
const embeddingModels = ['textembedding-gecko'] as const;

/**
 * Options for embedding request
 */
export interface EmbeddingOptions {
  model?: EmbeddingModel;
  content: string;
}

/**
 * Embedding vector returned by an embedding request
 * @public
 */
export interface EmbeddingV {
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
  embeddings: Array<EmbeddingV>;
}

/**
 * Converts text into numerical vectors
 * @public
 */
export async function embedding(
  options: EmbeddingOptions,
): Promise<result.Result<{ embedding: EmbeddingV }, RequestError>> {
  const res = await makeRequest(
    '/embedding',
    {
      model: options.model ?? embeddingModels[0],
      parameters: {
        content: [{ content: options.content }],
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (json: Response): EmbeddingV => {
      const embedding = json.embeddings[0];

      if (!embedding) {
        throw new Error('Expected embedding');
      }

      return {
        values: embedding.values,
        truncated: embedding.truncated,
      };
    },
  );

  if (!res.ok) {
    return res;
  }

  const embeddings = await all(res.value);

  const e = embeddings[0];
  if (!e) {
    return result.Err({
      message: 'Got response with no embedding',
      statusCode: 200,
    });
  }

  if (embeddings.length > 1) {
    return result.Err({
      message:
        'Got response with multiple embeddings, expected 1, please contact support',
      statusCode: 200,
    });
  }

  return result.Ok({ embedding: e });
}