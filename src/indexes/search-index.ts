import { jsonParser } from "../parsers";
import { SearchRequester } from "../search-requester";
import { ISearchResource, SearchResource } from "../search-resource";
import { AzureSearchResponse, ListOptions, OptionsOrCallback, SearchCallback, SearchOptions } from '../types';
import { FacetBuilder, FieldName, QueryBuilder } from "./builders";
import {
  AnalyzeQuery,
  AnalyzeResults,
  DocumentParseOptions,
  IDocument,
  IndexDocument,
  IndexingResult,
  IndexingResults,
  IndexSchema,
  IndexStatistics,
  Query,
  SearchDocument,
  SearchResponse,
  SearchResults,
  SuggestQuery,
  SuggestResponse,
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
  IDocument,
  SearchResponse,
  SearchDocument,
};

export * from './types/search';

const MAX_INDEXING_BYTES = 16 * Math.pow(2, 20);
const MAX_INDEXING_COUNT = 1000;
const RE_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

interface IndexingBuffer {
  data: Buffer[];
  bytes: number;
  position: number;
  count: number;
}

/**
 * Manage Azure Search index resources
 */
export interface ISearchIndex<TDocument = any> extends ISearchResource<IndexSchema> {

  buildQuery(): QueryBuilder<TDocument>;

  /**
   * Execute a search query
   * @param query query to execute
   * @param options optional request options
   */
  search(query?: Query, options?: SearchOptions & DocumentParseOptions): Promise<SearchResponse<TDocument>>;
  search(query: Query, callback: SearchCallback<SearchResults<TDocument>>): void;
  search(query: Query, options: SearchOptions & DocumentParseOptions, callback: SearchCallback<SearchResults<TDocument>>): void;

  /**
   * Execute a suggest query
   * @param query query to execute
   * @param options optional request options
   */
  suggest(query: SuggestQuery, options?: SearchOptions & DocumentParseOptions): Promise<SuggestResponse<TDocument>>;
  suggest(query: SuggestQuery, callback: SearchCallback<SuggestResults<TDocument>>): void;
  suggest(query: SuggestQuery, options: SearchOptions & DocumentParseOptions, callback: SearchCallback<SuggestResults<TDocument>>): void;

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
  index(documents: Array<IndexDocument & TDocument>, options?: SearchOptions): Promise<IndexingResult[]>;

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
  lookup(key: string, options?: SearchOptions): Promise<AzureSearchResponse<IDocument & TDocument>>;
  lookup(key: string, callback: SearchCallback<IDocument & TDocument>): void;
  lookup(key: string, options: SearchOptions, callback: SearchCallback<IDocument & TDocument>): void;

  /**
   * Retrieve a count of the number of documents in a search index
   * @param options optional request options
   */
  count(options?: SearchOptions): Promise<AzureSearchResponse<number>>;
  count(callback: SearchCallback<number>): void;
  count(options: SearchOptions, callback: SearchCallback<number>): void;

  /**
   * Create a new FacetBuilder for this index
   */
  facet(field: FieldName<TDocument>): FacetBuilder<TDocument>;
}

export class SearchIndex<TDocument = any> extends SearchResource<IndexSchema> implements ISearchIndex<TDocument> {

  /**
   * Manage Azure Search index resources
   * @param requester http handler
   * @param type must be 'indexes'
   * @param name the name of the current search index
   */
  constructor(requester: SearchRequester, type: string, name: string) {
    super(requester, type, name);
  }

  buildQuery(): QueryBuilder<TDocument> {
    return new QueryBuilder<TDocument>(this);
  }

  search(query: Query, optionsOrCallback?: (SearchOptions & DocumentParseOptions) | SearchCallback<SearchResults<TDocument>>, callback?: SearchCallback<SearchResults<TDocument>>) {
    const options: SearchOptions & DocumentParseOptions = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback || {};
    if (options.parseDates === undefined) {
      options.parseDates = true;
    }
    return this.request<SearchResults<TDocument>>({
      method: 'post',
      path: '/docs/search',
      body: query,
      parser: jsonParser((key, value) => {
        if (options.parseDates && typeof value === 'string' && RE_DATE.test(value)) {
          value = new Date(value);
        }
        return value;
      }),
    }, optionsOrCallback, callback);
  }

  suggest(query: SuggestQuery, optionsOrCallback?: (SearchOptions & DocumentParseOptions) | SearchCallback<SuggestResults<TDocument>>, callback?: SearchCallback<SuggestResults<TDocument>>) {
    const options: DocumentParseOptions = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback || {};
    if (options.parseDates === undefined) {
      options.parseDates = true;
    }
    return this.request<SuggestResults<TDocument>>({
      method: 'post',
      path: '/docs/suggest',
      body: query,
      parser: jsonParser((key, value) => {
        if (options.parseDates && typeof value === 'string' && RE_DATE.test(value)) {
          value = new Date(value);
        }
        return value;
      }),
    }, optionsOrCallback, callback);
  }

  analyze(query: AnalyzeQuery, optionsOrCallback?: OptionsOrCallback<AnalyzeResults>, callback?: SearchCallback<AnalyzeResults>) {
    return this.request<AnalyzeResults>({
      method: 'post',
      path: '/analyze',
      body: query,
    }, optionsOrCallback, callback);
  }

  async index(documents: Array<IndexDocument & TDocument>, options?: SearchOptions) {
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
          if (buffer.count > 0) {
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

  lookup(key: string, optionsOrCallback?: (SearchOptions & ListOptions & DocumentParseOptions) | SearchCallback<IDocument & TDocument>, callback?: SearchCallback<IDocument & TDocument>) {
    const options: DocumentParseOptions = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback || {};
    if (options.parseDates === undefined) {
      options.parseDates = true;
    }
    return this.request<IDocument & TDocument>({
      method: 'get',
      path: `/docs/${key}`,
      parser: jsonParser((key, value) => {
        if (options.parseDates && typeof value === 'string' && RE_DATE.test(value)) {
          value = new Date(value);
        }
        return value;
      }),
    }, optionsOrCallback, callback);
  }

  count(optionsOrCallback?: OptionsOrCallback<number>, callback?: SearchCallback<number>) {
    return this.request<number>({
      method: 'get',
      path: '/docs/$count',
      headers: { accept: 'text/plain' },
      parser: jsonParser(),
    }, optionsOrCallback, callback);
  }

  facet(field: FieldName<TDocument>) {
    return new FacetBuilder<TDocument>(field);
  }
}
