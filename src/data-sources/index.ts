import { DataSource as DataSourceSchema } from 'azure-search-types';

import { SearchRequester } from "../search-requester";
import { SearchResourceGroup } from "../search-resource-group";
import { DataSource } from "./data-source";

export * from './data-source';

/**
 * Manage Azure Search data source resources
 */
export class DataSources extends SearchResourceGroup<DataSourceSchema> {
  /**
   * Manage Azure Search data source resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'datasources');
  }

  /**
   * Use a named data source
   * @param dataSourceName name of the data source
   */
  use(dataSourceName: string) {
    return new DataSource(this.requester, this.type, dataSourceName);
  }
}
