import type { ModelRef, ModelsByProvider } from "../types";
import { ANTHROPIC_LLM_MODELS } from "./anthropic/models";
import { OPENSLOP_LLM_MODELS } from "./openslop/models";

export const BYOK_LLM_MODELS = {
	anthropic: ANTHROPIC_LLM_MODELS,
} satisfies ModelsByProvider;

export const LLM_MODELS = {
	openslop: OPENSLOP_LLM_MODELS,
	...BYOK_LLM_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_LLM_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop LLM v1",
};
