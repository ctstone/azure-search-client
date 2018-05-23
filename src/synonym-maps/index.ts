import { SearchRequester } from "../search-requester";
import { IResourceGroup, SearchResourceGroup } from "../search-resource-group";
import { ISynonymMap, SynonymMap, SynonymMapSchema } from "./synonym-map";

export * from './synonym-map';

export interface ISynonymMaps extends IResourceGroup<SynonymMapSchema, ISynonymMap> {
}

/**
 * Manage Azure Search synonym map resources
 */
export class SynonymMaps extends SearchResourceGroup<SynonymMap, SynonymMapSchema, ISynonymMap> implements ISynonymMaps {

  /**
   * Manage Azure Search synonym map resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'synonymmaps', SynonymMap);
  }
}
