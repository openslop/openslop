export const LLM_MODELS = {
	"Slop LLM v1": "claude-opus-5",
} as const;

export type LLMModelName = keyof typeof LLM_MODELS;

export function isLLMModelName(name: string): name is LLMModelName {
	return name in LLM_MODELS;
}
