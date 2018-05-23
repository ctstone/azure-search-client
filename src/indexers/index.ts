import { SearchRequester } from "../search-requester";
import { IResourceGroup, SearchResourceGroup } from "../search-resource-group";
import { IIndexer, Indexer } from "./indexer";
import { IndexerSchema } from "./types";

export * from './indexer';

export interface IIndexers extends IResourceGroup<IndexerSchema, IIndexer> {
}

/**
 * Manage Azure Search indexer resources
 */
export class Indexers extends SearchResourceGroup<Indexer, IndexerSchema, IIndexer> {
  /**
   * Manage Azure Search indexer resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'indexers', Indexer);
  }
}
