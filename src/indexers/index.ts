import { Indexer as IndexerSchema } from 'azure-search-types';

import { SearchRequester } from "../search-requester";
import { SearchResourceGroup } from "../search-resource-group";
import { Indexer } from "./indexer";

export * from './indexer';

/**
 * Manage Azure Search indexer resources
 */
export class Indexers extends SearchResourceGroup<IndexerSchema> {
  /**
   * Manage Azure Search indexer resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'indexers');
  }

  /**
   * Use a named indexer
   * @param indexerName name of the indexer
   */
  use(indexerName: string) {
    return new Indexer(this.requester, this.type, indexerName);
  }
}
