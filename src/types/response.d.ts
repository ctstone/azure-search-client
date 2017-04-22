export interface SearchResponseProperties {
  'client-request-id'?: string;
  'content-type'?: string;
  'location'?: string;
  'odata-version'?: string;
  'request-id': string;
  'elapsed-time': number;
  'etag'?: string;
}

export interface SearchResponse {
  result?: SearchResult;
  statusCode: number;
  properties: SearchResponseProperties;
}

export type SearchCallback = (err: Error, response: SearchResponse) => void;
