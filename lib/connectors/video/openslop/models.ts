export const OPENSLOP_VIDEO_MODELS = {
	"Slop Video v1": {
		id: "bytedance:seedance@2.0-fast",
		cost: "high",
		speed: "medium",
		resolutions: ["720p"],
	},
	"Slop Video v1 Fast": {
		id: "klingai:kling-video@3.0-turbo",
		cost: "high",
		speed: "high",
		resolutions: ["720p", "1080p"],
	},
} as const;
