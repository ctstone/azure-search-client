import { DataSources, IDataSources } from './data-sources';
import { IIndexers, Indexers } from './indexers';
import { IIndexes, Indexes } from './indexes';
import { SearchRequester } from './search-requester';
import { ISynonymMaps, SynonymMaps } from './synonym-maps';
import { AzureSearchResponse, ErrorCallback, OptionsOrCallback, RequestCallback, ResponseCallback, SearchCallback, SearchOptions, ServiceStatisticsResult } from './types';

const DEFAULT_VERSION = '2017-11-11';

export interface ISearchService {
  /**
   * Get service level usage statistics
   * @param options optional request options
   */
  statistics(options?: SearchOptions): Promise<AzureSearchResponse<ServiceStatisticsResult>>;
  statistics(callback: SearchCallback<ServiceStatisticsResult>): void;
  statistics(options: SearchOptions, callback: SearchCallback<ServiceStatisticsResult>): void;
}

/** Azure Search service */
export class SearchService implements ISearchService {

  /** Access data sources for the current Azure Search service */
  dataSources: IDataSources;

  /** Access indexers for the current Azure Search service */
  indexers: IIndexers;

  /** Access indexes for the current Azure Search service */
  indexes: IIndexes;

  /** Access synonym maps for the current Azure Search service */
  synonymMaps: ISynonymMaps;

  private requester: SearchRequester;

  /**
   * Create a new Azure Search service client
   * @param service name of the service
   * @param adminKey one or both admin keys (currently only the first key is used)
   * @param defaultVersion default API version for each request (default may be overwritten for each request)
   */
  constructor(public service: string, adminKey: string|string[], public defaultVersion = DEFAULT_VERSION) {
    this.requester = new SearchRequester(service, adminKey, defaultVersion);
    this.dataSources = new DataSources(this.requester);
    this.indexers = new Indexers(this.requester);
    this.indexes = new Indexes(this.requester);
    this.synonymMaps = new SynonymMaps(this.requester);
  }

  /**
   * Subscribe to search events
   * @param type event type (may be 'error', 'response', or 'request')
   * @param callback event handler
   */
  on(type: 'error' | 'response' | 'request', callback: RequestCallback | ResponseCallback | ErrorCallback) {
    this.requester.events.on(type, callback);
  }

  /**
   * Remove an event listener
   * @param type event type (may be 'error', 'response', or 'request')
   * @param listener event handler to remove
   */
  removeListener(type: string, listener: (...args: any[]) => void) {
    this.requester.events.removeListener(type, listener);
  }

  statistics(optionsOrCallback?: OptionsOrCallback<ServiceStatisticsResult>, callback?: SearchCallback<ServiceStatisticsResult>) {
    return this.requester.request<ServiceStatisticsResult>({
      method: 'get',
      path: '/servicestats',
    }, optionsOrCallback, callback);
  }
}
