import * as result from './result';
import getToken from './getToken';

/**
 * An object that represents an error with a request
 * @public
 */
export interface RequestError {
  message: string;
  statusCode: number;
}

export async function doFetch(
  baseUrl: string,
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
    response as Response & { body: NonNullable<Response['body']> },
  );
}
