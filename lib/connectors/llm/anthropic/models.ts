export const ANTHROPIC_LLM_MODELS = {
	"Claude Opus 5": { id: "claude-opus-5", cost: "high", speed: "low" },
	"Claude Sonnet 5": { id: "claude-sonnet-5", cost: "medium", speed: "medium" },
	"Claude Haiku 4.5": {
		id: "claude-haiku-4-5-20251001",
		cost: "low",
		speed: "high",
	},
} as const;
