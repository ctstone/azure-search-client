import { ODataOptions } from "../types";

export interface DataSourceCredentials {
  connectionString: string;
}
export interface DataSourceContainer {
  name: string;
  query?: string;
}

export interface DataSourceSchema {
  name: string;
  description?: string;
  type: 'azuresql' | 'documentdb' | 'azureblob' | 'azuretable';
  credentials: DataSourceCredentials;
  container: DataSourceContainer;
  dataChangeDetectionPolicy?: ODataOptions;
  dataDeletionDetectionPolicy?: ODataOptions;
}
