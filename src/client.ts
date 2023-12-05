import { Chat } from './chat_completions';
import { Embeddings } from './embeddings';
import { Completions } from './completions';
import { doFetch, RequestError } from './request';
import handleStreamingResponseBody from './request/handleStreamingResponseBody';
import * as result from './request/result';

export class Modelfarm {
  base_url: string;

  chat: Chat;
  embeddings: Embeddings;
  completions: Completions;

  constructor(base_url: string | null = null) {
    this.base_url =
      base_url ?? 'https://production-modelfarm.replit.com/v1beta2';

    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.completions = new Completions(this);
  }

  async makeStreamingRequest<R>(
    urlPath: string,
    body: Record<string, unknown>,
  ): Promise<result.Result<AsyncGenerator<R, void, void>, RequestError>> {
    const res = await doFetch(this.base_url, urlPath, body);

    if (!res.ok) {
      return res;
    }

    const iterator = handleStreamingResponseBody<R>(res.value.body);

    return result.Ok(iterator);
  }

  async makeSimpleRequest<R>(
    urlPath: string,
    body: Record<string, unknown>,
  ): Promise<result.Result<R, RequestError>> {
    const res = await doFetch(this.base_url, urlPath, body);

    if (!res.ok) {
      return res;
    }

    const json = (await res.value.json()) as R;

    return result.Ok(json);
  }
}
