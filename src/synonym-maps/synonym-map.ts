import { SynonymMap as SynonymMapSchema } from 'azure-search-types';

import { SearchRequester } from "../search-requester";
import { SearchResource } from "../search-resource";

export { SynonymMapSchema };

/**
 * Manage an Azure Search synonym map resource
 */
export class SynonymMap extends SearchResource<SynonymMapSchema> {

  /**
   * Manage an Azure Search synonym map resource
   * @param requester http handler
   * @param type must be 'synonymmaps'
   * @param name name of the current synonym map
   */
  constructor(requester: SearchRequester, type: string, name: string) {
    super(requester, type, name);
  }
}
