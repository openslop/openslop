export const ANTHROPIC_LLM_MODELS = {
	"Claude Opus 5": {
		id: "claude-opus-5",
		cost: "high",
		speed: "low",
		description: "Best for the strongest writing and storytelling.",
	},
	"Claude Sonnet 5": {
		id: "claude-sonnet-5",
		cost: "medium",
		speed: "medium",
		description:
			"A balance of writing quality and speed for everyday script work.",
	},
	"Claude Haiku 4.5": {
		id: "claude-haiku-4-5-20251001",
		cost: "low",
		speed: "high",
		description:
			"Best for quick, simple edits where speed matters more than polish.",
	},
} as const;
