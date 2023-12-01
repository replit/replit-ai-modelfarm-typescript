import { Modelfarm } from './client';
import { makeSimpleRequest } from './request';
import { Usage, GoogleEmbeddingMetadata } from './structs';

export class Embeddings {
  _client: Modelfarm;

  constructor(client: Modelfarm) {
    this._client = client;
  }

  /**
   * Converts text into numerical vectors
   * @public
   */
  async create(options: EmbeddingOptions): Promise<EmbeddingModelResponse> {
    const res = await makeSimpleRequest<EmbeddingModelResponse>(
      'v1beta2/embeddings',
      { ...options },
    );
    if (res.ok) {
      return res.value;
    }
    throw new Error(res.error.message);
  }
}

interface Embedding {
  object: string;
  embedding: Array<number>;
  index: number;
  metadata?: Record<string, unknown>;
}

export interface EmbeddingModelResponse {
  object: string;
  data: Array<Embedding>;
  model: string;
  usage?: Usage;
  metadata?: GoogleEmbeddingMetadata;
}

/**
 * Options for embedding request
 */
export interface EmbeddingOptions {
  /**
   * The model to embed with
   */
  model: string;
  /**
   * The strings to embed, the returned embedding will correspond to the order
   * of the passed string
   */
  input: string | Array<string> | Array<number> | Array<Array<number>>;

  /**
   * Index signature allowing any other options
   */
  [key: string]: unknown;

  /**
   * Allows extra provider specific parameters. Consult with the documentation for which
   * parameters are available for each model.
   */
  provider_extra_parameters?: Record<string, unknown>;
}
