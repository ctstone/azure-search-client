export interface DataSourceCredentials {
  connectionString: string;
}
export interface DataSourceContainer {
  name: string;
  query?: string;
}
export interface DataSourcePolicy {
  '@odata.type': string;
  [key: string]: any;
}
export interface DataSourceSchema {
  name: string;
  description?: string;
  type: 'azuresql' | 'documentdb' | 'azureblob' | 'azuretable';
  credentials: DataSourceCredentials;
  container: DataSourceContainer;
  dataChangeDetectionPolicy?: DataSourcePolicy;
  dataDeletionDetectionPolicy?: DataSourcePolicy;
}
