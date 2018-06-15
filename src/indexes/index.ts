import { SearchRequester } from '../search-requester';
import { IResourceGroup, SearchResourceGroup } from '../search-resource-group';
import { ISearchIndex, SearchIndex } from './search-index';
import { IDocument, IndexSchema } from './types';

export * from './builders';
export * from './search-index';

export interface IIndexes extends IResourceGroup<IndexSchema> {
  /**
   * Use a named search index
   * @param indexName name of the search index
   */
  use<TDocument = IDocument>(indexName: string): ISearchIndex<TDocument>;
}

/** Manage an Azure Search index resource */
export class Indexes extends SearchResourceGroup<IndexSchema> implements IIndexes {

  /**
   * Manage an Azure Search index resource
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'indexes');
  }

  use<TDocument = any>(indexName: string) {
    return new SearchIndex<TDocument>(this.requester, this.type, indexName);
  }
}
