import { Indexes } from ".";
import { jsonParser } from "../parsers";
import { SearchRequester } from "../search-requester";
import { SearchResource, ISearchResource } from "../search-resource";
import { AzureSearchResponse, ListOptions, OptionsOrCallback, SearchCallback, SearchOptions } from '../types';
import {
  AnalyzeQuery,
  AnalyzeResults,
  Document,
  IndexDocument,
  IndexingResult,
  IndexingResults,
  IndexSchema,
  IndexStatistics,
  Query,
  SearchResponse,
  SearchResults,
  SuggestQuery,
  SuggestResults,
} from './types';

export {
  IndexSchema,
  Query,
  SuggestQuery,
  AnalyzeQuery,
  IndexDocument,
  SearchResults,
  SuggestResults,
  AnalyzeResults,
  IndexingResults,
  IndexStatistics,
  Document,
};

const MAX_INDEXING_BYTES = 16 * Math.pow(2, 20);
const MAX_INDEXING_COUNT = 1000;

interface IndexingBuffer {
  data: Buffer[];
  bytes: number;
  position: number;
  count: number;
}

/**
 * Manage Azure Search index resources
 */
export interface ISearchIndex extends ISearchResource<IndexSchema> {
  /**
   * Execute a search query
   * @param query query to execute
   * @param options optional request options
   */
  search<T>(query: Query, options?: SearchOptions): Promise<AzureSearchResponse<SearchResults<T>>>;
  search<T>(query: Query, callback: SearchCallback<SearchResults<T>>): void;
  search<T>(query: Query, options: SearchOptions, callback: SearchCallback<SearchResults<T>>): void;

  /**
   * Execute a suggest query
   * @param query query to execute
   * @param options optional request options
   */
  suggest<T>(query: SuggestQuery, options?: SearchOptions): Promise<AzureSearchResponse<SuggestResults<T>>>;
  suggest<T>(query: SuggestQuery, callback: SearchCallback<SuggestResults<T>>): void;
  suggest<T>(query: SuggestQuery, options: SearchOptions, callback: SearchCallback<SuggestResults<T>>): void;

  /**
   * Perform indexing analysis on text
   * @param query query to execute
   * @param options optional request options
   */
  analyze(query: AnalyzeQuery, options?: SearchOptions): Promise<AzureSearchResponse<AnalyzeResults>>;
  analyze(query: AnalyzeQuery, callback: SearchCallback<AnalyzeResults>): void;
  analyze(query: AnalyzeQuery, options: SearchOptions, callback: SearchCallback<AnalyzeResults>): void;

  /**
   * Add, remove, or update documents in the search index. This function handles batching of content to fit within indexing request limits.
   * @param documents documents to index
   * @param options optional request options
   */
  index(documents: IndexDocument[], options?: SearchOptions): Promise<IndexingResult[]>;

  /**
   * Get document count and usage for the current index
   * @param options optional request options
   */
  statistics(options?: SearchOptions): Promise<AzureSearchResponse<IndexStatistics>>;
  statistics(callback: SearchCallback<IndexStatistics>): void;
  statistics(options: SearchOptions, callback: SearchCallback<IndexStatistics>): void;

  /**
   * Retrieve a single document from the current index
   * @param key document key
   * @param options optional request options
   */
  lookup(key: string, options?: SearchOptions): Promise<AzureSearchResponse<Document>>;
  lookup(key: string, callback: SearchCallback<Document>): void;
  lookup(key: string, options: SearchOptions, callback: SearchCallback<Document>): void;

  /**
   * Retrieve a count of the number of documents in a search index
   * @param options optional request options
   */
  count(options?: SearchOptions): Promise<AzureSearchResponse<number>>;
  count(callback: SearchCallback<number>): void;
  count(options: SearchOptions, callback: SearchCallback<number>): void;
}

export class SearchIndex extends SearchResource<IndexSchema> implements ISearchIndex {

  /**
   * Manage Azure Search index resources
   * @param requester http handler
   * @param type must be 'indexes'
   * @param name the name of the current search index
   */
  constructor(requester: SearchRequester, type: string, name: string) {
    super(requester, type, name);
  }

  search<T>(query: Query, optionsOrCallback?: OptionsOrCallback<SearchResults<T>>, callback?: SearchCallback<SearchResults<T>>) {
    return this.request<SearchResults<T>>({
      method: 'post',
      path: '/docs/search',
      body: query,
    }, optionsOrCallback, callback);
  }

  suggest<T>(query: SuggestQuery, optionsOrCallback?: OptionsOrCallback<SuggestResults<T>>, callback?: SearchCallback<SuggestResults<T>>) {
    return this.request<SuggestResults<T>>({
      method: 'post',
      path: '/docs/suggest',
      body: query,
    }, optionsOrCallback, callback);
  }

  analyze(query: AnalyzeQuery, optionsOrCallback?: OptionsOrCallback<AnalyzeResults>, callback?: SearchCallback<AnalyzeResults>) {
    return this.request<AnalyzeResults>({
      method: 'post',
      path: '/analyze',
      body: query,
    }, optionsOrCallback, callback);
  }

  async index(documents: IndexDocument[], options?: SearchOptions) {
    const buffer: IndexingBuffer = { data: [], bytes: 0, position: 0, count: 0 };
    const comma = Buffer.from(',');
    const open = Buffer.from('{"value":[');
    const close = Buffer.from(']}');
    const append = (buf: Buffer) => {
      buffer.data.push(buf);
      buffer.bytes += buf.byteLength;
    };
    const reset = () => {
      buffer.data.length = 0;
      buffer.bytes = 0;
      buffer.count = 0;
      append(open);
    };

    let results: IndexingResult[] = [];

    do {
      reset();
      while (buffer.position < documents.length && buffer.count < MAX_INDEXING_COUNT) {
        const next = Buffer.from(JSON.stringify(documents[buffer.position]));
        if (next.byteLength > MAX_INDEXING_BYTES) {
          throw new Error(`Document at position ${buffer.position} contains ${next.byteLength} bytes, which exceeds maximum of ${MAX_INDEXING_BYTES}`);
        } else if (next.byteLength + comma.byteLength + close.byteLength + buffer.bytes > MAX_INDEXING_BYTES) {
          break;
        } else {
          if (buffer.position > 0) {
            append(comma);
          }
          append(next);
          buffer.position += 1;
          buffer.count += 1;
        }
      }
      append(close);
      const data = Buffer.concat(buffer.data);
      const resp = await this.request<IndexingResults>({
        method: 'post',
        path: '/docs/index',
        headers: { 'content-type': 'application/json' },
        body: data,
      }, options);
      results = results.concat(resp.result.value);
    } while (buffer.position < documents.length);

    return results;
  }

  // TODO implement callback style index()?

  statistics(optionsOrCallback?: OptionsOrCallback<IndexStatistics>, callback?: SearchCallback<IndexStatistics>) {
    return this.request<IndexStatistics>({
      method: 'get',
      path: '/stats',
    }, optionsOrCallback, callback);
  }

  lookup(key: string, optionsOrCallback?: (SearchOptions & ListOptions) | SearchCallback<Document>, callback?: SearchCallback<Document>) {
    return this.request<Document>({
      method: 'get',
      path: `/docs/${key}`,
    }, optionsOrCallback, callback);
  }

  count(optionsOrCallback?: OptionsOrCallback<number>, callback?: SearchCallback<number>) {
    return this.request<number>({
      method: 'get',
      path: '/docs/$count',
      headers: { accept: 'text/plain' },
      parser: jsonParser,
    }, optionsOrCallback, callback);
  }
}
