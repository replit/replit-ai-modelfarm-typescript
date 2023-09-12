import * as result from '../result';
import getToken from './getToken';
import handleStreamingResponseBody from './handleStreamingResponseBody';

/**
 * An object that represents an error with a request
 * @public
 */
export interface RequestError {
  message: string;
  statusCode: number;
}

export const baseUrl =
  process.env.MODEL_FARM_URL ?? 'https://production-modelfarm.replit.com/';

export async function doFetch(
  urlPath: string,
  body: Record<string, unknown>,
): Promise<
  result.Result<
    Response & { body: NonNullable<Response['body']> },
    RequestError
  >
> {
  const url = new URL(urlPath, baseUrl);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status !== 200) {
    return result.Err({
      message: await response.text(),
      statusCode: response.status,
    });
  }

  if (!response.body) {
    return result.Err({
      message: 'No response body',
      statusCode: response.status,
    });
  }

  return result.Ok(
    response as Response & { body: NonNullable<Response['body']>; }
  );
}



export async function makeStreamingRequest<T, R>(
  urlPath: string,
  body: Record<string, unknown>,
  processJSON: (json: T) => R,
): Promise<result.Result<AsyncGenerator<R, void, void>, RequestError>> {
  const res = await doFetch(urlPath, body);

  if (!res.ok) {
    return res;
  }

  const iterator = handleStreamingResponseBody(res.value.body, processJSON);

  return result.Ok(iterator);
}

export async function makeSimpleRequest<T, R>(
  urlPath: string,
  body: Record<string, unknown>,
  processJSON: (json: T) => R,
): Promise<result.Result<R, RequestError>> {
  const res = await doFetch(urlPath, body);

  if (!res.ok) {
    return res;
  }

  const json = (await res.value.json()) as T;

  return result.Ok(processJSON(json));
}
