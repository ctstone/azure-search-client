import { SearchRequester } from "../search-requester";
import { SearchResourceGroup } from "../search-resource-group";
import { DataSource } from "./data-source";
import { DataSourceSchema } from "./types";

export * from './data-source';

/**
 * Manage Azure Search data source resources
 */
export class DataSources extends SearchResourceGroup<DataSource, DataSourceSchema> {
  /**
   * Manage Azure Search data source resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'datasources', DataSource);
  }
}
