/**
 * How a model trades off against its siblings, so a picker can say why to
 * choose one. Relative within a connector type, never an absolute measure.
 */
export type Tier = "low" | "medium" | "high";

export type ModelMeta = {
	/** What a generation costs. Lower is cheaper. */
	cost: Tier;
	/** How quickly it returns. Higher is faster. */
	speed: Tier;
};

/** Keyed by model name, which is unique across every catalog. */
export const MODEL_META: Record<string, ModelMeta> = {
	"Slop LLM v1": { cost: "high", speed: "low" },
	"Claude Opus 5": { cost: "high", speed: "low" },
	"Claude Sonnet 5": { cost: "medium", speed: "medium" },
	"Claude Haiku 4.5": { cost: "low", speed: "high" },
	"Slop Image v1": { cost: "low", speed: "high" },
	"Seedream 5 Lite": { cost: "low", speed: "high" },
	"Slop Video v1": { cost: "high", speed: "medium" },
	"Seedance 2 Fast": { cost: "high", speed: "medium" },
	"Slop TTS v1": { cost: "low", speed: "high" },
	"Sonic 3.5": { cost: "low", speed: "high" },
	"Slop SFX v1": { cost: "low", speed: "high" },
	"Eleven Text to Sound v2": { cost: "low", speed: "high" },
	"Slop Music v1": { cost: "medium", speed: "medium" },
	"Eleven Music v1": { cost: "medium", speed: "medium" },
};
