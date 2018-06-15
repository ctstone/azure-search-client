import { ListResults } from "../../types";
import { IDocument } from './search';

export interface IndexingResult {
  key: string;
  status: boolean;
  errorMessage: string;
}

export interface IndexingResults extends ListResults<IndexingResult> {
}

export interface IndexDocument {
  '@search.action'?: 'upload' | 'merge' | 'mergeOrUpload' | 'delete';
}
