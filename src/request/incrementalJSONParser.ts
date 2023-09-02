enum State {
  EMPTY = 0,
  IN_DOUBLE_QUOTE_STRING = 2,
  NORMAL = 1,
}

/**
 * This parses a stream of JSON that may be incomplete
 * after every chunk
 */
export default class IncrementalJSONParser<T> {
  private buffer: string;
  private bufferIndex: number;
  private state: State;
  private level: number;
  private escaped: boolean;
  private locked: boolean;

  constructor() {
    this.buffer = '';
    this.bufferIndex = 0;
    // State at the last read character.
    this.state = State.EMPTY;
    this.level = 0;
    this.escaped = false;
    this.locked = false;
  }

  public write(chunk: string) {
    if (this.locked) {
      throw new Error('parser locked, make sure to drain the previous write');
    }

    this.locked = true;

    return this.writeGenerator(chunk);
  }

  /**
   * Is the written string fully consumed or we have buffered
   * data that needs to be processed
   */
  public hasPending() {
    return this.buffer.length > 0;
  }

  /**
   * Did we call write() and the iterator is not exhausted yet
   */
  public isLocked() {
    return this.locked;
  }

  private *writeGenerator(chunk: string): Generator<T, void, void> {
    // Push the data into the system, and then process any pending content
    const workData = this.buffer + chunk;
    let lastLevel0 = 0;
    while (this.bufferIndex < workData.length) {
      if (this.state === State.IN_DOUBLE_QUOTE_STRING) {
        // Look for the next unescaped quote
        for (; this.bufferIndex < workData.length; this.bufferIndex++) {
          const c = workData[this.bufferIndex];
          if (this.escaped) {
            this.escaped = false;
          } else if (c === '\\') {
            this.escaped = true;
          } else if (c === '"') {
            this.state = State.NORMAL;
            this.bufferIndex++;
            break;
          }
        }
      } else {
        // Process content regularly until we find a string start
        for (; this.bufferIndex < workData.length; this.bufferIndex++) {
          const c = workData[this.bufferIndex];
          if (c === '{') {
            this.level++;
          } else if (c === '}') {
            this.level--;
            if (this.level === 0) {
              // Parse the block until now
              const parsed = JSON.parse(
                workData.substring(lastLevel0, this.bufferIndex + 1),
              ) as T;
              yield parsed;

              // Reset buffer to the section from now
              lastLevel0 = this.bufferIndex + 1;
            }
          } else if (c === '"') {
            this.state = State.IN_DOUBLE_QUOTE_STRING;
            this.bufferIndex++;
            break;
          }
        }
      }
    }

    if (lastLevel0 > 0) {
      this.buffer = workData.substring(lastLevel0);
      this.bufferIndex -= lastLevel0;
    } else {
      this.buffer = workData;
    }

    this.locked = false;
  }
}
