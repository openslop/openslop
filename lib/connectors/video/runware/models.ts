const ANIMATION = "Best for animation and anything that isn't live action.";

const LIVE_ACTION =
	"Best for live action. Characters can only speak English, Chinese, Japanese, Korean or Spanish.";

export const RUNWARE_VIDEO_MODELS = {
	"Seedance 2 Fast": {
		id: "bytedance:seedance@2.0-fast",
		cost: "high",
		speed: "medium",
		resolutions: ["720p"],
		description: ANIMATION,
	},
	"Seedance 2.5": {
		id: "bytedance:seedance@2.5",
		cost: "high",
		speed: "low",
		resolutions: ["720p", "1080p"],
		description: ANIMATION,
	},
	"Kling 3 Turbo": {
		id: "klingai:kling-video@3.0-turbo",
		cost: "high",
		speed: "high",
		resolutions: ["720p", "1080p"],
		description:
			"Best for drafts and rapid iteration, before a slower final pass.",
	},
	"Kling 3 Omni": {
		id: "klingai:kling-video@o3-standard",
		cost: "high",
		speed: "low",
		resolutions: ["720p"],
		description: LIVE_ACTION,
	},
	"Kling 3 Omni Pro": {
		id: "klingai:kling-video@o3-pro",
		cost: "high",
		speed: "low",
		resolutions: ["1080p"],
		description: LIVE_ACTION,
	},
} as const;
