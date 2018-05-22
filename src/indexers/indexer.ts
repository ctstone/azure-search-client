import { Indexers } from '.';
import { SearchRequester } from '../search-requester';
import { SearchResource } from '../search-resource';
import { AzureSearchResponse, SearchOptions } from '../types';
import { IndexerSchema, IndexerStatusResult } from './types';

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
  run(options?: SearchOptions) {
    return this.request<void>({
      method: 'post',
      path: '/run',
    }, options);
  }

  /**
   * Get status for the current indexer
   * @param options optional search options
   */
  status(options?: SearchOptions) {
    return this.request<IndexerStatusResult>({
      method: 'get',
      path: '/status',
    }, options);
  }

  /**
   * Reset tracking state for the current indexer
   * @param options optional search options
   */
  reset(options?: SearchOptions) {
    return this.request<void>({
      method: 'post',
      path: '/reset',
    }, options);
  }
}
