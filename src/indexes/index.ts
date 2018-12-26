import { Document as IDocument, Index as IndexSchema } from 'azure-search-types';

import { SearchRequester } from '../search-requester';
import { SearchResourceGroup } from '../search-resource-group';
import { SearchIndex } from './search-index';

export * from './builders';
export * from './search-index';

/** Manage an Azure Search index resource */
export class Indexes extends SearchResourceGroup<IndexSchema> {

  /**
   * Manage an Azure Search index resource
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'indexes');
  }

  /**
   * Use a named search index
   * @param indexName name of the search index
   */
  use<TDocument = IDocument>(indexName: string) {
    return new SearchIndex<TDocument>(this.requester, this.type, indexName);
  }
}
