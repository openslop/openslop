import { z } from "zod";
import { LinkedOff, LinkedOn } from "@/components/ui/icon";
import { TOGGLE_OFF } from "@/lib/canvas/types";
import { toggleValue } from "../attributes/common";
import type { AttributeDef } from "../attributes/schema";

export const START_FRAME_ATTR = "startFrame";
export const PREVIOUS_VISUAL = "previous";
export const NO_FRAME = "none";

export type FrameSource =
	| { kind: "none" }
	| { kind: "previous" }
	| { kind: "upload"; url: string };

/** What a start frame value asks the video to open on. */
export function frameSource(frame = NO_FRAME): FrameSource {
	if (frame === PREVIOUS_VISUAL) return { kind: "previous" };
	if (URL.canParse(frame)) return { kind: "upload", url: frame };
	return { kind: "none" };
}

export const startFrameDef: AttributeDef = {
	key: START_FRAME_ATTR,
	label: "Start frame",
	edit: {
		kind: "frame",
		value: z.union([z.enum([NO_FRAME, PREVIOUS_VISUAL]), z.url()]),
	},
	default: NO_FRAME,
};

export const CONTINUITY_ATTR = "continuity";

export const continuityDef: AttributeDef = {
	key: CONTINUITY_ATTR,
	label: "Continuity",
	edit: {
		kind: "toggle",
		value: toggleValue,
		off: { icon: LinkedOff, label: "Unlink for a fresh look" },
		on: { icon: LinkedOn, label: "Link the previous scene's look" },
	},
	default: TOGGLE_OFF,
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
};

export const openingOn = (picture: string): Record<string, string> => ({
	[START_FRAME_ATTR]: picture,
	[UPLOADED_FRAME_ATTR]: picture,
});
