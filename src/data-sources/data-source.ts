import { SearchRequester } from '../search-requester';
import { ISearchResource, SearchResource } from '../search-resource';
import { DataSourceSchema } from './types';

export { DataSourceSchema };

export interface IDataSource extends ISearchResource<DataSourceSchema> {
}

/**
 * Manage an Azure Search data source resource
 */
export class DataSource extends SearchResource<DataSourceSchema> implements IDataSource {

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
