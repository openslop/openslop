import { AttributeSchema } from "../attributes/schema";
import { durationDef, motionDef } from "../attributes/common";

export const ANIMATED_IMAGE_ATTRIBUTES = AttributeSchema.from([
	{
		key: "videoPrompt",
		label: "Video prompt",
		edit: {
			kind: "text",
			placeholder: "Describe the camera or subject motion…",
			rows: 3,
		},
		default: "slow cinematic pan",
	},
	durationDef("10"),
	motionDef("none"),
]);
