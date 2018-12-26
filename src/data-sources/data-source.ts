import { DataSource as DataSourceSchema } from 'azure-search-types';

import { SearchRequester } from '../search-requester';
import { SearchResource } from '../search-resource';

/**
 * Manage an Azure Search data source resource
 */
export class DataSource extends SearchResource<DataSourceSchema> {

  /**
   * Manage an Azure Search data source resource
   * @param requester http handler
   * @param type must be 'datasources'
   * @param name the name of the current data source
   */
  constructor(requester: SearchRequester, type: string, name: string) {
    super(requester, type, name);
  }
}
