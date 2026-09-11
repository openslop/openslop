import { ANTHROPIC_LLM_MODELS } from "../anthropic/models";

export const OPENSLOP_LLM_MODELS = {
	"Slop LLM v1": ANTHROPIC_LLM_MODELS["Claude Opus 5"],
} as const;
