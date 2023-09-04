import { expect, test } from 'vitest'
import fs from 'fs/promises';
import IncrementalJSONParser from './incrementalJSONParser';

test('reports pending when incomplete', () => {
  const parser = new IncrementalJSONParser();
  const next = parser.write('{').next();
  expect(next.done).toBeTruthy();
  expect(next.value).toBeFalsy();
  expect(parser.hasPending()).toBeTruthy();
  expect(parser.isLocked()).toBeFalsy();
});

test('reports not pending after construction', () => {
  const parser = new IncrementalJSONParser();

  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

test('loads simple json', () => {
  const parser = new IncrementalJSONParser();

  const iter = parser.write('{}');
  expect(parser.hasPending()).toBeFalsy();
  expect(parser.isLocked()).toBeTruthy();

  const next = iter.next();
  expect(next.value).toMatchObject({});
  expect(next.done).toBeFalsy();
  expect(iter.next().done).toBeTruthy();

  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

test('loads chunked json (single write)', () => {
  const parser = new IncrementalJSONParser();

  const iter = parser.write('{}{}');

  const next = iter.next();
  expect(next.value).toMatchObject({});
  expect(next.done).toBeFalsy();

  const nextnext = iter.next();
  expect(nextnext.value).toMatchObject({});
  expect(nextnext.done).toBeFalsy();
  expect(iter.next().done).toBeTruthy();


  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

test('loads chunked json (multiple wrtes)', () => {
  const parser = new IncrementalJSONParser();

  const iter1 = parser.write('{}')
  expect(iter1.next().value).toMatchObject({});
  expect(iter1.next().done).toBeTruthy()

  const iter2 = parser.write('{}')
  expect(iter2.next().value).toMatchObject({});
  expect(iter2.next().done).toBeTruthy()


  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

test('loads chunked json with extra whitespace', () => {
  const parser = new IncrementalJSONParser();

  const iter1 = parser.write('{}');
  expect(iter1.next().value).toMatchObject({});
  expect(iter1.next().done).toBeTruthy();

  const iter2 = parser.write('      \r\n\t');
  expect(iter2.next().done).toBeTruthy();

  const iter3 = parser.write('{}');
  expect(iter3.next().value).toMatchObject({});
  expect(iter3.next().done).toBeTruthy()


  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

test('handles odd boundary (non-string)', () => {
  const parser = new IncrementalJSONParser();

  const iter1 = parser.write('{"field":"value"');
  expect(iter1.next().done).toBeTruthy();

  const iter2 = parser.write('}');
  expect(iter2.next().value).toMatchObject({ field: 'value' });
  expect(iter2.next().done).toBeTruthy();

  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

test('handles odd boundary (double-quoted-string)', () => {
  const parser = new IncrementalJSONParser();

  const iter1 = parser.write('{"field"');
  expect(iter1.next().done).toBeTruthy();

  const iter2 = parser.write(':"value"}');
  expect(iter2.next().value).toMatchObject({ field: 'value' });
  expect(iter2.next().done).toBeTruthy();

  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});


test('handles odd boundary (double-quoted-string, escaped)', () => {
  const parser = new IncrementalJSONParser();

  const iter1 = parser.write('{"field": "value\\"}');
  expect(iter1.next().done).toBeTruthy();

  const iter2 = parser.write('"}');
  expect(iter2.next().value).toMatchObject({ field: 'value"}' });
  expect(iter2.next().done).toBeTruthy();

  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

// We don't expect arrays, can be added as needed
test.skip('can parse valid JSON array', () => {
  const parser = new IncrementalJSONParser();

  const jsonArray = '["element1", "element2", "element3"]';
  const iter = parser.write(jsonArray)

  const next = iter.next();
  expect(next.value).toMatchObject(["element1", "element2", "element3"]);
  expect(next.done).toBeFalsy();

  expect(iter.next().done).toBeTruthy();

  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

test('handles escaped sequences in a string correctly', () => {
  const parser = new IncrementalJSONParser();
  const jsonObject = '{"data": "This is a \\"string\\" with escaped quotes and \\\\ double backslashes"}';
  const iter = parser.write(jsonObject)
  const next = iter.next();
  expect(next.value).toMatchObject({ "data": 'This is a "string" with escaped quotes and \\ double backslashes' });
  expect(next.done).toBeFalsy();
  expect(iter.next().done).toBeTruthy();
  expect(parser.isLocked()).toBeFalsy();
  expect(parser.hasPending()).toBeFalsy();
});

