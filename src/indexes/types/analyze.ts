export interface AnalyzeQuery {
  text: string;
  analyzer: string;
  tokenizer?: string;
  tokenFilter?: string[];
  charFilter?: string[];
}

export interface AnalyzeToken {
  token: string;
  startOffset: number;
  endOffset: number;
  position: number;
}

export interface AnalyzeResults {
  tokens: AnalyzeToken[];
}
