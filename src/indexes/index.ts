import { SearchRequester } from '../search-requester';
import { IResourceGroup, SearchResourceGroup } from '../search-resource-group';
import { ISearchIndex, SearchIndex } from './search-index';
import { IndexSchema } from './types';

export * from './search-index';

export interface IIndexes extends IResourceGroup<IndexSchema, ISearchIndex> {
}

/** Manage an Azure Search index resource */
export class Indexes extends SearchResourceGroup<SearchIndex, IndexSchema, ISearchIndex> implements IIndexes {

  /**
   * Manage an Azure Search index resource
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'indexes', SearchIndex);
  }
}
