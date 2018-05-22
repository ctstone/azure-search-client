import { SearchRequester } from "../search-requester";
import { SearchResourceGroup } from "../search-resource-group";
import { Indexer } from "./indexer";
import { IndexerSchema } from "./types";

export * from './indexer';

/**
 * Manage Azure Search indexer resources
 */
export class Indexers extends SearchResourceGroup<Indexer, IndexerSchema> {
  /**
   * Manage Azure Search indexer resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'indexers', Indexer);
  }
}
