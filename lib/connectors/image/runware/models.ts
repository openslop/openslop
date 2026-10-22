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
} as const;
