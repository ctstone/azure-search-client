import { AzureSearchResponse, ListResults } from "../../types";

export interface Query {
  count?: boolean;
  facets?: string[];
  filter?: string;
  highlight?: string;
  highlightPreTag?: string;
  highlightPostTag?: string;
  minimumCoverage?: number;
  orderby?: string;
  scoringParameters?: string[];
  scoringProfile?: string;
  search?: string;
  searchFields?: string;
  searchMode?: 'any' | 'all';
  select?: string;
  skip?: number;
  top?: number;
  queryType?: 'simple' | 'full';
}

export interface Facets {
  [field: string]: Facet & FacetRange;
}

export interface Highlights {
  [field: string]: string[];
}

export interface FacetRange {
  value: FieldValue;
  from: number;
  to: number;
}

export interface Facet {
  value: FieldValue;
  count: number;
}

export interface GeoJSON {
  type: 'Point';
  /**
   * [longitude, latitude]
   */
  coordinates: [number, number];
}

export interface Document {
  [field: string]: FieldValue;
}

export interface SearchDocument extends Document {
  '@search.score': number;
  '@search.highlights'?: Highlights;
}

export interface SearchResults<T> extends ListResults<T & SearchDocument> {
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  '@search.facets'?: Facets;
  '@search.nextPageParameters'?: Query;
  '@search.coverage'?: number;
}

export interface SearchResponse<T> extends AzureSearchResponse<SearchResults<T>> {
}

export interface DocumentParseOptions {
  parseDates?: boolean;
}

export type FieldValue = string | number | boolean | string[] | GeoJSON | any;
