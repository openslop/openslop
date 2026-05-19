import type { CanvasElement } from "@/lib/canvas/types";
import { getContentElements } from "@/lib/canvas/scenes";
import type { ElementSnapshot } from "@/lib/generation/queue";
import type { ResolvedElement } from "./types";
import { ELEMENT_ROLES, LAYER_TYPES } from "./types";
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

		const timestamps = snapshot.result.textTimestamps;
		const captionTimestamps =
			areCaptionsEnabled(el) && timestamps?.length ? timestamps : undefined;

		resolved.push({
			id: el.id,
			type: el.type,
			role: ELEMENT_ROLES[el.type],
			layer: LAYER_TYPES[el.type],
			url: snapshot.result.url,
			durationSec: snapshot.result.durationSec,
			loops: getLoops(el),
			volume: getVolume(el),
			motion: getMotion(el),
			captionTimestamps,
		});
	}

	return resolved;
}
