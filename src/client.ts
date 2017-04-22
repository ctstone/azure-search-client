import _ = require('lodash');
import async = require('async');
import { Request, Response, ResponseCallback } from './request';
import { SearchCallback, SearchResponseProperties } from './types/response';
import { QueryOptions, SearchResult } from './types/search';

const API_VERSION = '2016-09-01';

const RESPONSE_PROPERTIES = [
  'client-request-id',
  'Content-Type',
  'Location',
  'OData-Version',
  'request-id',
  'elapsed-time',
  'ETag',
];

export class SearchClient {
  private request: Request;

  constructor(public name: string, private key: string, public apiVersion = API_VERSION) {
    this.request = new Request({
      baseUrl: `https://${this.name}.search.windows.net`,
      headers: {'api-key': this.key},
      json: true,
      qs: {'api-version': this.apiVersion},
    });
  }

  search(indexName: string, options: QueryOptions, callback: SearchCallback): void {
    this.request.post(`indexes/${indexName}/docs/search`, { body: options }, this.onResponse(callback));
  }

  createIndex(schema: any, callback: SearchCallback): void {
    this.request.post('indexes', { body: schema }, this.onResponse(callback));
  }

  createDatasource(datasource: any, callback: SearchCallback): void {
    this.request.post('datasources', { body: datasource }, this.onResponse(callback));
  }

  private onResponse(callback: SearchCallback): ResponseCallback {
    return (err: Error, response: Response) => {
      callback(err, err ? null : {
        properties: _.pick<SearchResponseProperties, any>(response.headers, RESPONSE_PROPERTIES),
        result: response.body,
        statusCode: response.statusCode,
      });
    };
  }
}
