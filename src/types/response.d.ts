export interface SearchResponseProperties {
  'client-request-id'?: string;
  'content-type'?: string;
  'location'?: string;
  'odata-version'?: string;
  'request-id': string;
  'elapsed-time': number;
  'etag'?: string;
}

export interface SearchResponse<T> {
  result?: T;
  statusCode: number;
  properties: SearchResponseProperties;
}

export type SearchCallback<T> = (err: Error, response: SearchResponse<T>) => void;
