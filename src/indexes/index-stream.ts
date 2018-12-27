import { Transform } from 'stream';

import { promiseOrCallback } from '../promise-or-callback';
import { SearchRequester } from '../search-requester';
import { SearchOptions, SearchRequest } from '../types';
import { IndexBuffer } from './index-buffer';
import { IndexingResults } from './search-index';

export class IndexStream extends Transform {
  private buffer = new IndexBuffer(async (data) => {
    const resp = await this.request<IndexingResults>({
      method: 'post',
      path: '/docs/index',
      headers: { 'content-type': 'application/json' },
      body: data,
    });
    for (const result of resp.result.value) {
      this.push(result);
    }
  });

  constructor(private requester: SearchRequester, private index: string, private options?: SearchOptions) {
    super({
      objectMode: true,
      async transform(chunk, enc, cb) {
        await promiseOrCallback(() => self.buffer.add(chunk), cb);
      },
      async flush(cb) {
        await promiseOrCallback(() => self.buffer.flush(), cb);
      },
    });

    const self = this;
  }

  private request<T>(req: SearchRequest<T>) {
    req.path = `/indexes/${this.index}${req.path}`;
    return this.requester.request<T>(req, this.options);
  }
}
