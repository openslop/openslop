import type { AttributeDef } from "../attributes/schema";

export const START_FRAME_ATTR = "startFrame";
export const PREVIOUS_VISUAL = "previous";
export const NO_FRAME = "none";

/**
 * Where a video's first frame comes from: the visual before it, a picture by
 * URL, or a visual named by id (not offered yet, but the plumbing takes it).
 */
export type StartFrame =
	| { kind: "previous" }
	| { kind: "url"; url: string }
	| { kind: "element"; id: string };

export function parseStartFrame(
	value: string | undefined,
): StartFrame | undefined {
	const trimmed = value?.trim();
	if (!trimmed || trimmed === NO_FRAME) return undefined;
	if (trimmed === PREVIOUS_VISUAL) return { kind: "previous" };
	return trimmed.includes("://")
		? { kind: "url", url: trimmed }
		: { kind: "element", id: trimmed };
}

export const startFrameDef: AttributeDef = {
	key: START_FRAME_ATTR,
	label: "Start frame",
	edit: { kind: "frame" },
	default: PREVIOUS_VISUAL,
};

export const UPLOADED_FRAME_ATTR = "uploadedFrame";

/** The picture the user uploaded, kept while the video element opens on the visual before it so it can be chosen again. */
export const uploadedFrameDef: AttributeDef = {
	key: UPLOADED_FRAME_ATTR,
	label: "Uploaded picture",
	hidden: true,
};
