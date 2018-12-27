import { ServiceStatisticsResult } from 'azure-search-types';

import { DataSources } from './data-sources';
import { Indexers } from './indexers';
import { Indexes } from './indexes';
import { SearchRequester } from './search-requester';
import { SkillSets } from './skill-sets';
import { SynonymMaps } from './synonym-maps';
import { AzureSearchResponse, ErrorCallback, OptionsOrCallback, RequestCallback, ResponseCallback, SearchCallback, SearchOptions } from './types';

const DEFAULT_VERSION = '2017-11-11';

export enum ApiVersion {
  default = '2017-11-11',
  preview = '2017-11-11-preview',
}

/** Azure Search service */
export class SearchService {

  /** Access data sources for the current Azure Search service */
  dataSources: DataSources;

  /** Access indexers for the current Azure Search service */
  indexers: Indexers;

  /** Access indexes for the current Azure Search service */
  indexes: Indexes;

  /** Access synonym maps for the current Azure Search service */
  synonymMaps: SynonymMaps;

  /** Access skill sets for the current Azure Search service */
  skillSets: SkillSets;

  private requester: SearchRequester;

  /**
   * Create a new Azure Search service client
   * @param service name of the service
   * @param adminKey one or both admin keys (currently only the first key is used)
   * @param defaultVersion default API version for each request (default can be overwritten for each request)
   */
  constructor(public service: string, adminKey: string|string[], public defaultVersion = DEFAULT_VERSION) {
    this.requester = new SearchRequester(service, adminKey, defaultVersion);
    this.dataSources = new DataSources(this.requester);
    this.indexers = new Indexers(this.requester);
    this.indexes = new Indexes(this.requester);
    this.synonymMaps = new SynonymMaps(this.requester);
    this.skillSets = new SkillSets(this.requester);
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

  /**
   * Get service level usage statistics
   * @param options optional request options
   */
  statistics(options?: SearchOptions): Promise<AzureSearchResponse<ServiceStatisticsResult>>;
  statistics(callback: SearchCallback<ServiceStatisticsResult>): void;
  statistics(options: SearchOptions, callback: SearchCallback<ServiceStatisticsResult>): void;
  statistics(optionsOrCallback?: OptionsOrCallback<ServiceStatisticsResult>, callback?: SearchCallback<ServiceStatisticsResult>) {
    return this.requester.request<ServiceStatisticsResult>({
      method: 'get',
      path: '/servicestats',
    }, optionsOrCallback, callback);
  }
}
