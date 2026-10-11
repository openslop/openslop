export const RUNWARE_VIDEO_MODELS = {
	"Seedance 2 Fast": {
		id: "bytedance:seedance@2.0-fast",
		cost: "high",
		speed: "medium",
		resolutions: ["720p"],
	},
	"Kling 3 Turbo": {
		id: "klingai:kling-video@3.0-turbo",
		cost: "high",
		speed: "high",
		resolutions: ["720p", "1080p"],
	},
	"Kling 3 Omni": {
		id: "klingai:kling-video@o3-standard",
		cost: "high",
		speed: "medium",
		resolutions: ["720p"],
	},
} as const;
