import request = require('request');
import _ = require('lodash');
import async = require('async');

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

type RequestAPI = request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
type RequestOptions = request.RequiredUriUrl & request.CoreOptions;

export interface QueryOptions {
  count?: boolean;
  facets?: string[];
  highlight?: string;
  highlightPreTag?: string;
  highlightPostTag?: string;
  minimumCoverage?: number;
  orderby?: string;
  scoringParameters?: string[];
  scoringProfile?: string;
  search?: string;
  searchFields?: string;
  searchMode?: 'any' | 'all';
  select?: string;
  skip?: number;
  top?: number;
  queryType?: 'full' | 'simple';
}

export interface SearchResponseProperties {
  'client-request-id'?: string;
  'content-type'?: string;
  'location'?: string;
  'odata-version'?: string;
  'request-id': string;
  'elapsed-time': number;
  'etag'?: string;
}

export interface SearchResultDocument {
  '@search.highlights'?: {[key: string]: string|string[]};
  '@search.score': number;
  [key: string]: any;
}

export interface SearchResult {
  '@odata.context': string;
  '@odata.facets'?: {[key: string]: any};
  value: SearchResultDocument[];
}

export interface SearchResponse {
  result?: SearchResult;
  statusCode: number;
  properties: SearchResponseProperties;
}

export type SearchCallback = (err: Error, response: SearchResponse) => void;

export class SearchClient {
  private request: RequestAPI;

  constructor(public name: string, private key: string, public apiVersion = API_VERSION) {
    this.request = request.defaults({
      baseUrl: `https://${this.name}.search.windows.net`,
      headers: {'api-key': this.key},
      json: true,
      qs: {'api-version': this.apiVersion},
    });
  }

  query(indexName: string, options: QueryOptions, callback: SearchCallback): void {
    const uri = `indexes/${indexName}/docs/search`;
    async.waterfall([
      (next: request.RequestCallback) => {
        this.request.post(uri, {body: options}, next);
      },
      (resp: request.RequestResponse, body: any, next: SearchCallback) => {
        if (resp.statusCode < 200 || resp.statusCode >= 300) {
          next(new Error(`Search returned HTTP ${resp.statusCode}`), null);
          return;
        }

        next(null, {
          properties: _.pick(resp.headers, RESPONSE_PROPERTIES) as SearchResponseProperties,
          result: body,
          statusCode: resp.statusCode,
        });
      },
    ], callback);
  }
}
