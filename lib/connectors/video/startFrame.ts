import { LinkedOff, LinkedOn } from "@/components/ui/icon";
import type { AttributeDef } from "../attributes/schema";

export const START_FRAME_ATTR = "startFrame";
export const PREVIOUS_VISUAL = "previous";
export const NO_FRAME = "none";

/** Where a video's first frame comes from: the visual before it, or a picture by URL. */
export type StartFrame = { kind: "previous" } | { kind: "url"; url: string };

export function parseStartFrame(
	value: string | undefined,
): StartFrame | undefined {
	const trimmed = value?.trim();
	if (!trimmed || trimmed === NO_FRAME) return undefined;
	if (trimmed === PREVIOUS_VISUAL) return { kind: "previous" };
	return { kind: "url", url: trimmed };
}

export const startFrameDef: AttributeDef = {
	key: START_FRAME_ATTR,
	label: "Start frame",
	edit: { kind: "frame" },
	default: NO_FRAME,
};

export const CONTINUITY_ATTR = "continuity";

/** Shows the video the pictures of the visual before it, so its place and look carry over. Set from the reference images control. */
export const continuityDef: AttributeDef = {
	key: CONTINUITY_ATTR,
	label: "Continuity",
	edit: {
		kind: "toggle",
		off: { icon: LinkedOff, label: "Fresh look" },
		on: { icon: LinkedOn, label: "Keep the previous scene's look" },
	},
	default: "true",
	hidden: true,
};

export const hasContinuity = (value: string | undefined): boolean =>
	value === "true";

/** A video opening on the visual before it starts from its last picture, which leaves the rest to reference. */
export const splitPrevious = <T>(
	pictures: readonly T[],
	opensOnPrevious: boolean,
) => ({
	startFrame: opensOnPrevious ? pictures.slice(-1) : [],
	rest: opensOnPrevious ? pictures.slice(0, -1) : [...pictures],
});

export const UPLOADED_FRAME_ATTR = "uploadedFrame";

/** The picture the user uploaded, kept while the video element opens on the visual before it so it can be chosen again. */
export const uploadedFrameDef: AttributeDef = {
	key: UPLOADED_FRAME_ATTR,
	label: "Uploaded picture",
	hidden: true,
};
