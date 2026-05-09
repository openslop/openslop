import type { CanvasElement } from "@/lib/canvas/types";
import { getContentElements } from "@/lib/canvas/scenes";
import type { ElementSnapshot } from "@/lib/generation/queue";
import type { ResolvedElement } from "./types";
import { ELEMENT_ROLES, LAYER_TYPES } from "./types";

export function resolveElements(
	elements: CanvasElement[],
	getSnapshot: (id: string) => ElementSnapshot,
): ResolvedElement[] {
	const resolved: ResolvedElement[] = [];

	for (const el of getContentElements(elements)) {
		const snapshot = getSnapshot(el.id);
		if (!snapshot.result) continue;

		resolved.push({
			id: el.id,
			type: el.type,
			role: ELEMENT_ROLES[el.type],
			layer: LAYER_TYPES[el.type],
			url: snapshot.result.url,
			durationSec: snapshot.result.durationSec,
			loops: Math.max(1, Number(el.customAttributes?.loops) || 1),
		});
	}

	return resolved;
}
