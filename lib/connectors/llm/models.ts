import type { ModelRef, ModelsByProvider } from "../types";
import { ANTHROPIC_LLM_MODELS } from "./anthropic/models";
import { OPENSLOP_LLM_MODELS } from "./openslop/models";

export const LLM_MODELS = {
	"claude-code": {
		"Claude subscription": {
			id: "sonnet",
			cost: "low",
			speed: "medium",
			description:
				"Local Claude Code with your subscription. Sign in under Settings first.",
		},
	},
	openslop: OPENSLOP_LLM_MODELS,
	anthropic: ANTHROPIC_LLM_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_LLM_MODEL: ModelRef = {
	provider: "openslop",
	model: "Claude Opus 5",
};
