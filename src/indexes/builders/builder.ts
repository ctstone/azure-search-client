import { ISearchIndex } from "../search-index";
import { FacetBuilder } from "./facet-builder";
import { FieldName, QueryBuilder } from "./query-builder";
import { QueryFilter } from "./query-filter";

export class Builder<TDocument> {
  get query() { return new QueryBuilder<TDocument>(this.index); }
  get filter() { return new QueryFilter<TDocument>(); }

  constructor(private index: ISearchIndex<TDocument>) { }

  facet(fieldName: FieldName<TDocument>) {
    return new FacetBuilder<TDocument>(fieldName);
  }
}
