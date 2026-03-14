export const LLM_MODELS = {
  "Slop LLM v1": "claude-sonnet-4-5-20250929",
} as const;
export type LLMModelId = (typeof LLM_MODELS)[keyof typeof LLM_MODELS];
