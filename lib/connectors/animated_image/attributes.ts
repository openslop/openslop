import { Image } from "@/components/ui/icon";
import { AttributeSchema } from "../attributes/schema";
import { formatDef } from "../attributes/common";
import { modelDefs } from "../attributes/model";
import { referenceImagesDef } from "../attributes/referenceImages";
import type { ModelRef } from "../types";
import { clipPlaybackDefs } from "../video/attributes";

/** The still's own model pair, carried beside the animation's. */
export const STILL_MODEL = {
	key: "imageModel",
	providerAttr: "imageProvider",
} as const;

export const animatedImageAttributesFor = (model: ModelRef) =>
	AttributeSchema.from([
		...modelDefs("image", {
			...STILL_MODEL,
			label: "Image model",
			icon: Image,
		}),
		referenceImagesDef,
		formatDef,
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
		...clipPlaybackDefs(model),
	]);
