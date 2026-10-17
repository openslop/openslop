import compact from "lodash/compact";
import { referenceUrls } from "@/lib/canvas/assets";
import { connectorOf, type CanvasElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { getPromptText } from "@/lib/generation/inputs";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { elementState, type ElementState } from "./element-state";

/** An element's pictures and the prompt behind them, or why there are none to look at. */
export type ElementImage =
	| { ok: true; prompt: string; urls: string[] }
	| { ok: false; reason: string };

const NO_PICTURE: Record<ElementState["state"], string> = {
	ungenerated: "has not been generated yet",
	queued: "is waiting to generate",
	generating: "is still generating",
	failed: "failed to generate",
	generated: "generated no picture",
	stale: "generated no picture",
	pinned: "has no picture uploaded",
};

const pictures = (
	element: CanvasElement,
	urls: string[],
	reason: string,
): ElementImage =>
	urls.length > 0
		? { ok: true, prompt: getPromptText(element), urls }
		: { ok: false, reason };

export function elementImage(
	element: CanvasElement,
	snapshot: ElementSnapshot,
): ElementImage {
	if (element.type === "asset_references")
		return pictures(
			element,
			referenceUrls([element]),
			"has no reference images uploaded",
		);
	if (connectorOf(element.type) !== "image")
		return {
			ok: false,
			reason: `is of type ${element.type}, which holds no picture`,
		};
	const { state, detail } = elementState(element.id, snapshot, null);
	return pictures(
		element,
		compact([getPrimaryUrl(snapshot.result, "image")]),
		compact([NO_PICTURE[state], detail]).join(": "),
	);
}
