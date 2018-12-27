import { SkillSet as SkillSetDef } from 'azure-search-types';

import { SearchRequester } from '../search-requester';
import { SearchResource } from "../search-resource";

export { SkillSetDef };

export class SkillSet extends SearchResource<SkillSetDef> {
  /**
   * Manage an Azure Search skill set resource
   * @param requester http handler
   * @param type must be 'skillsets'
   * @param name name of the current skill set
   */
  constructor(requester: SearchRequester, type: string, name: string) {
    super(requester, type, name);
  }
}
