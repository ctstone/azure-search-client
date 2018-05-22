import { ListResults } from "../../types";
import { Document } from './search';

export interface IndexingResult {
  key: string;
  status: boolean;
  errorMessage: string;
}

export interface IndexingResults extends ListResults<IndexingResult> {
}

export interface IndexDocument extends Document {
  '@search.action'?: 'upload' | 'merge' | 'mergeOrUpload' | 'delete';
}
