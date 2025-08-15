export type SpellError = {
  type: 'spelling' | 'spacing' | 'grammar' | 'recommendation' | 'etc';
  offset: number;
  length: number;
  message: string;
  suggestion?: string;
};

export type SpellResponse = {
  original_text: string;
  corrected_text: string;
  errors: ReadonlyArray<SpellError> | null;
};
