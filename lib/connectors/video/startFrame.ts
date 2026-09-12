import { ImagePlus } from "@/components/ui/icon";
import type { AttributeDef } from "../attributes/schema";

export const START_FRAME_ATTR = "startFrame";

/** Where a clip's first frame comes from: another visual on the canvas, or a picture by URL. */
export type StartFrame =
	| { kind: "element"; id: string }
	| { kind: "url"; url: string };

export function parseStartFrame(
	value: string | undefined,
): StartFrame | undefined {
	const trimmed = value?.trim();
	if (!trimmed) return undefined;
	return trimmed.includes("://")
		? { kind: "url", url: trimmed }
		: { kind: "element", id: trimmed };
}

/** No default: an absent value is a clip that opens on whatever the model imagines. */
export const startFrameDef: AttributeDef = {
	key: START_FRAME_ATTR,
	label: "Start frame",
	icon: ImagePlus,
	edit: { kind: "frame" },
};
