import { IncomingMessage } from 'http';
import { Response } from 'superagent';

import { ResponseError } from './response-error';
import { ParserCallback } from './types';

export const jsonParser = (reviver?: (key: any, value: any) => any) => {
  return (res: Response, cb: ParserCallback) => {
    const message = res as any as IncomingMessage; // superagent says this is 'Response' but it's really an 'IncomingMessage'
    const buf: Buffer[] = [];
    message.on('data', (d) => buf.push(d));
    message.on('error', cb);
    message.on('end', () => {
      const bodyText = Buffer.concat(buf).toString().trim();
      const contentType = message.headers['content-type'];
      let error: Error;
      let body: any;
      if (contentType && contentType.startsWith('application/json')) {
        try {
          body = JSON.parse(bodyText, reviver);
        } catch (err) {
          error = err;
        }
      } else {
        body = bodyText;
      }

      // error
      if (message.statusCode < 200 || message.statusCode >= 300) {
        let errorMessage: string;
        if (body && body.error && body.error.message) {
          errorMessage = body.error.message;
        } else {
          errorMessage = bodyText || message.statusMessage;
        }
        error = new ResponseError(message.statusCode, errorMessage);
      }

      cb(error, body);
    });
  };
};
