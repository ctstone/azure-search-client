export interface IndexSchema {
  name?: string;
  fields: FieldSchema[];
  suggesters?: SuggesterSchema[];
  scoringProfiles?: ScoringProfileSchema[];
  analyzers?: any[];
  charFilters?: any[];
  tokenizers?: any[];
  tokenFilters?: any[];
  defaultScoringProfile?: string;
  corsOptions?: {
    allowedOrigins: ['*'] | string[];
    maxAgeInSeconds?: number;
  };
}

export interface FieldSchema {
  name: string;
  type: 'Edm.String' | 'Collection(Edm.String)' | 'Edm.Int32' | 'Edm.Int64' | 'Edm.Double' | 'Edm.Boolean' | 'Edm.DateTimeOffset' | 'Edm.GeographyPoint';
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
  facetable: boolean;
  key: boolean;
  retrievable: boolean;
  analyzer: string;
  searchAnalyzer: string;
  indexAnalyzer: string;
  synonymMaps: [string];
}

export interface SuggesterSchema {
  name: string;
  searchMode: 'analyzingInfixMatching';
  sourceFields: string[];
}

export interface ScoringProfileSchema {
  name: string;
  text: { weights: { [field: string]: number }; };
  functions: ScoringFunctionSchema[];
  functionAggregation?: 'sum' | 'average' | 'minimum' | 'maximum' | 'firstMatching';
}

export interface ScoringFunctionSchema {
  type: 'magnitude' | 'freshness' | 'distance' | 'tag';
  boost: number;
  fieldName: string;
  interpolation?: 'constant' | 'linear' | 'quadratic' | 'logarithmic';
  magnitude?: MagnitudeFunctionSchema;
  freshness?: FreshnessFunctionSchema;
  distance?: DistanceFunctionSchema;
  tag?: TagFunctionSchema;
}

export interface MagnitudeFunctionSchema {
  boostingRangeStart: number;
  boostingRangeEnd: number;
  constantBoostBeyondRange?: boolean;
}

export interface FreshnessFunctionSchema {
  boostingDuration: string;
}

export interface DistanceFunctionSchema {
  referencePointParameter: string;
  boostingDistance: number;
}

export interface TagFunctionSchema {
  tagsParameter: string;
}
