import { ELEMENT_TYPES, type CanvasElement } from "@/lib/canvas/types";
import { getContentElements } from "@/lib/canvas/scenes";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import type { ElementSnapshot } from "@/lib/generation/queue";
import type { ResolvedElement } from "./types";
import {
	areCaptionsEnabled,
	getLoops,
	getMotion,
	getVolume,
} from "./elementAttributes";

export function resolveElements(
	elements: CanvasElement[],
	getSnapshot: (id: string) => ElementSnapshot,
): ResolvedElement[] {
	const resolved: ResolvedElement[] = [];

	for (const el of getContentElements(elements)) {
		const snapshot = getSnapshot(el.id);
		if (!snapshot.result) continue;

		const spec = ELEMENT_TYPES[el.type];
		const url = getPrimaryUrl(snapshot.result, spec.outputKind);
		if (!url) continue;

		const timestamps = snapshot.result.textTimestamps;
		const captionTimestamps =
			areCaptionsEnabled(el) && timestamps?.length ? timestamps : undefined;

		resolved.push({
			id: el.id,
			type: el.type,
			role: spec.role,
			layer: spec.layer,
			url,
			durationSec: snapshot.result.durationSec,
			loops: getLoops(el),
			volume: getVolume(el),
			motion: getMotion(el),
			captionTimestamps,
		});
	}

	return resolved;
}
