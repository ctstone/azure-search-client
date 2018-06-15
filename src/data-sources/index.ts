import { SearchRequester } from "../search-requester";
import { IResourceGroup, SearchResourceGroup } from "../search-resource-group";
import { DataSource, IDataSource } from "./data-source";
import { DataSourceSchema } from "./types";

export * from './data-source';

export interface IDataSources extends IResourceGroup<DataSourceSchema> {
  /**
   * Use a named data source
   * @param dataSourceName name of the data source
   */
  use(dataSourceName: string): IDataSource;
}

/**
 * Manage Azure Search data source resources
 */
export class DataSources extends SearchResourceGroup<DataSourceSchema> implements IDataSources {
  /**
   * Manage Azure Search data source resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'datasources');
  }

  use(dataSourceName: string) {
    return new DataSource(this.requester, this.type, dataSourceName);
  }
}
