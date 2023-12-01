export interface Usage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

export interface TokenCountMetadata {
  billableTokens: number;
  unbilledTokens: number;
  billableCharacters: number;
  unbilledCharacters: number;
}

export interface GoogleMetadata {
  inputTokenCount?: TokenCountMetadata;
  outputTokenCount?: TokenCountMetadata;
}

export interface GoogleEmbeddingMetadata {
  tokenCountMetadata?: TokenCountMetadata;
}
