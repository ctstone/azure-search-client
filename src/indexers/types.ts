import { IndexingResult } from "../indexes/types";
import { Options } from "../types";

export interface IndexerSchedule {
  interval: string;
  startTime?: string;
}

export interface IndexerParameters {
  maxFailedItems?: number;
  maxFailedItemsPerBatch?: number;
  batchSize?: number;
}

export interface IndexerFieldMapping {
  sourceFieldName: string;
  targetFieldName: string;
  mappingFunction?: IndexerMappingFunction;
}

export interface IndexerMappingFunction {
  name: string;
  parameters?: Options;
}

export interface IndexerSchema {
  name: string;
  description?: string;
  dataSourceName: string;
  targetIndexName: string;
  schedule?: IndexerSchedule;
  parameters?: IndexerParameters;
  fieldMappings?: IndexerFieldMapping[];
  disabled?: boolean;
}

export interface IndexerResult {
  status: string;
  errorMessage: string;
  startTime: string;
  endTime: string;
  errors: IndexerError[];
  warnings: IndexerWarning[];
  itemsProcessed: number;
  itemsFailed: number;
  initialTrackingState: any;
  finalTrackingState: any;
}
export interface IndexerError extends IndexingResult {
  statusCode: number;
}
export interface IndexerWarning {
  key: string;
  message: string;
}
export interface IndexerStatusResult {
  status: string;
  lastResult: IndexerResult;
  executionHistory: IndexerResult[];
}
