import { AzureSearchResponse, ListResults } from "../../types";
import { IDocument } from './search';

export interface SuggestQuery {
  filter: string;
  fuzzy: boolean;
  highlightPreTag: string;
  highlightPostTag: string;
  minimumCoverage: number;
  orderby: string;
  search: string;
  searchFields: string;
  select: string;
  top: number;
}

export interface SuggestResults<T> extends ListResults<T & SuggestDocument> {
  '@search.coverage': number;
}

export interface SuggestDocument extends IDocument {
  '@search.text': string;
}

export interface SuggestResponse<T> extends AzureSearchResponse<SuggestResults<T>> {
}
