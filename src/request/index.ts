import * as result from '../result';
import getToken from './getToken';
import responseBodyToIterator from './responseBodyToIterator';

/**
 * An object that represents an error with a request
 * @public
 */
export interface RequestError {
  message: string;
  statusCode: number;
}

const baseUrl =
  process.env.MODEL_FARM_URL ?? 'https://production-modelfarm.replit.com/';
const version = '/v1beta';

export default async function makeRequest<T, R>(
  urlPath: string,
  body: Record<string, unknown>,
  processJSON: (json: T) => R,
): Promise<result.Result<AsyncGenerator<R, void, void>, RequestError>> {
  const url = new URL(version + urlPath, baseUrl);

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

  const iterator = responseBodyToIterator(response.body, processJSON);

  return result.Ok(iterator);
}
