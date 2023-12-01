import { pipe } from 'it-pipe';
import streamToIterator from 'browser-readablestream-to-it';
import IncrementalJSONParser from './incrementalJSONParser';

export default function handleStreamingResponseBody<R>(
  responseBody: ReadableStream<Uint8Array>,
): AsyncGenerator<R> {
  return pipe(
    streamToIterator(responseBody),
    async function*(source) {
      const decoder = new TextDecoder('utf-8');

      for await (const v of source) {
        yield decoder.decode(v, { stream: true });
      }

      return;
    },
    async function*(source): AsyncGenerator<R> {
      const parser = new IncrementalJSONParser();
      for await (const v of source) {
        const parserSource = parser.write(v);

        for (const json of parserSource) {
          // Ideally we do some assertions on T here
          yield json as R;
        }
      }

      if (parser.hasPending()) {
        throw new Error('stream ended with unfinished data');
      }
    },
  );
}
