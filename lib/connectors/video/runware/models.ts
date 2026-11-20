import { STANDARD_MAX_DURATION_SEC } from "@/lib/canvas/types";

const ANIMATION =
	"Best for animation and anything that isn't live action. Characters speak many languages.";

const ANY_STYLE =
	"Works for live action and animation. Characters speak many languages.";

const LIVE_ACTION =
	"Best for live action. Characters can only speak English, Chinese, Japanese, Korean or Spanish.";

export const RUNWARE_VIDEO_MODELS = {
	"Seedance 2 Fast": {
		id: "bytedance:seedance@2.0-fast",
		cost: "high",
		speed: "medium",
		resolutions: ["720p"],
		maxDurationSec: STANDARD_MAX_DURATION_SEC,
		description: ANIMATION,
	},
	"Seedance 2.5": {
		id: "bytedance:seedance@2.5",
		cost: "high",
		speed: "low",
		resolutions: ["720p", "1080p"],
		maxDurationSec: 30,
		description: ANIMATION,
	},
	"Kling 3 Omni": {
		id: "klingai:kling-video@o3-standard",
		cost: "high",
		speed: "low",
		resolutions: ["720p"],
		maxDurationSec: STANDARD_MAX_DURATION_SEC,
		description: LIVE_ACTION,
	},
	"Kling 3 Omni Pro": {
		id: "klingai:kling-video@o3-pro",
		cost: "high",
		speed: "low",
		resolutions: ["1080p"],
		maxDurationSec: STANDARD_MAX_DURATION_SEC,
		description: LIVE_ACTION,
	},
	"Kling 4 Omni": {
		id: "klingai:kling-video@4.0",
		cost: "high",
		speed: "low",
		resolutions: ["720p", "1080p"],
		maxDurationSec: STANDARD_MAX_DURATION_SEC,
		description: ANY_STYLE,
	},
} as const;
