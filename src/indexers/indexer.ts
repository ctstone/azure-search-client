import { Indexer as IndexerSchema, IndexerStatusResult } from 'azure-search-types';

import { SearchRequester } from '../search-requester';
import { SearchResource } from '../search-resource';
import { AzureSearchResponse, OptionsOrCallback, SearchCallback, SearchOptions } from '../types';

export { IndexerStatusResult, IndexerSchema };

/**
 * Manage an Azure Search indexer resource
 */
export class Indexer extends SearchResource<IndexerSchema> {

  /**
   * Manage an Azure Search indexer resource
   * @param requester http handler
   * @param type must be 'indexers'
   * @param name name of the current indexer
   */
  constructor(requester: SearchRequester, type: string, name: string) {
    super(requester, type, name);
  }

  /**
   * Run the current indexer
   * @param options optional search options
   */
  run(options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  run(callback: SearchCallback<void>): void;
  run(options: SearchOptions, callback: SearchCallback<void>): void;
  run(optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'post',
      path: '/run',
    }, optionsOrCallback, callback);
  }

  /**
   * Get status for the current indexer
   * @param options optional search options
   */
  status(options?: SearchOptions): Promise<AzureSearchResponse<IndexerStatusResult>>;
  status(callback: SearchCallback<IndexerStatusResult>): void;
  status(options: SearchOptions, callback: SearchCallback<IndexerStatusResult>): void;
  status(optionsOrCallback?: OptionsOrCallback<IndexerStatusResult>, callback?: SearchCallback<IndexerStatusResult>) {
    return this.request<IndexerStatusResult>({
      method: 'get',
      path: '/status',
    }, optionsOrCallback, callback);
  }

  /**
   * Reset tracking state for the current indexer
   * @param options optional search options
   */
  reset(options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  reset(callback: SearchCallback<void>): void;
  reset(options: SearchOptions, callback: SearchCallback<void>): void;
  reset(optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'post',
      path: '/reset',
    }, optionsOrCallback, callback);
  }
}
