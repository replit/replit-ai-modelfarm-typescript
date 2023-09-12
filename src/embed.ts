import all from 'it-all';
import * as result from './result';
import makeRequest, { RequestError } from './request';

/**
 * Available models for text embedding
 * @public
 */
export type EmbedModel = 'textembedding-gecko';

// Ideally this relationship is inverted, but it makes documentation nicer this way
const embeddingModels = ['textembedding-gecko'] as const;

/**
 * Options for embedding request
 */
export interface EmbedOptions {
  model?: EmbedModel;
  content: string;

  /**
   * Allows extra model specific parameters. Consult with the documentation
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
): Promise<result.Result<{ embedding: Embedding }, RequestError>> {
  const { model, content, ...otherOptions } = options;
  const res = await makeRequest(
    '/embedding',
    {
      model: model ?? embeddingModels[0],
      parameters: {
        ...otherOptions,
        content: [{ content: content }],
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (json: Response): Embedding => {
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
