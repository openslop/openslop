import { LinkedOff, LinkedOn } from "@/components/ui/icon";
import type { AttributeDef } from "../attributes/schema";

export const START_FRAME_ATTR = "startFrame";
export const PREVIOUS_VISUAL = "previous";
export const NO_FRAME = "none";

export const startFrameDef: AttributeDef = {
	key: START_FRAME_ATTR,
	label: "Start frame",
	edit: { kind: "frame" },
	default: NO_FRAME,
};

export const CONTINUITY_ATTR = "continuity";

/** Hidden because the reference images control sets it. */
export const continuityDef: AttributeDef = {
	key: CONTINUITY_ATTR,
	label: "Continuity",
	edit: {
		kind: "toggle",
		off: { icon: LinkedOff, label: "Unlink for a fresh look" },
		on: { icon: LinkedOn, label: "Link the previous scene's look" },
	},
	default: "true",
	hidden: true,
};

/** `at` is how far through the video the frame sits. */
export const FRAMES = {
	first: { name: "Beginning", at: 0 },
	middle: { name: "Middle", at: 0.5 },
	last: { name: "End", at: 1 },
} as const;

export type FrameKey = keyof typeof FRAMES;

export const START_FRAME: FrameKey = "last";

/** The end is left to the start frame. */
export const CONTINUITY_FRAMES: readonly FrameKey[] = ["first", "middle"];

export const UPLOADED_FRAME_ATTR = "uploadedFrame";

/** Kept while the video opens on the visual before it, so the upload can be chosen again. */
export const uploadedFrameDef: AttributeDef = {
	key: UPLOADED_FRAME_ATTR,
	label: "Uploaded picture",
	hidden: true,
};

export const openingOn = (picture: string): Record<string, string> => ({
	[START_FRAME_ATTR]: picture,
	[UPLOADED_FRAME_ATTR]: picture,
});
