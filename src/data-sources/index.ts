import { SearchRequester } from "../search-requester";
import { ISearchResource } from "../search-resource";
import { IResourceGroup, SearchResourceGroup } from "../search-resource-group";
import { DataSource, IDataSource } from "./data-source";
import { DataSourceSchema } from "./types";

export * from './data-source';

export interface IDataSources extends IResourceGroup<DataSourceSchema, IDataSource> {
}

/**
 * Manage Azure Search data source resources
 */
export class DataSources extends SearchResourceGroup<DataSource, DataSourceSchema, IDataSource> implements IDataSources {
  /**
   * Manage Azure Search data source resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'datasources', DataSource);
  }
}
