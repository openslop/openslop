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

/** Linked, a video references the pictures of the visual before it, so its place and look carry over. Set from the reference images control. */
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

/** The frames a video hands on, named, by how far through it they sit. */
export const FRAMES = {
	first: { name: "Beginning", at: 0 },
	middle: { name: "Middle", at: 0.5 },
	last: { name: "End", at: 1 },
} as const;

export type FrameKey = keyof typeof FRAMES;

/** Opening on the visual before, a video starts from its end. */
export const START_FRAME: FrameKey = "last";

/** The frames a linked video references: the end is left to the start frame. */
export const CONTINUITY_FRAMES: readonly FrameKey[] = ["first", "middle"];

export const UPLOADED_FRAME_ATTR = "uploadedFrame";

/** The picture the user uploaded, kept while the video element opens on the visual before it so it can be chosen again. */
export const uploadedFrameDef: AttributeDef = {
	key: UPLOADED_FRAME_ATTR,
	label: "Uploaded picture",
	hidden: true,
};

/** Opening on a picture of its own, which stays selectable so choosing another does not lose it. */
export const openingOn = (picture: string): Record<string, string> => ({
	[START_FRAME_ATTR]: picture,
	[UPLOADED_FRAME_ATTR]: picture,
});
