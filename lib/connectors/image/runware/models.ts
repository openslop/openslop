export const RUNWARE_IMAGE_MODELS = {
	"Muse Image": {
		id: "meta:muse@image",
		cost: "low",
		speed: "high",
		resolutions: ["1152p"],
		description:
			"Best for top image quality and clean, legible text in images.",
	},
	"Seedream 5 Lite": {
		id: "bytedance:seedream@5.0-lite",
		cost: "low",
		speed: "high",
		resolutions: ["1440p"],
		description:
			"A fast all-rounder that follows detailed prompts and renders at a higher resolution.",
	},
	"Grok Imagine 2.0": {
		id: "xai:grok-imagine@image-2.0",
		cost: "medium",
		speed: "high",
		resolutions: ["720p"],
		description:
			"xAI's image model, strong at prompt-faithful scenes and edits from a reference image.",
	},
	"GPT Image 2.6 Sunburst": {
		id: "openai:gpt-image@2.6-sunburst",
		cost: "medium",
		speed: "low",
		resolutions: ["1152p", "1440p"],
		description:
			"OpenAI's image model, best for detailed compositions and precise edits from reference images.",
	},
} as const;
