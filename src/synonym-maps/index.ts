import { SearchRequester } from "../search-requester";
import { SearchResourceGroup } from "../search-resource-group";
import { SynonymMap, SynonymMapSchema } from "./synonym-map";

export * from './synonym-map';

/**
 * Manage Azure Search synonym map resources
 */
export class SynonymMaps extends SearchResourceGroup<SynonymMapSchema> {

  /**
   * Manage Azure Search synonym map resources
   * @param requester http handler
   */
  constructor(requester: SearchRequester) {
    super(requester, 'synonymmaps');
  }

  /**
   * Use a named synonym map
   * @param synonymMapName name of the synonym map
   */
  use(synonymMapName: string) {
    return new SynonymMap(this.requester, this.type, synonymMapName);
  }
}
