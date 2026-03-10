export const LLM_MODELS = ["claude-sonnet-4-5-20250929"] as const;
export type LLMModelId = (typeof LLM_MODELS)[number];
