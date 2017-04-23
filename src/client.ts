import _ = require('lodash');
import async = require('async');
import { Request, Response, ResponseCallback } from './request';
import { SearchCallback, SearchResponseProperties } from './types/response';
import { QueryOptions, SearchResult } from './types/search';

const API_VERSION = '2016-09-01';

const RESPONSE_PROPERTIES = [
  'client-request-id',
  'content-type',
  'location',
  'odata-version',
  'request-id',
  'elapsed-time',
  'etag',
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

  search(indexName: string, options: QueryOptions, callback: SearchCallback<SearchResult>): void {
    this.request.post(`indexes/${indexName}/docs/search`, { body: options || {} }, this.onResponse(callback));
  }

  createIndex(schema: any, callback: SearchCallback<any>): void {
    this.request.post('indexes', { body: schema }, this.onResponse(callback));
  }

  createDatasource(datasource: any, callback: SearchCallback<any>): void {
    this.request.post('datasources', { body: datasource }, this.onResponse(callback));
  }

  createIndexer(indexer: any, callback: SearchCallback<any>): void {
    this.request.post('indexers', { body: indexer }, this.onResponse(callback));
  }

  runIndexer(indexer: string, callback: SearchCallback<any>): void {
    this.request.post(`indexers/${indexer}`, null, this.onResponse(callback));
  }

  private onResponse(callback: SearchCallback<any>): ResponseCallback {
    return (err: Error, response: Response) => {
      callback(err, response ? {
        properties: _.pick<SearchResponseProperties, any>(response.headers, RESPONSE_PROPERTIES),
        result: response.body,
        statusCode: response.statusCode,
      } : null);
    };
  }
}
