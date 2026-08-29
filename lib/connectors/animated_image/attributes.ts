import { Image } from "@/components/ui/icon";
import { AttributeSchema } from "../attributes/schema";
import { DEFAULT_DURATION } from "@/lib/canvas/types";
import { durationDef, motionDef } from "../attributes/common";
import { modelDef } from "../attributes/model";
import { referenceImagesDef } from "../attributes/referenceImages";

export const ANIMATED_IMAGE_ATTRIBUTES = AttributeSchema.from([
	modelDef("animated_image", { label: "Video model" }),
	modelDef("image", {
		key: "stillModel",
		label: "Image model",
		icon: Image,
	}),
	referenceImagesDef,
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
	durationDef(DEFAULT_DURATION),
	motionDef("none"),
]);
