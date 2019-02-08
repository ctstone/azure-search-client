import { EventEmitter } from 'events';
import { Response, ResponseError as SuperAgentResponseError, serialize, SuperAgentRequest } from 'superagent';
import * as request from 'superagent';

import { ResponseError } from './response-error';
import { SearchError } from './search-error';
import { AzureSearchResponse, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest, SearchTimer } from './types';

const handleError = (err: any, req: SuperAgentRequest) => {

  if (err instanceof ResponseError) {
    throw new SearchError(req.method, req.url, err.statusCode, err.message);
  } else if (err instanceof SearchError) {
    throw err;
  } else if (err.response) {
    const response: Response = err.response;
    const body = response.body;
    let message: string;
    if (body && body.error && body.error.message) {
      message = body.error.message;
    } else if (body && body.Message) {
      message = body.Message;
    } else if (typeof body === 'string') {
      message = body;
    } else if (typeof body === 'object') {
      message = JSON.stringify(body);
    } else if (body) {
      message = body.toString();
    } else {
      message = 'Unknown search request error';
    }
    throw new SearchError(req.method, req.url, response.status, message);
  } else {
    throw new SearchError(req.method, req.url, -1, err.message || 'Unknown Error', err);
  }
};

const handleResponse = <T>(resp: Response, timer: SearchTimer): AzureSearchResponse<T> => {
  return {
    result: resp.body as T,
    properties: {
      requestId: resp.header['request-id'],
      elapsedTime: parseInt(resp.header['elapsed-time'], 10),
      clientRequestId: resp.header['client-request-id'],
      eTag: resp.header.etag,
      location: resp.header.location,
    },
    statusCode: resp.status,
    timer,
  };
};

const handlePromise = async <T>(req: SuperAgentRequest, timer: SearchTimer) => {
  try {
    const resp = await req;
    return handleResponse<T>(resp, timer);
  } catch (err) {
    return handleError(err, req);
  }
};

const handleCallback = <T>(req: SuperAgentRequest, callback: (err: Error, resp: AzureSearchResponse<T>) => void, timer: SearchTimer) => {
  req.end((err, resp) => {
    let error: Error;
    let searchResp: AzureSearchResponse<T>;
    if (err) {
      try {
        handleError(err, req);
      } catch (err) {
        error = err;
      }
    } else {
      searchResp = handleResponse(resp, timer);
    }
    callback(error, searchResp);
  });
};

serialize['application/json'] = (obj) => {
  return Buffer.isBuffer(obj) ? obj as any : JSON.stringify(obj);
};

/** Internal class to handle search HTTP requests/responses */
export class SearchRequester {

  events = new EventEmitter();
  private adminKeys: string[];
  private get endpoint() { return `https://${this.service}.search.windows.net`; }

  constructor(public service: string, adminKey: string | string[], public defaultVersion: string) {
    this.adminKeys = Array.isArray(adminKey) ? adminKey : [adminKey];
  }

  request<T>(req: SearchRequest<T>, optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>): Promise<AzureSearchResponse<T>> {
    const [options, cb] = this.getParams(optionsOrCallback, callback);
    const headers = Object.assign({
      'api-key': options && options.key ? options.key : this.adminKeys[0],
      'if-match': options && options.ifMatch ? options.ifMatch : null,
      'if-none-match': options && options.ifNoneMatch ? options.ifNoneMatch : null,
      'client-request-id': options && options.clientRequestId ? options.clientRequestId : null,
      'return-client-request-id': options && options.returnClientRequestId ? 'True' : null,
    }, req.headers);
    const query = Object.assign({
      'api-version': options && options.version ? options.version : this.defaultVersion,
    }, req.query);
    const timer: SearchTimer = { start: new Date(), response: process.hrtime(), end: process.hrtime() };
    const requestValue = request(req.method, this.endpoint + req.path)
      .set(headers)
      .query(query)
      .send(req.body)
      .retry(options ? options.retry : 0)
      .timeout(options ? options.timeout : null)
      .parse(req.parser)
      .on('response', (resp) => {
        timer.response = process.hrtime(timer.response);
        this.events.emit('response', resp);
      })
      .on('error', (err) => {
        timer.end = process.hrtime(timer.end);
        if (this.events.listenerCount('error')) {
          this.events.emit('error', err);
        }
      })
      .on('end', (err) => {
        timer.end = process.hrtime(timer.end);
      });
    this.events.emit('request', { request: req, options });

    if (cb) {
      handleCallback<T>(requestValue, cb, timer);
    } else {
      return handlePromise<T>(requestValue, timer);
    }
  }

  private getParams<T>(optionsOrCallback?: SearchOptions | SearchCallback<T>, callback?: SearchCallback<T>): [SearchOptions, SearchCallback<T>] {
    if (typeof optionsOrCallback === 'function') {
      return [{}, optionsOrCallback];
    } else {
      return [optionsOrCallback || {}, callback];
    }
  }
}
