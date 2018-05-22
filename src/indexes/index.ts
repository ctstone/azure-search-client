import { SearchRequester } from '../search-requester';
import { SearchResourceGroup } from '../search-resource-group';
import { SearchIndex } from './search-index';
import { IndexSchema } from './types';

export * from './search-index';

/** Manage an Azure Search index resource */
export class Indexes extends SearchResourceGroup<SearchIndex, IndexSchema> {

  /**
   * Manage an Azure Search index resource
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'indexes', SearchIndex);
  }
}
