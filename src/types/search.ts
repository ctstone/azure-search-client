export interface SearchResultDocument {
  '@search.highlights'?: {[key: string]: string|string[]};
  '@search.score': number;
  [key: string]: any;
}

export interface SearchResult {
  '@odata.context': string;
  '@odata.facets'?: {[key: string]: any};
  value: SearchResultDocument[];
}

export interface QueryOptions {
  count?: boolean;
  facets?: string[];
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
  queryType?: 'full' | 'simple';
}
