import { ELEMENT_TYPES, type CanvasElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { getPromptText } from "@/lib/generation/inputs";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import type { ResolvedElement } from "./types";
import { getLoops, getMotion, getVolume } from "./elementAttributes";

export function resolveElements(
	elements: CanvasElement[],
	getSnapshot: (id: string) => ElementSnapshot,
	{ captionsEnabled }: { captionsEnabled: boolean },
): ResolvedElement[] {
	const resolved: ResolvedElement[] = [];
	let sceneNumber = 0;

	for (const scene of elements) {
		if (!isSceneElement(scene)) continue;
		sceneNumber += 1;

		for (const el of scene.children) {
			const snapshot = getSnapshot(el.id);
			if (!snapshot.result) continue;

			const spec = ELEMENT_TYPES[el.type];
			const url = getPrimaryUrl(snapshot.result, spec.outputKind);
			if (!url) continue;

			const timestamps = snapshot.result.textTimestamps;
			const captionTimestamps =
				captionsEnabled && timestamps?.length ? timestamps : undefined;

			resolved.push({
				id: el.id,
				type: el.type,
				role: spec.role,
				layer: spec.layer,
				sceneId: scene.id,
				sceneNumber,
				prompt: getPromptText(el),
				url,
				durationSec: snapshot.result.durationSec,
				loops: getLoops(el),
				volume: getVolume(el),
				motion: getMotion(el),
				captionTimestamps,
			});
		}
	}

	return resolved;
}
