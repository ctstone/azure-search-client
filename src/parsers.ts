import * as request from 'superagent';

import { ParserCallback } from './types';

export const jsonParser = (res: request.Response, cb: ParserCallback) => {
  const buf: Buffer[] = [];
  res.on('data', (d) => buf.push(d));
  res.on('error', cb);
  res.on('end', () => {
    let error: Error;
    let body: any;
    try {
      body = JSON.parse(Buffer.concat(buf).toString().trim());
    } catch (err) {
      error = err;
    }
    cb(error, body);
  });
};
