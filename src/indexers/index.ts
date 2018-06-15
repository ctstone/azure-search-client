import { SearchRequester } from "../search-requester";
import { IResourceGroup, SearchResourceGroup } from "../search-resource-group";
import { IIndexer, Indexer } from "./indexer";
import { IndexerSchema } from "./types";

export * from './indexer';

export interface IIndexers extends IResourceGroup<IndexerSchema> {
  /**
   * Use a named indexer
   * @param indexerName name of the indexer
   */
  use(indexerName: string): IIndexer;
}

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

  use(indexerName: string) {
    return new Indexer(this.requester, this.type, indexerName);
  }
}
