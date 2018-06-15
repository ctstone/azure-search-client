import { SearchRequester } from "../search-requester";
import { IResourceGroup, SearchResourceGroup } from "../search-resource-group";
import { ISynonymMap, SynonymMap, SynonymMapSchema } from "./synonym-map";

export * from './synonym-map';

export interface ISynonymMaps extends IResourceGroup<SynonymMapSchema> {
  /**
   * Use a named synonym map
   * @param indexName name of the synonym map
   */
  use(synonymMapName: string): ISynonymMap;
}

/**
 * Manage Azure Search synonym map resources
 */
export class SynonymMaps extends SearchResourceGroup<SynonymMapSchema> implements ISynonymMaps {

  /**
   * Manage Azure Search synonym map resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'synonymmaps');
  }

  use(synonymMapName: string) {
    return new SynonymMap(this.requester, this.type, synonymMapName);
  }
}
