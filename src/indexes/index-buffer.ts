import { Document, IndexDocument, IndexingResult } from 'azure-search-types';

const MAX_INDEXING_BYTES = 16 * Math.pow(2, 20);
const MAX_INDEXING_COUNT = 1000;
const COMMA = Buffer.from(',');
const OPEN = Buffer.from('{"value":[');
const CLOSE = Buffer.from(']}');

export type FlushCallback = (data: Buffer) => Promise<IndexingResult[]>;

export class IndexBuffer<TDocument = Document> {

  private readonly chunks: Buffer[] = [];
  private bytes = 0;
  private count = 0;

  constructor(private flushHandler: FlushCallback) { }

  add(document: IndexDocument & TDocument): Promise<void | IndexingResult[]> {
    if (!this.count) {
      this.chunk(OPEN);
    }
    const next = Buffer.from(JSON.stringify(document));
    if (next.byteLength > MAX_INDEXING_BYTES) {
      throw new Error(`Document #${this.count} contains ${next.byteLength} bytes, which exceeds maximum of ${MAX_INDEXING_BYTES}`);
    } else if (next.byteLength + COMMA.byteLength + CLOSE.byteLength + this.bytes > MAX_INDEXING_BYTES) {
      return this.flush();
    } else {
      if (this.count > 0) {
        this.chunk(COMMA);
      }
      this.chunk(next);
      this.count += 1;
    }

    if (this.count >= MAX_INDEXING_COUNT) {
      return this.flush();
    } else {
      return Promise.resolve();
    }
  }

  flush() {
    if (this.count) {
      this.chunk(CLOSE);
      const data = Buffer.concat(this.chunks);
      this.reset();
      return this.flushHandler(data);
    }
  }

  private chunk(chunk: Buffer) {
    this.chunks.push(chunk);
    this.bytes += chunk.byteLength;
  }

  private reset() {
    this.chunks.length = 0;
    this.bytes = 0;
    this.count = 0;
  }
}
