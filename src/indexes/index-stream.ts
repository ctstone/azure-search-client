import { Transform, TransformCallback } from 'stream';

import { IndexingResult } from 'azure-search-types';
import { SearchRequester } from '../search-requester';
import { SearchOptions, SearchRequest } from '../types';
import { IndexBuffer } from './index-buffer';
import { IndexDocument, IndexingResults } from './search-index';

export class IndexStream extends Transform {
  private buffer = new IndexBuffer(async (data) => {
    const resp = await this.request<IndexingResults>({
      method: 'post',
      path: '/docs/index',
      headers: { 'content-type': 'application/json' },
      body: data,
    });
    return resp.result.value;
  });

  constructor(private requester: SearchRequester, private index: string, private options?: SearchOptions) {
    super({
      objectMode: true,
      transform: async (chunk, enc, cb) => await self.process(cb, chunk),
      flush: async (cb) => await self.process(cb),
    });

    const self = this;
  }

  private request<T>(req: SearchRequest<T>) {
    req.path = `/indexes/${this.index}${req.path}`;
    return this.requester.request<T>(req, this.options);
  }

  private async process(cb: TransformCallback, document?: IndexDocument & Document) {
    let maybeResults: void | IndexingResult[];
    let error: any = null;

    try {
      maybeResults = document
        ? await this.buffer.add(document)
        : await this.buffer.flush();
    } catch (err) {
      error = err;
    }

    cb(error, maybeResults);
  }
}
