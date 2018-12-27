import { SkillSet as SkillSetDef } from "azure-search-types";

import { SearchRequester } from "../search-requester";
import { SearchResourceGroup } from "../search-resource-group";
import { SkillSet } from "./skill-set";

/** Manage Azure Search skill sets */
export class SkillSets extends SearchResourceGroup<SkillSetDef> {

  constructor(requester: SearchRequester) {
    super(requester, 'skillsets');
  }

  /**
   * Use a named skill set
   * @param skillSetName name of the skill set
   */
  use(skillSetName: string) {
    return new SkillSet(this.requester, this.type, skillSetName);
  }
}
